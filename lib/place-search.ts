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

// Share the same OpenStreetMap-backed place source as location autocomplete.
// Only return a street address when the source actually supplies a number and street.
export async function searchPlaces(query: string): Promise<PlaceMatch[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query.slice(0, 120))
  url.searchParams.set('countrycode', 'US')
  url.searchParams.set('limit', '8')
  url.searchParams.set('lang', 'en')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(4500),
    headers: { 'User-Agent': 'Routewise/1.0 (https://github.com/pavnoorgrewal/routewise)' },
    next: { revalidate: 86_400 },
  })
  if (!response.ok) throw new Error('Place lookup unavailable')
  const data = (await response.json()) as { features?: PhotonFeature[] }

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

  return matches.filter((match, index) =>
    matches.findIndex((other) =>
      other.name === match.name && other.address === match.address && other.area === match.area,
    ) === index,
  ).slice(0, 5)
}
