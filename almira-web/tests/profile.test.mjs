import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyProfile, normalizeProfile, normalizeMemories, profileContext, fashionPreferences } from '../supabase/functions/_shared/profile.ts'
import { isAlmiraData, normalizeData } from '../src/types.ts'
import { stateKey } from '../src/storage.ts'
import { parseProfileSnapshot, saveCloudProfile, ProfileSyncError } from '../src/profileSync.ts'
import { buildLocalLooks } from '../src/styleEngine.ts'

const memory = { id: '11111111-1111-4111-8111-111111111111', text: 'Relaxed fits for college', scope: 'College', createdAt: '2026-10-01T00:00:00Z' }
const request = { occasion: 'Everyday', mood: 'Soft & easy', note: '' }
const piece = (id, color, category = 'Tops') => ({ id, color, category, name: id, occasion: 'Everyday', season: 'All year', favorite: false, createdAt: '2026-10-01T00:00:00Z' })

test('all requested fashion interests are optional, valid, and never inferred', () => {
  assert.equal(emptyProfile().fashionPreference, '')
  for (const preference of fashionPreferences) assert.equal(normalizeProfile({ fashionPreference: preference }).fashionPreference, preference)
  assert.equal(normalizeProfile({ gender: 'female', fashionPreference: 'unknown' }).fashionPreference, '')
})
test('bounded profile normalization drops unsupported data and duplicates', () => {
  const profile = normalizeProfile({ displayName: 'A'.repeat(100), favoriteColors: ['Lilac', 'Lilac', 5], styles: ['Classic', 'invented'], brands: Array.from({ length: 50 }, (_, i) => String(i)), personalization: false })
  assert.equal(profile.displayName.length, 40)
  assert.deepEqual(profile.favoriteColors, ['Lilac'])
  assert.deepEqual(profile.styles, ['Classic'])
  assert.equal(profile.brands.length, 12)
  assert.equal(profile.personalization, false)
})
test('memory retrieval respects occasion, opt-out and identity minimization', () => {
  const profile = { ...emptyProfile(), displayName: 'Private name' }
  assert.deepEqual(profileContext(profile, [memory], 'Work').confirmedMemories, [])
  assert.equal(profileContext(profile, [memory], 'College').confirmedMemories[0].text, memory.text)
  assert.equal(JSON.stringify(profileContext(profile, [memory], 'College')).includes('Private name'), false)
  assert.equal(profileContext({ ...profile, personalization: false }, [memory], 'College'), null)
  assert.deepEqual(normalizeMemories([memory, memory, { ...memory, id: 'broken' }]), [memory])
})
test('old wardrobe backups retain garments and initialize a neutral profile', () => {
  const legacy = { garments: [piece('shirt', 'Lilac')], outfits: [], wears: [] }
  assert.ok(isAlmiraData(legacy))
  assert.deepEqual(normalizeData(legacy).garments, legacy.garments)
  assert.equal(normalizeData(legacy).profile.fashionPreference, '')
  assert.deepEqual(normalizeData(legacy).memories, [])
  assert.equal(isAlmiraData({ ...legacy, profile: 'invalid' }), false)
})
test('guest and different account caches never share a storage key', () => {
  assert.equal(stateKey(), 'state')
  assert.notEqual(stateKey('account-a'), stateKey('account-b'))
  assert.notEqual(stateKey('account-a'), stateKey())
})
test('local color preferences respect explicit avoids, anchors and opt-out', () => {
  const garments = [piece('navy', 'Navy'), piece('lilac', 'Lilac'), piece('dress', 'Lilac', 'Dresses')]
  const profile = { ...emptyProfile(), favoriteColors: ['Navy'], avoidedColors: ['Navy'], fashionPreference: 'Menswear' }
  const looks = buildLocalLooks(garments, request, {}, profile)
  assert.ok(looks.every(look => !look.itemIds.includes('navy')))
  assert.ok(looks.some(look => look.itemIds.includes('dress')))
  assert.deepEqual(buildLocalLooks(garments, { ...request, anchorId: 'navy' }, {}, profile), [])
  assert.ok(buildLocalLooks(garments, { ...request, anchorId: 'navy' }, {}, { ...profile, personalization: false })[0].itemIds.includes('navy'))
})
test('cloud snapshots and saves reject malformed revisions and preserve conflict errors', async () => {
  for (const value of [null, { revision: -1, profile: {}, memories: [] }, { revision: 1, profile: 'bad', memories: [] }]) assert.throws(() => parseProfileSnapshot(value))
  const calls = []
  const client = { rpc: async (name, values) => { calls.push({ name, values }); return { data: 3, error: null } } }
  assert.equal(await saveCloudProfile(client, emptyProfile(), [memory], 2), 3)
  assert.equal(calls[0].values.expected_revision, 2)
  assert.equal(calls[0].values.user_id, undefined)
  await assert.rejects(saveCloudProfile({ rpc: async () => ({ data: null, error: { code: '40001' } }) }, emptyProfile(), [], 2), error => error instanceof ProfileSyncError && error.kind === 'conflict')
})
