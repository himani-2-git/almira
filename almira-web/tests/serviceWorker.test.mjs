import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8')
const origin = 'https://almira.test'
const key = request => new URL(typeof request === 'string' ? request : request.url, origin).href

function harness() {
  const listeners = new Map(), stores = new Map()
  let online = true, page = 'first release'
  async function open(name) {
    if (!stores.has(name)) stores.set(name, new Map())
    const contents = stores.get(name)
    return {
      async addAll(paths) { for (const path of paths) contents.set(key(path), new Response(page)) },
      async match(request) { return contents.get(key(request))?.clone() },
      async put(request, response) { contents.set(key(request), response.clone()) },
    }
  }
  const caches = {
    open, async keys() { return [...stores.keys()] }, async delete(name) { return stores.delete(name) },
    async match(request) { for (const map of stores.values()) { const response = map.get(key(request)); if (response) return response.clone() } },
  }
  runInNewContext(source, { URL, Set, Response, caches, fetch: async () => { if (!online) throw new Error('offline'); return new Response(page) }, self: { location: { origin }, addEventListener: (name, callback) => listeners.set(name, callback), skipWaiting() {}, clients: { claim() {} } } })
  async function dispatch(name, request) {
    const pending = []; let response
    listeners.get(name)({ request, waitUntil: promise => pending.push(promise), respondWith: promise => { response = promise } })
    const result = await response
    await Promise.all(pending)
    return result
  }
  return { dispatch, stores, setOnline: value => { online = value }, setPage: value => { page = value } }
}
function request(path = '/', options = {}) { return { url: new URL(path, origin).href, method: 'GET', mode: 'navigate', headers: new Headers(), ...options } }

test('a successful reload replaces the offline shell with the deployed version', async () => {
  const sw = harness(); await sw.dispatch('install')
  sw.setPage('second release')
  assert.equal(await (await sw.dispatch('fetch', request('/?code=private-callback'))).text(), 'second release')
  sw.setOnline(false)
  assert.equal(await (await sw.dispatch('fetch', request())).text(), 'second release')
  assert.ok([...sw.stores.values()].every(contents => ![...contents.keys()].some(url => url.includes('private-callback'))))
})
test('public hashed assets remain available offline after they have loaded', async () => {
  const sw = harness(); sw.setPage('javascript bundle')
  const asset = request('/assets/index-hash.js', { mode: 'cors' })
  await sw.dispatch('fetch', asset); sw.setOnline(false)
  assert.equal(await (await sw.dispatch('fetch', asset)).text(), 'javascript bundle')
})
test('account endpoints, authenticated requests and other origins are not cached', async () => {
  const sw = harness()
  assert.equal(await sw.dispatch('fetch', request('/api/profile', { mode: 'cors' })), undefined)
  assert.equal(await sw.dispatch('fetch', request('/assets/private.js', { mode: 'cors', headers: new Headers({ Authorization: 'Bearer test' }) })), undefined)
  assert.equal(await sw.dispatch('fetch', request('/', { url: 'https://backend.test/profile' })), undefined)
  assert.equal(sw.stores.size, 0)
})
test('activation clears old Almira shells and preserves unrelated caches', async () => {
  const sw = harness(); sw.stores.set('almira-shell-v1', new Map()); sw.stores.set('another-app', new Map())
  await sw.dispatch('install'); await sw.dispatch('activate')
  assert.ok(!sw.stores.has('almira-shell-v1')); assert.ok(sw.stores.has('another-app')); assert.ok(sw.stores.has('almira-shell-v2'))
})
test('first offline visit has a clear recovery message', async () => {
  const sw = harness(); sw.setOnline(false)
  const result = await sw.dispatch('fetch', request())
  assert.equal(result.status, 503); assert.match(await result.text(), /reconnect and reload/)
})
