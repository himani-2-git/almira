import { readFile } from 'node:fs/promises'

const config = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const get = name => config.match(new RegExp(`^${name}\\s*=\\s*([^\\r\\n]*)`, 'm'))?.[1].trim().replace(/^['"]|['"]$/g, '') ?? ''
const url = get('VITE_SUPABASE_URL')
const key = get('VITE_SUPABASE_PUBLISHABLE_KEY')
let publicKey = key.startsWith('sb_publishable_')
if (key.startsWith('eyJ')) {
  try { publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon' } catch { /* invalid key */ }
}
const validURL = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)
console.log(JSON.stringify({ publicKeyFormat: publicKey, projectURLFormat: validURL }))
if (!publicKey || !validURL) process.exit(1)
const headers = { apikey: key }
for (const [label, path] of [['auth', '/auth/v1/settings'], ['wardrobeSchema', '/rest/v1/preferences?select=user_id&limit=0'], ['styleFunction', '/functions/v1/style-me']]) {
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}${path}`, { headers, signal: AbortSignal.timeout(10000) })
    let code
    if (label !== 'auth') { try { code = (await response.json()).code } catch { /* no structured code */ } }
    console.log(JSON.stringify({ check: label, status: response.status, code: typeof code === 'string' ? code : undefined }))
  } catch { console.log(JSON.stringify({ check: label, reachable: false })) }
}
