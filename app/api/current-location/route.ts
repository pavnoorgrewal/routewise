import { NextResponse } from 'next/server'

type ReverseResult = {
  address?: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
  }
}

const cache = new Map<string, { address: string | null; expiresAt: number }>()
let queue = Promise.resolve()
let lastRequestAt = 0

export async function POST(request: Request) {
  let latitude: number
  let longitude: number
  try {
    const body = await request.json() as { latitude?: unknown; longitude?: unknown }
    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }
    latitude = Number(body.latitude)
    longitude = Number(body.longitude)
  } catch {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json({ address: cached.address })

  const task = queue.then(async () => {
    const delay = Math.max(0, lastRequestAt + 1100 - Date.now())
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    lastRequestAt = Date.now()

    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('lat', latitude.toFixed(6))
    url.searchParams.set('lon', longitude.toFixed(6))
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('layer', 'address')
    url.searchParams.set('zoom', '18')
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Routewise/1.0 (https://github.com/pavnoorgrewal/routewise)' },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('Reverse geocoding unavailable')
    const result = await response.json() as ReverseResult
    const parts = result.address
    const city = parts?.city ?? parts?.town ?? parts?.village
    const address = parts?.house_number && parts.road && city && parts.state
      ? `${parts.house_number} ${parts.road}, ${city}, ${parts.state}${parts.postcode ? ` ${parts.postcode}` : ''}`
      : null
    if (cache.size > 300) cache.delete(cache.keys().next().value!)
    cache.set(key, { address, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
    return address
  })
  queue = task.then(() => undefined, () => undefined)

  try {
    return NextResponse.json({ address: await task })
  } catch {
    return NextResponse.json({ address: null }, { status: 502 })
  }
}
