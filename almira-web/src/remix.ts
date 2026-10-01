import type { Garment } from './types'

const complementary: Record<string, string[]> = {
  Tops: ['Bottoms', 'Shoes', 'Outerwear', 'Accessories'],
  Bottoms: ['Tops', 'Shoes', 'Outerwear', 'Accessories'],
  Dresses: ['Shoes', 'Outerwear', 'Accessories'],
  Outerwear: ['Tops', 'Bottoms', 'Shoes'],
  Shoes: ['Tops', 'Bottoms', 'Dresses', 'Accessories'],
  Accessories: ['Tops', 'Bottoms', 'Dresses', 'Shoes'],
}

export function makeRemix(anchor: Garment, garments: Garment[], wearCounts: Record<string, number>): Garment[] {
  const candidates = garments.filter(item => item.id !== anchor.id)
  const seen = new Set<string>([anchor.category])
  const result = [anchor]
  const desired = complementary[anchor.category] ?? []
  for (const category of desired) {
    const pick = candidates
      .filter(item => item.category === category && !seen.has(item.category))
      .sort((a, b) => (wearCounts[a.id] ?? 0) - (wearCounts[b.id] ?? 0))[0]
    if (pick) {
      result.push(pick)
      seen.add(pick.category)
    }
    if (result.length >= 4) break
  }
  return result
}
