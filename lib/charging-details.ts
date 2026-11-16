import type { PlaceMatch } from './place-search'

export type ChargerDetails = {
  maxKw: number | null
  connectors: string[]
  amenities: { name: string; type: string; distanceMeters: number }[]
  source: 'OpenStreetMap'
}
type Element = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }

export function powerKw(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(kW|W|MW)?$/i)
  if (!match) return null
  const power = Number(match[1]) * (match[2]?.toLowerCase() === 'w' ? .001 : match[2]?.toLowerCase() === 'mw' ? 1000 : 1)
  return power > 0 && power <= 1500 ? power : null
}
function distance(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180
  const h = Math.sin((a[1] - b[1]) * rad / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin((a[0] - b[0]) * rad / 2) ** 2
  return Math.round(12742000 * Math.asin(Math.sqrt(h)))
}
export function compareCharging(a: PlaceMatch, b: PlaceMatch) {
  const speed = (b.charging?.maxKw ?? -1) - (a.charging?.maxKw ?? -1)
  if (speed) return speed
  const nearest = (p: PlaceMatch) => Math.min(...(p.charging?.amenities.map(a => a.distanceMeters) ?? []), Infinity)
  return (nearest(a) === nearest(b)) ? 0 : nearest(a) - nearest(b)
}

export async function enrichChargers(places: PlaceMatch[]): Promise<PlaceMatch[]> {
  const chargers = places.filter(p => /charging_station/.test(p.kind ?? '') && p.coordinates && p.osmId && /^[NWR]$/.test(p.osmType ?? '')).slice(0, 5)
  if (!chargers.length) return places
  const types: Record<string, string> = { N: 'node', W: 'way', R: 'relation' }
  const queries = chargers.map(p => {
    const [lon, lat] = p.coordinates!
    return `${types[p.osmType!]}(${p.osmId});nwr(around:400,${lat},${lon})[amenity~"^(restaurant|fast_food|cafe|toilets)$"];nwr(around:400,${lat},${lon})[shop=convenience];`
  }).join('')
  try {
    const headers = { 'User-Agent': 'Routewise/1.0 (https://github.com/pavnoorgrewal/routewise)' }
    // Fetch exact station tags alongside the proximity query so an overloaded
    // proximity service cannot hide known charging power.
    const read = async (url: string, options: RequestInit = {}): Promise<Element[]> => {
      try {
        const response = await fetch(url, { ...options, headers, signal: AbortSignal.timeout(3500) })
        if (!response.ok) return []
        return ((await response.json()) as { elements?: Element[] }).elements ?? []
      } catch { return [] }
    }
    const [nearby, ...stationData] = await Promise.all([
      read('https://overpass.private.coffee/api/interpreter', {
        method: 'POST', body: new URLSearchParams({ data: `[out:json][timeout:3];(${queries});out tags center;` }),
      }),
      ...chargers.map(p => read(`https://www.openstreetmap.org/api/0.6/${types[p.osmType!]}/${p.osmId}.json`)),
    ])
    const data = { elements: [...stationData.flat(), ...nearby] }
    const enriched = places.map(p => {
      if (!chargers.includes(p)) return p
      const station = data.elements!.find(e => e.id === p.osmId && e.type === types[p.osmType!])
      if (!station) return p
      const tags = station.tags ?? {}
      const outputs = Object.entries(tags).filter(([key]) => /^socket:[^:]+:output$/.test(key)).map(([, value]) => powerKw(value)).filter((v): v is number => v !== null)
      const amenities = data.elements!.flatMap(e => {
        const t = e.tags ?? {}
        if (t.access === 'private' || t.access === 'no') return []
        const type = t.shop === 'convenience' ? 'Convenience store' : ({ restaurant: 'Restaurant', fast_food: 'Restaurant', cafe: 'Coffee', toilets: 'Restrooms' } as Record<string,string>)[t.amenity]
        const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon
        if (!type || lat === undefined || lon === undefined) return []
        const meters = distance(p.coordinates!, [lon, lat])
        return meters <= 400 ? [{ name: t.name || type, type, distanceMeters: meters }] : []
      }).sort((a,b) => a.distanceMeters - b.distanceMeters).filter((a, i, all) => all.findIndex(b => b.name === a.name && b.type === a.type) === i).slice(0, 5)
      return { ...p, charging: { maxKw: outputs.length ? Math.max(...outputs) : null, connectors: Object.keys(tags).filter(k => /^socket:[^:]+$/.test(k) && tags[k] !== 'no' && tags[k] !== '0').map(k => k.slice(7)), amenities, source: 'OpenStreetMap' as const } }
    })
    // Only reorder charging alternatives, never the final trip's driving order.
    return enriched.every(p => /charging_station/.test(p.kind ?? '')) ? enriched.sort(compareCharging) : enriched
  } catch { return places }
}
