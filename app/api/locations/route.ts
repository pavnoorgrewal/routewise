import { NextRequest, NextResponse } from 'next/server'
import locations from '@/data/us-locations.json'

type Location = (typeof locations)[number]
type Suggestion = {
  label: string
  detail: string
  value: string
  type: 'city' | 'airport' | 'park' | 'place' | 'business' | 'address'
}

type PhotonFeature = {
  properties: {
    name?: string
    housenumber?: string
    street?: string
    city?: string
    locality?: string
    county?: string
    state?: string
    countrycode?: string
    type?: string
    osm_key?: string
  }
}

type CensusMatch = { matchedAddress?: string }

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const searchable = locations.map((location) => ({
  location,
  name: normalize(location.name),
  city: normalize('city' in location ? String(location.city) : ''),
  code: 'code' in location ? String(location.code).toLowerCase() : '',
  state: normalize(location.state),
}))

const popularCities = [
  'San Francisco', 'Los Angeles', 'New York City', 'Las Vegas',
  'Seattle', 'Chicago', 'San Diego', 'Miami',
]

function formatLocation(location: Location): Suggestion {
  if (location.type === 'airport') {
    return {
      label: `${location.code} · ${location.name}`,
      detail: `${location.city ? `${location.city}, ` : ''}${location.state} · Airport`,
      value: `${location.name} (${location.code}), ${location.state}`,
      type: location.type,
    }
  }

  return {
    label: location.name,
    detail: location.type === 'place' ? `${location.state} · National park` : `${location.state} · City`,
    value: `${location.name}, ${location.state}`,
    type: location.type === 'place' ? 'park' : location.type,
  }
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\b(Nw|Ne|Sw|Se)\b/g, (direction) => direction.toUpperCase())
}

async function searchCensus(query: string): Promise<Suggestion[]> {
  const url = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress')
  url.searchParams.set('address', query)
  url.searchParams.set('benchmark', 'Public_AR_Current')
  url.searchParams.set('format', 'json')

  const response = await fetch(url, { signal: AbortSignal.timeout(3500) })
  if (!response.ok) return []
  const data = await response.json() as { result?: { addressMatches?: CensusMatch[] } }

  return (data.result?.addressMatches ?? []).slice(0, 3).flatMap((match) => {
    const [street, city, state, zip] = match.matchedAddress?.split(',').map((part) => part.trim()) ?? []
    if (!street || !city || !state) return []
    const label = titleCase(street)
    const location = `${titleCase(city)}, ${state}${zip ? ` ${zip}` : ''}`
    return [{ label, detail: `${location} · Address`, value: `${label}, ${location}`, type: 'address' as const }]
  })
}

async function searchPhoton(query: string): Promise<Suggestion[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('countrycode', 'US')
  url.searchParams.set('limit', '8')
  url.searchParams.set('lang', 'en')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(3500),
    headers: { 'User-Agent': 'Routewise/1.0 (https://github.com/pavnoorgrewal/routewise)' },
  })
  if (!response.ok) return []
  const data = await response.json() as { features?: PhotonFeature[] }

  return (data.features ?? []).flatMap<Suggestion>(({ properties: place }) => {
    if (place.countrycode !== 'US') return []

    const streetAddress = [place.housenumber, place.street].filter(Boolean).join(' ')
    const city = place.city || place.locality || place.county
    const region = [city, place.state].filter(Boolean).join(', ')
    if (!region) return []

    if (place.osm_key === 'place' && place.type === 'city') return []

    const business = ['amenity', 'shop', 'office', 'tourism', 'leisure'].includes(place.osm_key ?? '')
    if (business && place.name) {
      const description = [streetAddress, region].filter(Boolean).join(', ')
      return [{
        label: place.name,
        detail: `${description} · Place`,
        value: [place.name, streetAddress, region].filter(Boolean).join(', '),
        type: 'business' as const,
      }]
    }

    if (place.housenumber && place.street) {
      return [{
        label: streetAddress,
        detail: `${region} · Address`,
        value: `${streetAddress}, ${region}`,
        type: 'address' as const,
      }]
    }

    if (!place.name) return []
    return [{
      label: place.name,
      detail: `${region} · ${place.type === 'street' ? 'Street' : 'Place'}`,
      value: `${place.name}, ${region}`,
      type: 'place' as const,
    }]
  })
}

const remoteCache = new Map<string, { suggestions: Suggestion[]; expiresAt: number }>()

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get('q')?.trim().slice(0, 120) ?? ''
  const query = normalize(rawQuery)

  if (!query) {
    const suggestions = popularCities
      .map((name) => locations
        .filter((location) => location.type === 'city' && location.name === name)
        .sort((a, b) => ('population' in b ? Number(b.population) : 0) - ('population' in a ? Number(a.population) : 0))[0])
      .filter((location): location is Location => Boolean(location))
      .map(formatLocation)
    return NextResponse.json(suggestions)
  }

  if (query.length < 2) return NextResponse.json([])

  const airportCodes = searchable.filter(({ code }) => code === query)
  if (airportCodes.length) {
    return NextResponse.json(airportCodes.map(({ location }) => formatLocation(location)))
  }

  const matches = searchable.flatMap(({ location, name, city, code, state }) => {
    let score = 0
    if (code === query) score = 10000
    else if (name === query) score = 8000
    else if (name.startsWith(query)) score = 6000
    else if (code.startsWith(query)) score = 5500
    else if (name.split(' ').some((word) => word.startsWith(query))) score = 4000
    else if (city.startsWith(query)) score = 3500
    else if (name.includes(query) || city.includes(query) || `${name} ${state}`.includes(query) || `${city} ${state}`.includes(query)) score = 2000

    if (!score) return []

    const popularity = location.type === 'city' ? Math.min(700, Math.log10(location.population + 1) * 100) : 0
    return [{ location, score: score + popularity }]
  })

  matches.sort((a, b) => b.score - a.score || a.location.name.localeCompare(b.location.name))

  const local = matches.slice(0, 8).map(({ location }) => formatLocation(location))
  if (query.length < 3) return NextResponse.json(local)

  const cached = remoteCache.get(query)
  let remote = cached && cached.expiresAt > Date.now() ? cached.suggestions : undefined
  if (!remote) {
    const addressQuery = /^\d+\s+/.test(rawQuery) && rawQuery.trim().split(/[\s,]+/).length >= 3
    const [census, photon] = await Promise.all([
      addressQuery ? searchCensus(rawQuery).catch(() => []) : Promise.resolve([]),
      searchPhoton(rawQuery).catch(() => []),
    ])
    remote = [...census, ...photon]
    if (remoteCache.size >= 200) remoteCache.delete(remoteCache.keys().next().value!)
    remoteCache.set(query, { suggestions: remote, expiresAt: Date.now() + 5 * 60 * 1000 })
  }

  const ordered = /^\d/.test(rawQuery) ? [...remote, ...local] : [...local, ...remote]
  const seen = new Set<string>()
  const suggestions = ordered.filter((suggestion) => {
    const key = normalize(suggestion.value)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return NextResponse.json(suggestions.slice(0, 8))
}
