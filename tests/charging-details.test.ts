import assert from 'node:assert/strict'
import { test } from 'node:test'
import { powerKw, compareCharging, enrichChargers } from '../lib/charging-details'
import type { PlaceMatch } from '../lib/place-search'

test('power units are converted and unverified values stay unknown', () => {
  assert.equal(powerKw('250 kW'), 250)
  assert.equal(powerKw('50000 W'), 50)
  assert.equal(powerKw('0.35 MW'), 350)
  assert.equal(powerKw('150'), 150)
  assert.equal(powerKw('unknown'), null)
})
const station = (id: number): PlaceMatch => ({ name: `Charger ${id}`, address: `${id} Main St`, area: 'Test City', kind: 'charging_station', coordinates: [-122, 37], osmId: id, osmType: 'N' })
test('known speed wins over amenities and nearby amenities break speed ties', () => {
  const a = { ...station(1), charging: { maxKw: 150, connectors: [], amenities: [{ name: 'Cafe', type: 'Coffee', distanceMeters: 10 }], source: 'OpenStreetMap' as const } }
  const b = { ...station(2), charging: { ...a.charging, maxKw: 250, amenities: [] } }
  assert.ok(compareCharging(b, a) < 0)
  assert.ok(compareCharging(a, { ...b, charging: { ...b.charging, maxKw: 150 } }) < 0)
})
test('metadata is matched by OSM identity; private amenities and invented speeds are excluded', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ elements: [
    { type: 'node', id: 1, tags: { 'socket:type2_combo:output': '350 kW', 'socket:type2_combo': '4' } },
    { type: 'node', id: 2, tags: {} },
    { type: 'node', id: 3, lat: 37.0001, lon: -122, tags: { amenity: 'restaurant', name: 'Lunch' } },
    { type: 'node', id: 4, lat: 37, lon: -122, tags: { amenity: 'toilets', access: 'private' } },
  ] }))
  try {
    const result = await enrichChargers([station(2), station(1)])
    assert.equal(result[0].osmId, 1)
    assert.equal(result[0].charging?.maxKw, 350)
    assert.equal(result[1].charging?.maxKw, null)
    assert.deepEqual(result[0].charging?.connectors, ['type2_combo'])
    assert.equal(result[0].charging?.amenities.length, 1)
    assert.equal(result[0].charging?.amenities[0].name, 'Lunch')
    globalThis.fetch = async () => { throw new Error('timeout') }
    assert.deepEqual(await enrichChargers([station(1)]), [station(1)])
  } finally { globalThis.fetch = original }
})
