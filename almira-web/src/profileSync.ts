import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeProfile, normalizeMemories, type StyleProfile, type StyleMemory } from '../supabase/functions/_shared/profile.ts'

export interface ProfileSnapshot { profile: StyleProfile; memories: StyleMemory[]; revision: number }

export class ProfileSyncError extends Error {
  readonly kind: 'not-ready' | 'conflict' | 'unavailable'
  constructor(kind: 'not-ready' | 'conflict' | 'unavailable', message: string) { super(message); this.kind = kind }
}

function failed(code?: string): never {
  if (['PGRST202', 'PGRST205', '42P01', '42703'].includes(code ?? '')) throw new ProfileSyncError('not-ready', 'Cloud profiles are unavailable for now. Your profile on this device is safe.')
  if (code === '40001') throw new ProfileSyncError('conflict', 'Your saved profile changed on another device. Load the latest profile before saving again.')
  throw new ProfileSyncError('unavailable', 'Your profile could not sync. Please try again; your device copy is safe.')
}

export function parseProfileSnapshot(value: unknown): ProfileSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return failed()
  const data = value as Record<string, unknown>
  if (typeof data.revision !== 'number' || !Number.isSafeInteger(data.revision) || data.revision < 0 || typeof data.profile !== 'object' || data.profile === null || Array.isArray(data.profile) || !Array.isArray(data.memories)) return failed()
  return { profile: normalizeProfile(data.profile), memories: normalizeMemories(data.memories), revision: data.revision }
}

export async function fetchCloudProfile(client: SupabaseClient): Promise<ProfileSnapshot> {
  const { data, error } = await client.rpc('get_style_profile')
  if (error) return failed(error.code)
  return parseProfileSnapshot(data)
}

export async function saveCloudProfile(client: SupabaseClient, profile: StyleProfile, memories: StyleMemory[], revision: number): Promise<number> {
  const { data, error } = await client.rpc('save_style_profile', { expected_revision: revision, profile_payload: normalizeProfile(profile), memory_payload: normalizeMemories(memories) })
  if (error) return failed(error.code)
  if (typeof data !== 'number' || !Number.isSafeInteger(data) || data !== revision + 1) return failed()
  return data
}
