export interface TrendStory {
  id: string
  category: string
  title: string
  deck: string
  summary: string
  tags: string[]
  colors: string[]
  artwork: 'tailoring' | 'lilac' | 'ribbon'
  occasion: string
}

// Original editorial illustrations and sample copy. These are design fixtures, not live reporting.
export const previewStories: TrendStory[] = [
  { id: 'soft-tailoring', category: 'THE EVERYDAY EDIT', title: 'A softer side of tailoring', deck: 'Easy layers. Beautiful little details.', summary: 'This sample story explores pairing a structured jacket with relaxed pieces. Try a top and trousers you already own, then add your favorite outer layer. The illustration and copy are original design previews, with no event or current trend claim.', tags: ['Tailoring', 'Layers', 'Everyday'], colors: ['#a3aab9', '#e6cfb9', '#faf4e8'], artwork: 'tailoring', occasion: 'Everyday' },
  { id: 'lilac-mood', category: 'COLOR NOTES', title: 'In a lilac kind of mood', deck: 'One gentle color, many ways to wear it.', summary: 'A sample color story about adding a lavender piece to an everyday outfit. Use a lilac top if you own one, or keep the idea as inspiration for a future look. This is an illustrated design preview, not a report from a fashion event.', tags: ['Lilac', 'Color', 'Soft'], colors: ['#b5a2dc', '#e8dcf2', '#7380a3'], artwork: 'lilac', occasion: 'Everyday' },
  { id: 'little-details', category: 'THE FINISHING TOUCH', title: 'The joy is in the details', deck: 'A favorite bag. A bow. A little personality.', summary: 'This sample story celebrates accessories as a way to revisit a familiar outfit. Choose a piece you love and let it become the starting point. The artwork is an original illustration and the story is a preview.', tags: ['Accessories', 'Playful', 'Pink'], colors: ['#d891a8', '#ead2bd', '#987080'], artwork: 'ribbon', occasion: 'Party' },
]
