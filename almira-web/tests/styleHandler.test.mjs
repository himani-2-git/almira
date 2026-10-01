import test from 'node:test'
import assert from 'node:assert/strict'
import { createStyleHandler } from '../supabase/functions/style-me/handler.ts'

const userId = '11111111-1111-4111-8111-111111111111'
const piece = { id: '22222222-2222-4222-8222-222222222222', name: 'Lilac shirt', category: 'Tops', color: 'Lilac', occasion: 'Everyday', season: 'All year', favorite: false }
const envs = { SUPABASE_URL: 'https://almira-test.supabase.co', SUPABASE_ANON_KEY: 'test-public-key', GROQ_API_KEY: 'test-server-secret', ALMIRA_ALLOWED_ORIGINS: 'http://127.0.0.1:4173' }
const input = { occasion: 'Everyday', mood: 'Soft & easy', note: '' }
const outfit = { title: 'An easy day', itemIds: [piece.id], explanation: 'Start with your favorite shirt.' }
function request(body = input, headers = {}) {
  return new Request('https://almira-test.supabase.co/functions/v1/style-me', { method: 'POST', headers: { Authorization: 'Bearer user-session', Origin: 'http://127.0.0.1:4173', ...headers }, body: JSON.stringify(body) })
}
function mock({ auth = true, quota = true, looks = [outfit], providerStatus = 200, profile = {}, memories = [], environment = envs } = {}) {
  const calls = []
  const fetcher = async (url, options) => {
    calls.push({ url, options })
    if (url.endsWith('/auth/v1/user')) return Response.json(auth ? { id: userId } : {}, { status: auth ? 200 : 401 })
    if (url.includes('/rest/v1/garments?')) return Response.json([piece])
    if (url.includes('/rest/v1/preferences?')) return Response.json([{ profile_data: profile }])
    if (url.includes('/rest/v1/style_memories?')) return Response.json(memories)
    if (url.endsWith('/rpc/consume_style_request')) return Response.json(quota)
    if (url.startsWith('https://api.groq.com/')) return Response.json({ choices: [{ message: { content: JSON.stringify({ looks }) }, finish_reason: 'stop' }] }, { status: providerStatus })
    throw new Error(`Unexpected URL ${url}`)
  }
  return { calls, handle: createStyleHandler(name => environment[name], fetcher) }
}

test('authenticated request reads the verified user wardrobe with their JWT and returns validated drafts', async () => {
  const { calls, handle } = mock()
  const response = await handle(request({ ...input, anchorId: piece.id, userId: 'someone-else', garments: [{ id: 'foreign' }] }))
  assert.equal(response.status, 200)
  assert.deepEqual((await response.json()).looks, [outfit])
  const dbCall = calls.find(call => call.url.includes('/rest/v1/garments?'))
  assert.ok(dbCall.url.includes(`user_id=eq.${userId}`))
  assert.ok(dbCall.url.includes('deleted_at=is.null'))
  assert.equal(dbCall.options.headers.Authorization, 'Bearer user-session')
  const groqCall = calls.find(call => call.url.startsWith('https://api.groq.com/'))
  assert.equal(groqCall.options.headers.Authorization, 'Bearer test-server-secret')
  const prompt = JSON.parse(JSON.parse(groqCall.options.body).messages[1].content)
  assert.deepEqual(prompt.wardrobe, [piece])
  assert.equal(prompt.request.userId, undefined)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
})

test('private style context uses the verified owner, relevant memory, and no identity fields', async () => {
  const { calls, handle } = mock({ profile: { displayName: 'Private name', fashionPreference: 'Unisex', favoriteColors: ['Lilac'] }, memories: [{ id: '33333333-3333-4333-8333-333333333333', memory_text: 'Comfort for work', scope: 'Work', created_at: '2026-10-01T00:00:00Z' }] })
  assert.equal((await handle(request({ ...input, occasion: 'Work' }))).status, 200)
  for (const call of calls.filter(call => call.url.includes('/rest/v1/preferences?') || call.url.includes('/rest/v1/style_memories?'))) assert.ok(call.url.includes(`user_id=eq.${userId}`))
  const prompt = JSON.parse(JSON.parse(calls.find(call => call.url.startsWith('https://api.groq.com/')).options.body).messages[1].content)
  assert.equal(prompt.styleContext.preferences.fashionPreference, 'Unisex')
  assert.equal(prompt.styleContext.confirmedMemories[0].text, 'Comfort for work')
  assert.equal(JSON.stringify(prompt).includes('Private name'), false)
})

test('personalization opt-out skips memory reads and the current publishable-key runtime is supported', async () => {
  const { calls, handle } = mock({ profile: { personalization: false }, environment: { ...envs, SUPABASE_ANON_KEY: undefined, SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: 'new-public-key' }) } })
  assert.equal((await handle(request())).status, 200)
  assert.equal(calls.some(call => call.url.includes('/rest/v1/style_memories?')), false)
  assert.equal(calls[0].options.headers.apikey, 'new-public-key')
  const prompt = JSON.parse(JSON.parse(calls.find(call => call.url.startsWith('https://api.groq.com/')).options.body).messages[1].content)
  assert.equal(prompt.styleContext, null)
})

test('an explicit color avoidance blocks the anchor before the model call', async () => {
  const { calls, handle } = mock({ profile: { avoidedColors: ['Lilac'] } })
  assert.equal((await handle(request({ ...input, anchorId: piece.id }))).status, 400)
  assert.equal(calls.some(call => call.url.startsWith('https://api.groq.com/')), false)
})

test('invalid auth and unapproved origins stop before wardrobe or model calls', async () => {
  const unauthorized = mock({ auth: false })
  assert.equal((await unauthorized.handle(request())).status, 401)
  assert.equal(unauthorized.calls.length, 1)
  const origin = mock()
  assert.equal((await origin.handle(request(input, { Origin: 'https://unapproved.example' }))).status, 403)
  assert.equal(origin.calls.length, 0)
})

test('a foreign anchor and malformed request stop before a paid model call', async () => {
  for (const body of [{ ...input, anchorId: 'foreign' }, { ...input, mood: 'unknown' }]) {
    const { handle, calls } = mock()
    assert.equal((await handle(request(body))).status, 400)
    assert.equal(calls.some(call => call.url.startsWith('https://api.groq.com/')), false)
  }
})

test('rate limits stop the model call and foreign model IDs never reach the user', async () => {
  const limited = mock({ quota: false })
  assert.equal((await limited.handle(request())).status, 429)
  assert.equal(limited.calls.some(call => call.url.startsWith('https://api.groq.com/')), false)
  const invalid = mock({ looks: [{ ...outfit, itemIds: ['foreign'] }] })
  const response = await invalid.handle(request())
  assert.equal(response.status, 502)
  assert.equal((await response.json()).looks, undefined)
})

test('unconfigured and unavailable AI return a clear fallback message without exposing secrets', async () => {
  const missing = createStyleHandler(() => undefined, () => { throw new Error('Must not call network') })
  assert.equal((await missing(request())).status, 503)
  const { handle } = mock({ providerStatus: 500 })
  const response = await handle(request())
  assert.equal(response.status, 502)
  const body = await response.text()
  assert.ok(body.includes('quick styling'))
  assert.ok(!body.includes(envs.GROQ_API_KEY))
})

test('oversized request bodies are rejected before a model call', async () => {
  const { handle, calls } = mock()
  assert.equal((await handle(request({ ...input, note: 'a'.repeat(9000) }))).status, 413)
  assert.equal(calls.some(call => call.url.startsWith('https://api.groq.com/')), false)
})
