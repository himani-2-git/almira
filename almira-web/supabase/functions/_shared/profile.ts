export const fashionPreferences = ['Womenswear', 'Menswear', 'Unisex', 'Mix of all', 'Prefer not to say'] as const
export const styleOptions = ['Minimal', 'Streetwear', 'Classic', 'Relaxed', 'Playful', 'Tailoring', 'Traditional', 'Fusion', 'Experimental'] as const
export const fitOptions = ['Relaxed', 'Regular', 'Fitted', 'Oversized'] as const
export const occasionOptions = ['Everyday', 'College', 'Work', 'Coffee date', 'Party', 'Wedding', 'Travel'] as const
export const explorationOptions = ['Familiar', 'Balanced', 'Adventurous'] as const

export interface StyleProfile {
  displayName: string
  fashionPreference: typeof fashionPreferences[number] | ''
  styles: string[]
  brands: string[]
  favoriteColors: string[]
  avoidedColors: string[]
  fits: string[]
  avoidedFabrics: string[]
  comfort: string
  coverage: string
  occasions: string[]
  region: string
  climate: string
  exploration: typeof explorationOptions[number]
  fashionPerspective: string
  personalization: boolean
  learnFromFeedback: boolean
  updatedAt: string
}

export interface StyleMemory {
  id: string
  text: string
  scope: string
  createdAt: string
}

export function emptyProfile(): StyleProfile {
  return {
    displayName: '', fashionPreference: '', styles: [], brands: [], favoriteColors: [], avoidedColors: [],
    fits: [], avoidedFabrics: [], comfort: '', coverage: '', occasions: [], region: 'India + Global',
    climate: '', exploration: 'Balanced', fashionPerspective: '', personalization: true,
    learnFromFeedback: false, updatedAt: '',
  }
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown, max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const list = (value: unknown): string[] => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string').map(item => text(item, 40)).filter(Boolean))].slice(0, 12) : []
const choices = (value: unknown, allowed: readonly string[]) => list(value).filter(item => allowed.includes(item))

export function normalizeProfile(value: unknown): StyleProfile {
  const base = emptyProfile()
  if (!record(value)) return base
  return {
    displayName: text(value.displayName, 40),
    fashionPreference: fashionPreferences.includes(value.fashionPreference as typeof fashionPreferences[number]) ? value.fashionPreference as StyleProfile['fashionPreference'] : '',
    styles: choices(value.styles, styleOptions), brands: list(value.brands), favoriteColors: list(value.favoriteColors),
    avoidedColors: list(value.avoidedColors), fits: choices(value.fits, fitOptions), avoidedFabrics: list(value.avoidedFabrics),
    comfort: text(value.comfort), coverage: text(value.coverage), occasions: choices(value.occasions, occasionOptions),
    region: text(value.region, 80), climate: text(value.climate, 80),
    exploration: explorationOptions.includes(value.exploration as typeof explorationOptions[number]) ? value.exploration as StyleProfile['exploration'] : base.exploration,
    fashionPerspective: text(value.fashionPerspective, 500),
    personalization: typeof value.personalization === 'boolean' ? value.personalization : base.personalization,
    learnFromFeedback: typeof value.learnFromFeedback === 'boolean' ? value.learnFromFeedback : base.learnFromFeedback,
    updatedAt: typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)) ? value.updatedAt : '',
  }
}

export function normalizeMemories(value: unknown): StyleMemory[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const memories: StyleMemory[] = []
  for (const item of value) {
    if (!record(item) || typeof item.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id) || seen.has(item.id)) continue
    const memoryText = text(item.text)
    if (!memoryText || typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt))) continue
    seen.add(item.id)
    const scope = item.scope === 'All occasions' || occasionOptions.includes(item.scope as typeof occasionOptions[number]) ? item.scope as string : 'All occasions'
    memories.push({ id: item.id, text: memoryText, scope, createdAt: item.createdAt })
    if (memories.length === 20) break
  }
  return memories
}

export function profileContext(profile: StyleProfile, memories: StyleMemory[], occasion: string) {
  if (!profile.personalization) return null
  const { displayName: _name, updatedAt: _updated, learnFromFeedback: _learning, personalization: _enabled, ...preferences } = normalizeProfile(profile)
  return {
    preferences,
    confirmedMemories: normalizeMemories(memories).filter(item => item.scope === 'All occasions' || item.scope.toLowerCase() === occasion.toLowerCase()).slice(-6).map(({ text, scope }) => ({ text, scope })),
  }
}

export function colorAllowed(color: string, profile: StyleProfile): boolean {
  if (!profile.personalization) return true
  const colors = color.toLowerCase().split(/[,/&]+/).map(value => value.trim())
  return !profile.avoidedColors.some(value => colors.includes(value.toLowerCase()))
}
