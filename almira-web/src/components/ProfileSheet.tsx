import { useState, type FormEvent } from 'react'
import { Check, Heart, Plus, Sparkles, Trash2 } from 'lucide-react'
import { fashionPreferences, fitOptions, occasionOptions, styleOptions, explorationOptions, normalizeProfile, normalizeMemories, type StyleProfile, type StyleMemory } from '../../supabase/functions/_shared/profile.ts'
import { Modal } from './Modal'

const split = (value: string) => [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))].slice(0, 12)

function ChipChoices({ legend, options, values, onChange }: { legend: string; options: readonly string[]; values: string[]; onChange: (values: string[]) => void }) {
  return <fieldset className="profile-choices"><legend>{legend}</legend><div>{options.map(option => <button type="button" key={option} className={`profile-chip ${values.includes(option) ? 'selected' : ''}`} aria-pressed={values.includes(option)} onClick={() => onChange(values.includes(option) ? values.filter(value => value !== option) : [...values, option])}>{values.includes(option) && <Check size={13} />}{option}</button>)}</div></fieldset>
}

export function ProfileSheet({ profile, memories, onSave, onClose }: { profile: StyleProfile; memories: StyleMemory[]; onSave: (profile: StyleProfile, memories: StyleMemory[]) => void; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(profile)
  const [notes, setNotes] = useState(memories)
  const [memoryText, setMemoryText] = useState('')
  const [memoryScope, setMemoryScope] = useState('All occasions')
  const [csv, setCsv] = useState({ brands: profile.brands.join(', '), favoriteColors: profile.favoriteColors.join(', '), avoidedColors: profile.avoidedColors.join(', '), avoidedFabrics: profile.avoidedFabrics.join(', ') })
  const [editingMemory, setEditingMemory] = useState<string | null>(null)
  const steps = ['Your style', 'Comfort & color', 'Your everyday', 'Your memory']
  function update<K extends keyof StyleProfile>(key: K, value: StyleProfile[K]) { setDraft(current => ({ ...current, [key]: value })) }
  function addMemory() {
    if (!memoryText.trim() || (!editingMemory && notes.length >= 20)) return
    const memory = { id: editingMemory ?? crypto.randomUUID(), text: memoryText.trim(), scope: memoryScope, createdAt: notes.find(item => item.id === editingMemory)?.createdAt ?? new Date().toISOString() }
    setNotes(current => editingMemory ? current.map(item => item.id === editingMemory ? memory : item) : [...current, memory])
    setMemoryText(''); setEditingMemory(null)
  }
  function save(event: FormEvent) {
    event.preventDefault()
    const next = normalizeProfile({ ...draft, ...Object.fromEntries(Object.entries(csv).map(([key, value]) => [key, split(value)])), updatedAt: new Date().toISOString() })
    onSave(next, normalizeMemories(notes)); onClose()
  }
  return <Modal title="A style that feels like you" kicker="MY STYLE" onClose={onClose} className="profile-modal">
    <p className="profile-intro">A little about you, on your terms. Everything is optional, and you can change it anytime.</p>
    <div className="profile-steps" aria-label="Profile sections">{steps.map((label, index) => <button type="button" key={label} className={step === index ? 'active' : ''} aria-pressed={step === index} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</div>
    <form className="profile-form" onSubmit={save}>
      {step === 0 && <div className="profile-fields">
        <label>What should we call you?<input maxLength={40} value={draft.displayName} onChange={event => update('displayName', event.target.value)} placeholder="Your name, if you’d like" autoComplete="nickname" /></label>
        <label>Fashion Preference <span className="optional-label">Optional</span><select value={draft.fashionPreference} onChange={event => update('fashionPreference', event.target.value as StyleProfile['fashionPreference'])}><option value="">Choose if you’d like</option>{fashionPreferences.map(value => <option key={value}>{value}</option>)}</select><small>This guides inspiration. Every clothing category is always yours to explore.</small></label>
        <ChipChoices legend="Styles you gravitate towards" options={styleOptions} values={draft.styles} onChange={values => update('styles', values)} />
        <label>Brands you like<input maxLength={500} value={csv.brands} onChange={event => setCsv(current => ({ ...current, brands: event.target.value }))} placeholder="Optional · separate names with commas" /></label>
        <label>Fashion, to me, means…<textarea maxLength={500} value={draft.fashionPerspective} onChange={event => update('fashionPerspective', event.target.value)} placeholder="Self-expression? Comfort? Mixing traditions? Tell us in your own words." rows={3} /></label>
      </div>}
      {step === 1 && <div className="profile-fields">
        <div className="profile-columns"><label>Colors you love<input maxLength={500} value={csv.favoriteColors} onChange={event => setCsv(current => ({ ...current, favoriteColors: event.target.value }))} placeholder="e.g. Lilac, navy, cream" /></label><label>Colors you prefer to avoid<input maxLength={500} value={csv.avoidedColors} onChange={event => setCsv(current => ({ ...current, avoidedColors: event.target.value }))} placeholder="Separate colors with commas" /></label></div>
        <ChipChoices legend="Your preferred fits" options={fitOptions} values={draft.fits} onChange={values => update('fits', values)} />
        <label>Fabrics you avoid<input maxLength={500} value={csv.avoidedFabrics} onChange={event => setCsv(current => ({ ...current, avoidedFabrics: event.target.value }))} placeholder="Optional · e.g. wool, polyester" /></label>
        <label>Comfort comes first<textarea maxLength={240} value={draft.comfort} onChange={event => update('comfort', event.target.value)} placeholder="e.g. Breathable clothes and comfortable shoes for a long commute" rows={2} /></label>
        <label>Coverage preferences<textarea maxLength={240} value={draft.coverage} onChange={event => update('coverage', event.target.value)} placeholder="Anything you’d like your stylist to keep in mind" rows={2} /></label>
        <p className="profile-hint">We can check colors from your item details. Fit, fabric and coverage need matching garment information; quick styling cannot guarantee them yet.</p>
      </div>}
      {step === 2 && <div className="profile-fields">
        <ChipChoices legend="What does your week look like?" options={occasionOptions} values={draft.occasions} onChange={values => update('occasions', values)} />
        <div className="profile-columns"><label>Fashion region<input maxLength={80} value={draft.region} onChange={event => update('region', event.target.value)} placeholder="India + Global" /></label><label>Your usual climate<input maxLength={80} value={draft.climate} onChange={event => update('climate', event.target.value)} placeholder="e.g. Hot and humid" /></label></div>
        <label>How much do you like to explore?<select value={draft.exploration} onChange={event => update('exploration', event.target.value as StyleProfile['exploration'])}>{explorationOptions.map(value => <option key={value}>{value}</option>)}</select><small>Familiar favorites, a little discovery, or something adventurous.</small></label>
        <label className="profile-toggle"><input type="checkbox" checked={draft.personalization} onChange={event => update('personalization', event.target.checked)} /><span><strong>Personalize with my profile and memories</strong><small>You can turn this off and still use your wardrobe.</small></span></label>
        <label className="profile-toggle"><input type="checkbox" checked={draft.learnFromFeedback} onChange={event => update('learnFromFeedback', event.target.checked)} /><span><strong>Use my likes and saves to tune inspiration</strong><small>A like can guide the feed; it won’t become a permanent memory.</small></span></label>
      </div>}
      {step === 3 && <div className="profile-fields">
        <div className="memory-heading"><Heart size={22} /><div><h3>What Almira remembers</h3><p>Only preferences you choose to remember belong here.</p></div><span>{notes.length}/20</span></div>
        {notes.length ? <ul className="memory-list">{notes.map(memory => <li key={memory.id}><div><strong>{memory.text}</strong><small>{memory.scope} · Confirmed by you</small></div><button type="button" className="text-button" aria-label={`Edit memory: ${memory.text}`} onClick={() => { setEditingMemory(memory.id); setMemoryText(memory.text); setMemoryScope(memory.scope) }}>Edit</button><button type="button" className="icon-button" aria-label={`Forget: ${memory.text}`} onClick={() => { setNotes(current => current.filter(item => item.id !== memory.id)); if (editingMemory === memory.id) { setEditingMemory(null); setMemoryText('') } }}><Trash2 size={16} /></button></li>)}</ul> : <div className="memory-empty"><Sparkles size={24} /><p>A fresh start. Add a preference you want to remember.</p></div>}
        <label>{editingMemory ? 'Edit your remembered preference' : 'Remember something about my style'}<textarea maxLength={240} value={memoryText} onChange={event => setMemoryText(event.target.value)} placeholder="e.g. I prefer relaxed fits for college." rows={2} /></label>
        <div className="memory-add"><label>Use it for<select value={memoryScope} onChange={event => setMemoryScope(event.target.value)}><option>All occasions</option>{occasionOptions.map(value => <option key={value}>{value}</option>)}</select></label><button type="button" className="button button-soft button-small" disabled={!memoryText.trim() || (!editingMemory && notes.length >= 20)} onClick={addMemory}><Plus size={16} />{editingMemory ? 'Update memory' : 'Remember this'}</button></div>
        {editingMemory && <button type="button" className="text-button" onClick={() => { setEditingMemory(null); setMemoryText('') }}>Cancel memory edit</button>}
        {notes.length > 0 && <button type="button" className="text-button memory-reset" onClick={() => { setNotes([]); setEditingMemory(null); setMemoryText('') }}>Reset remembered preferences</button>}
        <p className="profile-hint">Your profile is kept separately. Save below to apply changes; closing this sheet leaves your saved memories as they were.</p>
      </div>}
      <div className="profile-footer"><button type="button" className="text-button" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? 'Back' : 'Maybe later'}</button>{step < 3 && <button type="button" className="button button-soft button-small" onClick={() => setStep(step + 1)}>Next</button>}<button type="submit" className="button button-primary button-small" disabled={Boolean(memoryText.trim())}><Check size={16} />Save my style</button></div>
      {memoryText.trim() && <p className="profile-hint" role="status">Remember this note or clear it before saving your profile.</p>}
    </form>
  </Modal>
}
