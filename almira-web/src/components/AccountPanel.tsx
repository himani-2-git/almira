import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { Cloud, Download, LogIn, Upload, UserRound } from 'lucide-react'
import { supabase } from '../supabase'
import { fetchCloudProfile, saveCloudProfile, type ProfileSnapshot, ProfileSyncError } from '../profileSync'
import type { StyleProfile, StyleMemory } from '../types'

export function AccountPanel({ user, profile, memories, onLoad, onBringGuest, onSignOut }: {
  user: User | null; profile: StyleProfile; memories: StyleMemory[]
  onLoad: (profile: StyleProfile, memories: StyleMemory[]) => void; onBringGuest: () => Promise<void>; onSignOut: () => Promise<void>
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const [cloud, setCloud] = useState<ProfileSnapshot | null>(null)
  const [revision, setRevision] = useState<number | null>(null)
  const [cloudStatus, setCloudStatus] = useState('Checking saved profile…')
  const active = useRef(true)
  const latest = useRef({ profile, memories })
  latest.current = { profile, memories }
  useEffect(() => {
    active.current = true
    if (user && supabase) {
      void fetchCloudProfile(supabase).then(snapshot => {
        if (!active.current) return
        setCloud(snapshot)
        if (snapshot.revision === 0) setRevision(0)
        setCloudStatus(snapshot.revision > 0 ? 'A profile is saved to your account. Load it before updating it from this device.' : 'Ready to save your first profile to your account.')
      }).catch(cause => { if (active.current) setCloudStatus(cause instanceof Error ? cause.message : 'Profile sync is unavailable for now.') })
    }
    return () => { active.current = false }
  }, [user?.id])
  function notify(text: string, failed = false) { if (active.current) { setMessage(text); setError(failed) } }
  async function authenticate(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true); setMessage('')
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (result.error) {
        const code = result.error.code
        const detail = code === 'email_not_confirmed' ? 'Check your email and confirm your account before signing in.'
          : code === 'over_email_send_rate_limit' || result.error.status === 429 ? 'Too many attempts right now. Please wait before trying again.'
          : code === 'email_address_not_authorized' || code === 'unexpected_failure' ? 'The account email could not be sent. Please contact the app owner or try again later.'
          : mode === 'signup' ? 'Your account could not be created. Please check the details and try again.' : 'Could not sign in. Check your email and password.'
        notify(detail, true)
      } else { setPassword(''); notify(result.data.session ? 'You’re signed in.' : 'Check your email to confirm your account, then come back to sign in.') }
    } catch { notify('Could not connect. Please try again when you’re online.', true) }
    finally { if (active.current) setBusy(false) }
  }
  async function loadProfile() {
    if (!supabase) return
    if (profile.updatedAt && !window.confirm('Replace your profile and memories on this device with the saved account profile? Your wardrobe will stay.')) return
    setBusy(true)
    const startingCopy = JSON.stringify(latest.current)
    try {
      const snapshot = await fetchCloudProfile(supabase)
      if (!active.current) return
      if (JSON.stringify(latest.current) !== startingCopy) { notify('Your device profile changed while loading. Please try loading again.', true); return }
      onLoad(snapshot.profile, snapshot.memories); setCloud(snapshot); setRevision(snapshot.revision)
      setCloudStatus('Your account profile is loaded. You can edit it and save changes.'); notify('Profile and remembered preferences loaded.')
    } catch (cause) { notify(cause instanceof Error ? cause.message : 'Your profile could not load.', true) }
    finally { if (active.current) setBusy(false) }
  }
  async function syncProfile() {
    if (!supabase || revision === null) return
    setBusy(true)
    const savingCopy = JSON.stringify({ profile, memories })
    try {
      const next = await saveCloudProfile(supabase, profile, memories, revision)
      if (!active.current) return
      setRevision(next); setCloud({ profile, memories, revision: next })
      const newerChanges = JSON.stringify(latest.current) !== savingCopy
      setCloudStatus(newerChanges ? 'An earlier edit was saved. Save again to sync your newer device changes.' : 'Profile and memories saved to your account.')
      notify(newerChanges ? 'Saved. Your newer edits still need to sync.' : 'Your style is saved across devices.')
    } catch (cause) {
      if (cause instanceof ProfileSyncError && cause.kind === 'conflict') setRevision(null)
      notify(cause instanceof Error ? cause.message : 'Your profile could not sync.', true)
    } finally { if (active.current) setBusy(false) }
  }
  async function bringGuest() {
    setBusy(true)
    try { await onBringGuest() } catch { notify('The device wardrobe could not be copied. Your original remains safe.', true) }
    finally { if (active.current) setBusy(false) }
  }
  return <section className="glass-panel account-panel" aria-label="Your account"><div className="account-heading"><span className="settings-icon"><UserRound size={23} /></span><div><h2>{user ? 'Your little corner' : 'Your style, wherever you are'}</h2><p>{user ? <span className="account-email">{user.email ?? 'Signed in'}</span> : 'Sign in to keep a private style profile. You can also keep exploring on this device.'}</p></div></div>
    {!supabase ? <p>Accounts aren’t available yet. Your wardrobe and style profile work on this device.</p> : user ? <>
      <p>Save your profile and confirmed memories to your account. Wardrobe and outfit sync are being connected; export a backup to move those between devices.</p>
      <div className="account-actions"><button className="button button-primary button-small" disabled={busy || revision === null} onClick={() => void syncProfile()}><Cloud size={16} />Save profile to account</button><button className="button button-soft button-small" disabled={busy || !cloud || cloud.revision === 0} onClick={() => void loadProfile()}><Download size={16} />Load saved profile</button><button className="text-button" disabled={busy} onClick={() => void bringGuest()}><Upload size={15} />Bring my device wardrobe</button></div>
      <p className="account-status" role="status">{cloudStatus}</p><div className="account-actions"><button className="text-button" disabled={busy} onClick={() => { setBusy(true); void onSignOut().catch(() => { notify('Could not sign out. Please try again.', true); setBusy(false) }) }}>Export & sign out</button><span className="profile-hint">A backup protects your device data before the account cache is cleared.</span></div>
    </> : <><div className="account-mode-tabs"><button type="button" className={mode === 'signin' ? 'active' : ''} aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); setMessage(''); setPassword('') }}>Sign in</button><button type="button" className={mode === 'signup' ? 'active' : ''} aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setMessage(''); setPassword('') }}>Create account</button></div><form className="account-form" onSubmit={authenticate}><div className="account-form-fields"><label>Email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label><label>Password<input type="password" required minLength={mode === 'signup' ? 8 : 1} maxLength={128} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} /></label></div><div><button className="button button-primary button-small" type="submit" disabled={busy}><LogIn size={16} />{busy ? 'One moment…' : mode === 'signup' ? 'Create my account' : 'Sign in'}</button></div></form></>}
    {message && <div className={`account-message ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{message}</div>}
  </section>
}
