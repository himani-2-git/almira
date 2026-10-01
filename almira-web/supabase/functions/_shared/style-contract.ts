export interface StyleGarment {
  id: string
  name: string
  category: string
  color: string
  occasion: string
  season: string
  favorite: boolean
}

export interface StyleRequest {
  occasion: string
  mood: 'Soft & easy' | 'Put together' | 'Playful'
  anchorId?: string
  note: string
  trendTags?: string[]
}

export interface StyleLook { title: string; itemIds: string[]; explanation: string }

export function validateLooks(value: unknown, garments: StyleGarment[], anchorId?: string): StyleLook[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) throw new Error('The stylist returned an incomplete response.')
  const owned = new Map(garments.map(item => [item.id, item]))
  if (anchorId && !owned.has(anchorId)) throw new Error('The starting piece is not in your wardrobe.')
  const seen = new Set<string>()
  return value.map((look: unknown) => {
    if (typeof look !== 'object' || !look) throw new Error('Could not read this look.')
    const draft = look as Record<string, unknown>
    if (typeof draft.title !== 'string' || !draft.title.trim() || typeof draft.explanation !== 'string' || !draft.explanation.trim() || !Array.isArray(draft.itemIds) || !draft.itemIds.length || draft.itemIds.length > 6) throw new Error('Could not read this look.')
    const ids = draft.itemIds as unknown[]
    if (ids.some(id => typeof id !== 'string' || !owned.has(id)) || new Set(ids).size !== ids.length) throw new Error('A suggested piece is not in your wardrobe.')
    if (anchorId && !ids.includes(anchorId)) throw new Error('The look missed the piece you chose.')
    const categories = ids.map(id => owned.get(id as string)!.category)
    if (new Set(categories).size !== categories.length || (categories.includes('Dresses') && categories.some(category => category === 'Tops' || category === 'Bottoms'))) throw new Error('The stylist returned conflicting pieces.')
    const key = JSON.stringify([...ids].sort())
    if (seen.has(key)) throw new Error('The stylist returned duplicate looks.')
    seen.add(key)
    return { title: draft.title.trim().slice(0, 100), explanation: draft.explanation.trim().slice(0, 600), itemIds: ids as string[] }
  })
}

export function parseStyleRequest(value: unknown): StyleRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Choose an occasion and mood.')
  const draft = value as Record<string, unknown>
  if (typeof draft.occasion !== 'string' || !draft.occasion.trim() || draft.occasion.length > 80 || !['Soft & easy', 'Put together', 'Playful'].includes(draft.mood as string)) throw new Error('Choose an occasion and mood.')
  if (draft.anchorId !== undefined && (typeof draft.anchorId !== 'string' || draft.anchorId.length > 100)) throw new Error('Choose a valid starting piece.')
  if (draft.note !== undefined && (typeof draft.note !== 'string' || draft.note.length > 500)) throw new Error('Keep your styling note under 500 characters.')
  if (draft.trendTags !== undefined && (!Array.isArray(draft.trendTags) || draft.trendTags.length > 8 || draft.trendTags.some(tag => typeof tag !== 'string' || tag.length > 40))) throw new Error('Could not read the trend tags.')
  return { occasion: draft.occasion.trim(), mood: draft.mood as StyleRequest['mood'], anchorId: (draft.anchorId as string | undefined) || undefined, note: (draft.note as string | undefined)?.trim() ?? '', trendTags: draft.trendTags as string[] | undefined }
}
