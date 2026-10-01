import { useState } from 'react'
import type { Category, Garment } from '../types'

export const categorySymbols: Record<Category, string> = {
  Tops: '👚', Bottoms: '👖', Dresses: '👗', Outerwear: '🧥', Shoes: '👟', Accessories: '👜',
}
const accents: Record<Category, string> = {
  Tops: '#edf0ff', Bottoms: '#fff0f8', Dresses: '#f2edff', Outerwear: '#fff5e8', Shoes: '#eaf8f4', Accessories: '#eaf3ff',
}

export function GarmentVisual({ garment, className = '' }: { garment: Garment; className?: string }) {
  const [failedImage, setFailedImage] = useState<string>()
  return <div className={`garment-visual ${className}`} style={{ background: accents[garment.category] }}>
    {garment.image && garment.image !== failedImage ? <img src={garment.image} alt={garment.name} loading="lazy" onError={() => setFailedImage(garment.image)} /> : <span aria-hidden="true">{categorySymbols[garment.category]}</span>}
  </div>
}
