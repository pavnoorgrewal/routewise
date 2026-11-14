type PhotonFeature = {
  properties: {
    name?: string
    housenumber?: string
    street?: string
    city?: string
    locality?: string
    state?: string
    postcode?: string
    countrycode?: string
    osm_key?: string
    osm_value?: string
  }
}

export type PlaceMatch = {
  name: string
  address: string | null
  area: string
  kind: string | null
}

type NominatimPlace = {
  name?: string
  type?: string
  address?: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country_code?: string
  }
}

const fallbackCache = new Map<string, { expiresAt: number; places: PlaceMatch[] }>()
let fallbackQueue = Promise.resolve()
let lastFallbackAt = 0

function searchNominatim(query: string): Promise<PlaceMatch[]> {
  const cached = fallbackCache.get(query)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.places)
  const task = fallbackQueue.then(async () => {
    const delay = Math.max(0, lastFallbackAt + 1100 - Date.now())
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    lastFallbackAt = Date.now()
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', query.slice(0, 120))
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('countrycodes', 'us')
    url.searchParams.set('limit', '5')
    const response = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Routewise/1.0 (https://github.com/pavnoorgrewal/routewise)' },
      next: { revalidate: 86_400 },
    })
    if (!response.ok) throw new Error('Fallback place lookup unavailable')
    const data = (await response.json()) as NominatimPlace[]
    const places = data.flatMap<PlaceMatch>((place) => {
      const address = place.address
      if (!place.name || address?.country_code !== 'us') return []
      const area = [address.city || address.town || address.village, address.state].filter(Boolean).join(', ')
      if (!area) return []
      return [{
        name: place.name,
        address: address.house_number && address.road
          ? `${address.house_number} ${address.road}, ${area}${address.postcode ? ` ${address.postcode}` : ''}`
          : null,
        area,
        kind: place.type ?? null,
      }]
    })
    if (fallbackCache.size > 300) fallbackCache.delete(fallbackCache.keys().next().value!)
    fallbackCache.set(query, { places, expiresAt: Date.now() + 86_400_000 })
    return places
  })
  fallbackQueue = task.then(() => undefined, () => undefined)
  return task
}

// Share the same OpenStreetMap-backed place source as location autocomplete.
// Only return a street address when the source actually supplies a number and street.
export async function searchPlaces(query: string): Promise<PlaceMatch[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query.slice(0, 120))
  url.searchParams.set('countrycode', 'US')
  url.searchParams.set('limit', '8')
  url.searchParams.set('lang', 'en')

  let data: { features?: PhotonFeature[] }
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      headers: { 'User-Agent': 'Routewise/1.0 (https://github.com/pavnoorgrewal/routewise)' },
      next: { revalidate: 86_400 },
    })
    if (!response.ok) throw new Error('Place lookup unavailable')
    data = (await response.json()) as { features?: PhotonFeature[] }
  } catch {
    return searchNominatim(query)
  }

  const matches = (data.features ?? []).flatMap<PlaceMatch>(({ properties: place }) => {
    if (place.countrycode !== 'US' || !place.name || place.osm_key === 'place') return []
    const city = place.city || place.locality
    const area = [city, place.state].filter(Boolean).join(', ')
    if (!area) return []
    const street = [place.housenumber, place.street].filter(Boolean).join(' ')
    return [{
      name: place.name,
      address: place.housenumber && place.street
        ? `${street}, ${area}${place.postcode ? ` ${place.postcode}` : ''}`
        : null,
      area,
      kind: place.osm_value ?? place.osm_key ?? null,
    }]
  })

  const unique = matches.filter((match, index) =>
    matches.findIndex((other) =>
      other.name === match.name && other.address === match.address && other.area === match.area,
    ) === index,
  ).slice(0, 5)
  return unique.some((match) => match.address) ? unique : searchNominatim(query)
}
