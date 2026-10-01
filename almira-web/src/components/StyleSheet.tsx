import { useState, type FormEvent } from 'react'
import { ArrowRight, Bookmark, Check, Shirt, Sparkles, WandSparkles } from 'lucide-react'
import type { Garment, StyleProfile } from '../types'
import { buildLocalLooks, type StyleLook, type StyleRequest } from '../styleEngine'
import { Modal } from './Modal'
import { GarmentVisual } from './GarmentVisual'

export function StyleSheet({ garments, wearCounts, profile, initial, onClose, onAdd, onSave, onWear }: {
  garments: Garment[]; wearCounts: Record<string, number>; profile?: StyleProfile; initial?: Partial<StyleRequest>
  onClose: () => void; onAdd: () => void
  onSave: (ids: string[], title: string, occasion: string) => void; onWear: (ids: string[]) => void
}) {
  const [request, setRequest] = useState<StyleRequest>({ occasion: 'Everyday', mood: 'Soft & easy', note: '', ...initial })
  const [looks, setLooks] = useState<StyleLook[]>([])
  const [resultOccasion, setResultOccasion] = useState(request.occasion)
  const [saved, setSaved] = useState<number[]>([])
  const [worn, setWorn] = useState<number[]>([])
  const [searched, setSearched] = useState(false)
  function findLooks(event: FormEvent) {
    event.preventDefault()
    setLooks(buildLocalLooks(garments, request, wearCounts, profile))
    setSearched(true)
    setResultOccasion(request.occasion)
    setSaved([]); setWorn([])
  }
  return <Modal title="A little help getting dressed" kicker="STYLE ME" onClose={onClose} className="stylist-modal">
    <p className="stylist-intro">Your pieces. A fresh perspective. Let’s find something that feels like you.</p>
    <div className="mode-note"><span className="mode-dot" /><span>Quick styling uses your wardrobe{profile?.personalization && profile.updatedAt ? ' and color preferences' : ''}. AI styling is coming next.</span></div>
    {garments.length ? <>
      <form onSubmit={findLooks} className="stylist-form">
        <div className="stylist-fields"><label>What’s the occasion?<select value={request.occasion} onChange={event => setRequest(current => ({ ...current, occasion: event.target.value }))}>{['Everyday', 'Work', 'College', 'Coffee date', 'Party', 'Wedding', 'Travel'].map(occasion => <option key={occasion}>{occasion}</option>)}</select></label>
          <label>Start with a favorite piece<select value={request.anchorId ?? ''} onChange={event => setRequest(current => ({ ...current, anchorId: event.target.value || undefined }))}><option value="">Surprise me</option>{garments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
        <fieldset className="mood-field"><legend>How do you want to feel?</legend><div className="mood-options">{(['Soft & easy', 'Put together', 'Playful'] as const).map(mood => <button key={mood} type="button" className={request.mood === mood ? 'mood-chip selected' : 'mood-chip'} aria-pressed={request.mood === mood} onClick={() => setRequest(current => ({ ...current, mood }))}>{mood === 'Soft & easy' ? '☁' : mood === 'Put together' ? '✧' : '♡'} {mood}</button>)}</div></fieldset>
        {request.trendTags?.length ? <div className="inspiration-context"><Sparkles size={16} /><span>Inspired by {request.trendTags.join(' · ')}</span></div> : null}
        <div className="stylist-submit"><span>We’ll start with the pieces you own.</span><button className="button button-primary" type="submit"><WandSparkles size={18} /> {looks.length ? 'Update my looks' : 'Find my looks'}</button></div>
      </form>
      {searched && !looks.length && <p className="sparse-note" role="status">No combination fits the current choices. Try another starting piece or review the colors you prefer to avoid in My style.</p>}
      {looks.length > 0 && <section className="style-results" aria-label="Suggested looks" aria-live="polite"><div className="results-heading"><h3>A few lovely possibilities</h3><span>{looks.length} {looks.length === 1 ? 'combination' : 'combinations'}</span></div>
        {looks.map((look, index) => <article className="style-look" key={`${index}-${look.itemIds.join()}`}><div className="style-look-pieces">{look.itemIds.map(id => { const garment = garments.find(item => item.id === id); return garment && <div key={id}><GarmentVisual garment={garment} /><span>{garment.name}</span></div> })}</div><div className="style-look-copy"><span className="section-kicker">LOOK {String(index + 1).padStart(2, '0')}</span><h3>{look.title}</h3><p>{look.explanation}</p><div className="style-look-actions"><button className="button button-soft button-small" disabled={saved.includes(index)} onClick={() => { onSave(look.itemIds, look.title, resultOccasion); setSaved(values => [...values, index]) }}>{saved.includes(index) ? <Check size={16} /> : <Bookmark size={16} />}{saved.includes(index) ? 'Saved' : 'Save look'}</button><button className="text-button" disabled={worn.includes(index)} onClick={() => { onWear(look.itemIds); setWorn(values => [...values, index]) }}>{worn.includes(index) ? 'Wear logged' : 'Wore this'} <ArrowRight size={15} /></button></div></div></article>)}
        {looks.length < 3 && <p className="sparse-note">More pieces will give you more combinations. You can add to your wardrobe anytime.</p>}
      </section>}
    </> : <div className="stylist-empty"><div className="empty-icon"><Shirt size={30} /></div><h3>Your closet is the starting point</h3><p>Add a few favorite pieces, then come back for your first look.</p><button className="button button-primary" onClick={onAdd}>Add my first piece <ArrowRight size={17} /></button></div>}
  </Modal>
}
