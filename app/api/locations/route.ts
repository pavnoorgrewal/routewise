import { NextRequest, NextResponse } from 'next/server'
import locations from '@/data/us-locations.json'

type Location = (typeof locations)[number]

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

function formatLocation(location: Location) {
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
    type: location.type,
  }
}

export function GET(request: NextRequest) {
  const query = normalize(request.nextUrl.searchParams.get('q')?.slice(0, 80) ?? '')

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

  return NextResponse.json(matches.slice(0, 8).map(({ location }) => formatLocation(location)))
}
