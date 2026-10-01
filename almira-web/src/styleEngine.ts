import type { Garment, StyleProfile } from './types'
import type { StyleLook, StyleRequest } from '../supabase/functions/_shared/style-contract.ts'
import { colorAllowed } from '../supabase/functions/_shared/profile.ts'
export { validateLooks } from '../supabase/functions/_shared/style-contract.ts'
export type { StyleLook, StyleRequest } from '../supabase/functions/_shared/style-contract.ts'

export function buildLocalLooks(garments: Garment[], request: StyleRequest, wearCounts: Record<string, number> = {}, profile?: StyleProfile): StyleLook[] {
  const preferences = profile?.personalization ? profile : undefined
  const available = garments.filter(item => !profile || colorAllowed(item.color, profile))
  const anchor = available.find(item => item.id === request.anchorId)
  if (request.anchorId && !anchor) return []
  const moodWords = request.mood === 'Soft & easy' ? ['casual', 'comfortable'] : request.mood === 'Put together' ? ['formal', 'work', 'tailoring'] : ['party', 'color', 'playful']
  const keywords = [request.occasion, ...moodWords, ...request.trendTags ?? []].map(value => value.toLowerCase())
  const favorites = preferences?.favoriteColors.map(color => color.toLowerCase()) ?? []
  const score = (item: Garment) => keywords.reduce((sum, word) => sum + (`${item.color} ${item.occasion} ${item.name}`.toLowerCase().includes(word) ? 8 : 0), 0) + (favorites.includes(item.color.toLowerCase()) ? 5 : 0) + (item.favorite ? 2 : 0) - Math.min(10, wearCounts[item.id] ?? 0)
  const sorted = [...available].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
  const looks: StyleLook[] = []
  const seen = new Set<string>()
  for (let variation = 0; variation < 6 && looks.length < 3; variation++) {
    const items: Garment[] = anchor ? [anchor] : []
    function pick(category: Garment['category'], offset = variation) {
      if (items.some(item => item.category === category)) return
      const options = sorted.filter(item => item.category === category && item.id !== anchor?.id)
      if (options.length) items.push(options[offset % options.length])
    }
    const hasPair = sorted.some(item => item.category === 'Tops') && sorted.some(item => item.category === 'Bottoms')
    const dresses = sorted.filter(item => item.category === 'Dresses')
    const dressBase = anchor?.category === 'Dresses' || (!['Tops', 'Bottoms'].includes(anchor?.category ?? '') && dresses.length > 0 && (!hasPair || variation % 2 === 1))
    if (dressBase) pick('Dresses')
    else { pick('Tops'); pick('Bottoms') }
    pick('Shoes'); pick('Outerwear'); pick('Accessories')
    if (!items.length) continue
    const key = JSON.stringify(items.map(item => item.id).sort())
    if (seen.has(key)) continue
    seen.add(key)
    const names = ['Your everyday lovely', 'A little fresh perspective', 'Another way to wear it']
    const baseText = anchor ? `Starting with ${anchor.name}, ` : 'Using the pieces you own, '
    looks.push({ title: names[looks.length], itemIds: items.map(item => item.id), explanation: `${baseText}this quick combination brings together ${items.map(item => item.name).join(', ')}. Check the fit and weather before you head out.` })
  }
  return looks
}
