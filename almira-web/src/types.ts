export type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Shoes' | 'Accessories'
export type Page = 'Today' | 'Wardrobe' | 'Outfits' | 'Insights' | 'Settings'

export interface Garment {
  id: string
  name: string
  category: Category
  color: string
  occasion: string
  season: string
  image?: string
  favorite: boolean
  createdAt: string
  purchasePrice?: number
}

export interface Outfit {
  id: string
  name: string
  itemIds: string[]
  occasion: string
  createdAt: string
}

export interface WearEvent {
  id: string
  itemIds: string[]
  outfitId?: string
  wornAt: string
}

export interface AlmiraData {
  garments: Garment[]
  outfits: Outfit[]
  wears: WearEvent[]
  profile?: StyleProfile
  memories?: StyleMemory[]
}

export const emptyData: AlmiraData = { garments: [], outfits: [], wears: [] }
export const categories: Category[] = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string')

export function isAlmiraData(value: unknown): value is AlmiraData {
  if (!isRecord(value) || !Array.isArray(value.garments) || !Array.isArray(value.outfits) || !Array.isArray(value.wears)) return false
  if (value.profile !== undefined && !isRecord(value.profile)) return false
  if (value.memories !== undefined && !Array.isArray(value.memories)) return false
  return value.garments.every(item => isRecord(item) &&
    typeof item.id === 'string' && typeof item.name === 'string' &&
    categories.includes(item.category as Category) && typeof item.color === 'string' &&
    typeof item.occasion === 'string' && typeof item.season === 'string' &&
    typeof item.favorite === 'boolean' && typeof item.createdAt === 'string' &&
    (item.image === undefined || typeof item.image === 'string') &&
    (item.purchasePrice === undefined || (typeof item.purchasePrice === 'number' && Number.isFinite(item.purchasePrice)))
  ) && value.outfits.every(item => isRecord(item) &&
    typeof item.id === 'string' && typeof item.name === 'string' &&
    isStringArray(item.itemIds) && typeof item.occasion === 'string' &&
    typeof item.createdAt === 'string'
  ) && value.wears.every(item => isRecord(item) &&
    typeof item.id === 'string' && isStringArray(item.itemIds) &&
    typeof item.wornAt === 'string' &&
    (item.outfitId === undefined || typeof item.outfitId === 'string')
  )
}

export function normalizeData(value: AlmiraData): AlmiraData {
  return { ...value, profile: normalizeProfile(value.profile), memories: normalizeMemories(value.memories) }
}
import { emptyProfile, normalizeProfile, normalizeMemories, type StyleProfile, type StyleMemory } from '../supabase/functions/_shared/profile.ts'
export { emptyProfile, normalizeProfile, normalizeMemories }
export type { StyleProfile, StyleMemory }
