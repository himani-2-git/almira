import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLocalLooks, validateLooks } from '../src/styleEngine.ts'
import { parseStyleRequest } from '../supabase/functions/_shared/style-contract.ts'

const item = (id, category, extra = {}) => ({ id, category, name: id, color: '', occasion: '', season: 'All year', favorite: false, createdAt: '2026-09-30', ...extra })
const closet = [item('shirt', 'Tops'), item('blouse', 'Tops'), item('jeans', 'Bottoms'), item('skirt', 'Bottoms'), item('dress', 'Dresses'), item('sneakers', 'Shoes'), item('boots', 'Shoes'), item('coat', 'Outerwear'), item('bag', 'Accessories')]
const request = { occasion: 'Everyday', mood: 'Soft & easy', note: '' }
const look = (itemIds) => ({ title: 'Coffee date', explanation: 'An easy combination.', itemIds })

test('suggestions use owned pieces, are distinct and respect every possible anchor', () => {
  for (const anchor of closet) {
    const looks = buildLocalLooks(closet, { ...request, anchorId: anchor.id })
    assert.ok(looks.length > 0 && looks.length <= 3)
    assert.equal(new Set(looks.map(look => JSON.stringify([...look.itemIds].sort()))).size, looks.length)
    assert.ok(looks.every(look => look.itemIds.includes(anchor.id)))
    assert.deepEqual(validateLooks(looks, closet, anchor.id), looks)
  }
})

test('empty and sparse wardrobes do not invent garments or duplicate combinations', () => {
  assert.deepEqual(buildLocalLooks([], request), [])
  const sparse = [item('shirt', 'Tops')]
  assert.deepEqual(buildLocalLooks(sparse, request).map(look => look.itemIds), [['shirt']])
})

test('occasion and rewear counts change the highest ranked choice', () => {
  const pieces = [item('a', 'Tops', { occasion: 'Work' }), item('b', 'Tops', { occasion: 'Party' }), item('pants', 'Bottoms')]
  assert.ok(buildLocalLooks(pieces, { ...request, occasion: 'Party' })[0].itemIds.includes('b'))
  assert.ok(buildLocalLooks(pieces, request, { a: 10, b: 0 })[0].itemIds.includes('b'))
})

test('foreign IDs, repeated IDs, missed anchors and conflicting categories are rejected', () => {
  for (const ids of [['someone-elses-shirt'], ['shirt', 'shirt'], ['shirt', 'blouse'], ['dress', 'jeans']]) {
    assert.throws(() => validateLooks([look(ids)], closet))
  }
  assert.throws(() => validateLooks([look(['jeans'])], closet, 'shirt'))
  assert.throws(() => validateLooks([look(['shirt'])], closet, 'foreign'))
})

test('malformed, empty, oversized and duplicate responses are rejected', () => {
  for (const response of [null, {}, [], [look([])], [look(['shirt']), look(['shirt'])], Array(4).fill(look(['shirt'])), [{ ...look(['shirt']), title: ' ' }]]) {
    assert.throws(() => validateLooks(response, closet))
  }
})

test('styling requests have bounded text and tags and do not accept client wardrobe data', () => {
  assert.deepEqual(parseStyleRequest({ ...request, garments: [item('foreign', 'Tops')], userId: 'foreign' }), { ...request, anchorId: undefined, trendTags: undefined })
  for (const bad of [{ ...request, mood: 'unknown' }, { ...request, note: 'a'.repeat(501) }, { ...request, trendTags: ['a'.repeat(41)] }, { ...request, trendTags: Array(9).fill('Color') }]) {
    assert.throws(() => parseStyleRequest(bad))
  }
})
