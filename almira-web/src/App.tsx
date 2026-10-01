import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowRight, BarChart3, BookOpen, Bookmark, CalendarDays, Camera, Check, ChevronRight,
  Clock3, CloudSun, Crown, Download, Gem, Glasses, Heart, LayoutGrid, Menu,
  Pencil, Plus, Scissors, Search, Settings2, Shirt, ShoppingBag,
  Sparkles, Tag, Trash2, Upload, WandSparkles, X,
} from 'lucide-react'
import { categories, emptyData, emptyProfile, isAlmiraData, normalizeData, type AlmiraData, type Category, type Garment, type Outfit, type Page, type StyleProfile, type StyleMemory } from './types'
import { imageToDataUrl, loadData, saveData, clearAccountCache } from './storage'
import { makeRemix } from './remix'
import { TodayScreen } from './components/TodayScreen'
import { StyleSheet } from './components/StyleSheet'
import { Modal } from './components/Modal'
import { GarmentVisual, categorySymbols } from './components/GarmentVisual'
import type { StyleRequest } from './styleEngine'
import { ProfileSheet } from './components/ProfileSheet'
import { ProfileCard } from './components/ProfileCard'
import { AccountPanel } from './components/AccountPanel'
import { HelpSheet } from './components/HelpSheet'
import { useAccount } from './useAccount'
import { supabase } from './supabase'

const pages: { name: Page; icon: typeof Shirt }[] = [
  { name: 'Today', icon: Sparkles },
  { name: 'Wardrobe', icon: Shirt },
  { name: 'Outfits', icon: LayoutGrid },
  { name: 'Insights', icon: BarChart3 },
  { name: 'Settings', icon: Settings2 },
]

const doodleIcons = [Shirt, Glasses, ShoppingBag, Gem, Crown, Scissors, Heart, Tag, Sparkles, Shirt, Gem, ShoppingBag]
const initialDraft = { name: '', category: 'Tops' as Category, color: '', occasion: '', season: 'All year', purchasePrice: '', image: '' }
type Draft = typeof initialDraft

function Doodles({ large = false }: { large?: boolean }) {
  return <div className={`doodles ${large ? 'doodles-large' : ''}`} aria-hidden="true">
    {doodleIcons.map((Icon, index) => <Icon key={index} className={`doodle doodle-${index + 1}`} strokeWidth={1.6} />)}
  </div>
}

function Brand({ onClick }: { onClick?: () => void }) {
  return <button className="brand" type="button" onClick={onClick} aria-label="Almira home">almira<span className="brand-dot">.</span></button>
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p>{action}</div>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function downloadJson(data: AlmiraData) {
  const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `almira-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const account = useAccount()
  const ownerId = account.user?.id
  const scope = ownerId ?? 'guest'
  const [data, setData] = useState<AlmiraData>(emptyData)
  const [storageReady, setStorageReady] = useState(false)
  const [loadedScope, setLoadedScope] = useState<string | null>(null)
  const [canSave, setCanSave] = useState(false)
  const ready = storageReady && loadedScope === scope && !account.loading
  const [entered, setEntered] = useState(false)
  const [page, setPage] = useState<Page>('Today')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [busyImage, setBusyImage] = useState(false)
  const [notice, setNotice] = useState('')
  const [outfitName, setOutfitName] = useState('')
  const [outfitOccasion, setOutfitOccasion] = useState('Everyday')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [remixIndex, setRemixIndex] = useState(0)
  const [styleInitial, setStyleInitial] = useState<Partial<StyleRequest> | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const saveQueue = useRef(Promise.resolve())
  const activeScope = useRef(scope)
  activeScope.current = scope
  const profile = data.profile ?? emptyProfile()
  const memories = data.memories ?? []

  useEffect(() => {
    if (account.loading) return
    let active = true
    setStorageReady(false)
    setModalOpen(false); setStyleInitial(null); setProfileOpen(false); setHelpOpen(false); setSelectedIds([])
    setSearch(''); setCategory('All'); setDraft(initialDraft); setEditingId(null); setBusyImage(false)
    loadData(ownerId).then(saved => {
      if (!active) return
      setData(saved)
      if (saved.garments.length || saved.outfits.length || saved.profile?.updatedAt || ownerId) setEntered(true)
      setLoadedScope(scope); setCanSave(true); setStorageReady(true)
    }).catch(() => {
      if (!active) return
      setData(normalizeData(emptyData)); setLoadedScope(scope); setCanSave(false); setStorageReady(true)
      setNotice('This browser could not open local storage. Changes may not be saved.')
    })
    return () => { active = false }
  }, [account.loading, ownerId, scope])

  useEffect(() => {
    if (!ready || !canSave) return
    saveQueue.current = saveQueue.current.then(() => saveData(data, ownerId)).catch(() => {
      setNotice('Could not save your changes on this device. Export a backup from Settings.')
    })
  }, [data, ready, canSave, ownerId])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const wearCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const wear of data.wears) for (const id of wear.itemIds) counts[id] = (counts[id] ?? 0) + 1
    return counts
  }, [data.wears])

  const filtered = useMemo(() => data.garments.filter(item =>
    (category === 'All' || item.category === category) &&
    `${item.name} ${item.color} ${item.occasion} ${item.season}`.toLowerCase().includes(search.toLowerCase()),
  ), [data.garments, category, search])

  const anchors = useMemo(() => [...data.garments].sort((a, b) =>
    (wearCounts[a.id] ?? 0) - (wearCounts[b.id] ?? 0) || a.createdAt.localeCompare(b.createdAt),
  ), [data.garments, wearCounts])
  const anchor = anchors.length ? anchors[remixIndex % anchors.length] : undefined
  const remix = anchor ? makeRemix(anchor, data.garments, wearCounts) : []
  const recent = [...data.garments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  const totalWears = data.wears.reduce((sum, wear) => sum + wear.itemIds.length, 0)

  function navigate(next: Page) {
    setPage(next)
    setEntered(true)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  function openAdd() {
    setEditingId(null)
    setDraft(initialDraft)
    setModalOpen(true)
  }

  function openEdit(item: Garment) {
    setEditingId(item.id)
    setDraft({ name: item.name, category: item.category, color: item.color, occasion: item.occasion, season: item.season, purchasePrice: item.purchasePrice?.toString() ?? '', image: item.image ?? '' })
    setModalOpen(true)
  }

  async function handleImage(file?: File) {
    if (!file) return
    const requestScope = scope
    setBusyImage(true)
    try {
      const image = await imageToDataUrl(file)
      if (activeScope.current !== requestScope) return
      setDraft(current => ({ ...current, image }))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not read that image.')
    } finally {
      if (activeScope.current === requestScope) setBusyImage(false)
    }
  }

  function saveGarment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) return
    const now = new Date().toISOString()
    const existing = data.garments.find(item => item.id === editingId)
    const item: Garment = {
      id: existing?.id ?? crypto.randomUUID(),
      name: draft.name.trim(), category: draft.category, color: draft.color.trim(),
      occasion: draft.occasion.trim(), season: draft.season, image: draft.image || undefined,
      favorite: existing?.favorite ?? false, createdAt: existing?.createdAt ?? now,
      purchasePrice: draft.purchasePrice ? Number(draft.purchasePrice) : undefined,
    }
    setData(current => ({ ...current, garments: existing ? current.garments.map(garment => garment.id === item.id ? item : garment) : [item, ...current.garments] }))
    setModalOpen(false)
    setNotice(existing ? 'Item updated.' : 'A lovely new item is in your wardrobe!')
    navigate('Wardrobe')
  }

  function removeGarment(id: string) {
    if (!window.confirm('Remove this item from your wardrobe and saved looks?')) return
    setData(current => ({
      ...current,
      garments: current.garments.filter(item => item.id !== id),
      outfits: current.outfits.map(look => ({ ...look, itemIds: look.itemIds.filter(itemId => itemId !== id) })).filter(look => look.itemIds.length),
    }))
    setSelectedIds(ids => ids.filter(itemId => itemId !== id))
    setNotice('Item removed.')
  }

  function toggleFavorite(id: string) {
    setData(current => ({ ...current, garments: current.garments.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item) }))
  }

  function logWear(itemIds: string[], outfitId?: string) {
    if (!itemIds.length) return
    setData(current => ({ ...current, wears: [{ id: crypto.randomUUID(), itemIds, outfitId, wornAt: new Date().toISOString() }, ...current.wears] }))
    setNotice('Logged as worn. Looking good!')
  }

  function saveOutfit(ids = selectedIds, name = outfitName, occasion = outfitOccasion) {
    const validIds = ids.filter(id => data.garments.some(item => item.id === id))
    if (!validIds.length) {
      setNotice('Choose at least one item for this look.')
      return
    }
    const outfit: Outfit = { id: crypto.randomUUID(), name: name.trim() || 'My lovely look', itemIds: validIds, occasion, createdAt: new Date().toISOString() }
    setData(current => ({ ...current, outfits: [outfit, ...current.outfits] }))
    setSelectedIds([])
    setOutfitName('')
    setNotice('Look saved to your outfits.')
  }

  function removeOutfit(id: string) {
    if (!window.confirm('Delete this saved look? Your wear history will stay.')) return
    setData(current => ({ ...current, outfits: current.outfits.filter(outfit => outfit.id !== id) }))
  }

  async function importBackup(file?: File) {
    if (!file) return
    const requestScope = scope
    try {
      const parsed = JSON.parse(await file.text())
      if (activeScope.current !== requestScope) return
      const candidate = parsed?.data
      if (!isAlmiraData(candidate)) throw new Error('That is not a valid Almira backup.')
      if (!window.confirm('Replace the wardrobe, profile and memories saved on this device with this backup?')) return
      setData(normalizeData(candidate))
      setNotice('Backup imported.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not import the backup.')
    }
  }

  function saveProfile(next: StyleProfile, nextMemories: StyleMemory[]) {
    setData(current => ({ ...current, profile: next, memories: nextMemories }))
    setNotice('Your style and memories are saved on this device.')
  }

  function resetProfile() {
    if (!window.confirm('Reset your style profile and remembered preferences on this device? Your clothes and outfits will stay.')) return
    setData(current => ({ ...current, profile: emptyProfile(), memories: [] }))
    setNotice('Your style profile and memories were reset on this device.')
  }

  async function bringGuestWardrobe() {
    if (!ownerId || !ready) return
    const requestScope = scope
    const guest = await loadData()
    if (activeScope.current !== requestScope) return
    if (!guest.garments.length && !guest.outfits.length && !guest.profile?.updatedAt) { setNotice('There’s no guest wardrobe on this device to copy.'); return }
    if (!window.confirm('Copy your guest wardrobe and style into this account’s device copy? An existing account copy will be exported first.')) return
    if (data.garments.length || data.outfits.length || profile.updatedAt || memories.length) downloadJson(data)
    setData(guest); setNotice('Device wardrobe copied. The original guest copy is still available when you sign out.')
  }

  async function signOut() {
    if (!supabase || !ownerId) return
    const signingOutOwner = ownerId
    downloadJson(data)
    await saveQueue.current
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw new Error('Could not sign out')
    await clearAccountCache(signingOutOwner)
    setNotice('Backup exported. You’re signed out on this device.')
  }

  if (!ready) return <div className="loading-screen"><Brand /><p>Opening your wardrobe...</p></div>

  if (!entered) return <main className="welcome-screen"><Doodles large /><div className="welcome-card">
    <h1 className="welcome-brand">almira</h1>
    <p className="welcome-tagline">Your Style, Organized</p>
    <p className="welcome-description">Transform your wardrobe into a smart, searchable collection.<br />Never forget what you own again.</p>
    <button className="button button-primary welcome-button" onClick={() => setEntered(true)}><ArrowRight size={19} /> Get Started</button>
  </div></main>

  return <div className="app-shell">
    <Doodles />
    <header className="topbar"><div className="topbar-inner">
      <Brand onClick={() => navigate('Today')} />
      <nav className="desktop-nav" aria-label="Main navigation">{pages.map(({ name }) => <button key={name} className={`nav-link ${page === name ? 'active' : ''}`} aria-current={page === name ? 'page' : undefined} onClick={() => navigate(name)}>{name}</button>)}</nav>
      <button className="topbar-add" onClick={openAdd}><Plus size={17} /> Add item</button>
      <button className="mobile-menu" onClick={() => navigate('Settings')} aria-label="Open settings"><Menu size={23} /></button>
    </div></header>

    <main className="main-content">
      {page === 'Today' && <TodayScreen data={data} recent={recent} remix={remix} onNavigate={navigate} onAdd={openAdd} onEdit={item => { navigate('Wardrobe'); openEdit(item) }} onStyle={() => setStyleInitial({})} onProfile={() => setProfileOpen(true)} onTrend={story => setStyleInitial({ occasion: story.occasion, trendTags: story.tags, mood: story.tags.includes('Playful') ? 'Playful' : 'Soft & easy' })} onSaveRemix={() => saveOutfit(remix.map(item => item.id), 'Fresh little look', 'Everyday')} onShuffle={() => setRemixIndex(index => index + 1)} />}

      {page === 'Wardrobe' && <><div className="page-heading"><div><span className="section-kicker">YOUR COLLECTION</span><h1>My Wardrobe <span className="heading-spark">✦</span></h1><p>Every piece you love, all in one place.</p></div><button className="button button-primary" onClick={openAdd}><Plus size={18} /> Add New Item</button></div>
        <div className="toolbar"><label className="search-box"><Search size={19} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your wardrobe..." aria-label="Search wardrobe" /></label><div className="filter-row" aria-label="Filter by category"><button className={category === 'All' ? 'filter-pill active' : 'filter-pill'} onClick={() => setCategory('All')}>All pieces</button>{categories.map(name => <button key={name} className={category === name ? 'filter-pill active' : 'filter-pill'} onClick={() => setCategory(name)}>{name}</button>)}</div></div>
        {filtered.length ? <div className="wardrobe-grid">{filtered.map(item => <article className="garment-card" key={item.id}><GarmentVisual garment={item} /><button className={`favorite-button ${item.favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label={item.favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}><Heart size={20} fill={item.favorite ? 'currentColor' : 'none'} /></button><div className="garment-body"><div className="garment-label"><strong>{item.name}</strong><span>{item.category}</span></div><p>{[item.color, item.occasion].filter(Boolean).join(' · ') || 'Make it yours'}</p><small><Clock3 size={13} /> Worn {wearCounts[item.id] ?? 0} times</small><div className="garment-actions"><button onClick={() => logWear([item.id])}><Check size={15} /> Wore it</button><button aria-label={`Edit ${item.name}`} onClick={() => openEdit(item)}><Pencil size={16} /></button><button aria-label={`Delete ${item.name}`} onClick={() => removeGarment(item.id)}><Trash2 size={16} /></button></div></div></article>)}</div> : <EmptyState icon={<Shirt size={30} />} title={data.garments.length ? 'No pieces found' : 'A fresh closet awaits'} text={data.garments.length ? 'Try a different search or category.' : 'Add a photo or a few details to begin your collection.'} action={data.garments.length ? <button className="button button-soft button-small" onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button> : <button className="button button-primary button-small" onClick={openAdd}><Plus size={16} /> Add first item</button>} />}
      </>}

      {page === 'Outfits' && <><div className="page-heading"><div><span className="section-kicker">MAKE IT YOURS</span><h1>Outfit Planner <span className="heading-spark">✦</span></h1><p>Mix, match, and save the looks that feel like you.</p></div></div>
        <div className="builder-layout"><section className="glass-panel builder-panel"><div className="panel-heading"><div><h2>Build a look</h2><p>Tap the pieces you want to wear together.</p></div><span className="count-badge">{selectedIds.length} selected</span></div>
          {data.garments.length ? <><div className="builder-groups">{categories.map(name => { const items = data.garments.filter(item => item.category === name); return items.length ? <div className="builder-group" key={name}><h3>{name}</h3><div className="builder-picks">{items.map(item => <button key={item.id} className={`builder-pick ${selectedIds.includes(item.id) ? 'selected' : ''}`} onClick={() => setSelectedIds(ids => ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id])} aria-pressed={selectedIds.includes(item.id)}><GarmentVisual garment={item} /><span>{item.name}</span>{selectedIds.includes(item.id) && <Check className="pick-check" size={18} />}</button>)}</div></div> : null })}</div><div className="builder-footer"><label>Look name<input value={outfitName} onChange={event => setOutfitName(event.target.value)} placeholder="e.g. Coffee date favorite" /></label><label>Occasion<select value={outfitOccasion} onChange={event => setOutfitOccasion(event.target.value)}><option>Everyday</option><option>Work</option><option>College</option><option>Party</option><option>Wedding</option><option>Travel</option></select></label><button className="button button-primary" onClick={() => saveOutfit()} disabled={!selectedIds.length}><Bookmark size={17} /> Save this look</button></div></> : <EmptyState icon={<Shirt size={28} />} title="Add your first pieces" text="Your wardrobe pieces will appear here to mix and match." action={<button className="button button-primary button-small" onClick={openAdd}>Add an item</button>} />}
        </section><aside className="glass-panel look-preview"><span className="section-kicker">YOUR CANVAS</span><h2>Looking lovely!</h2><div className="preview-outfit">{selectedIds.length ? selectedIds.map(id => { const item = data.garments.find(garment => garment.id === id); return item && <GarmentVisual key={id} garment={item} /> }) : <div className="preview-empty"><WandSparkles size={35} /><span>Your look appears here</span></div>}</div><p>{selectedIds.length ? data.garments.filter(item => selectedIds.includes(item.id)).map(item => item.name).join(' + ') : 'Choose your pieces to see them together.'}</p></aside></div>
        <section className="section-block"><div className="section-heading"><div><span className="section-kicker">SAVED FOR LATER</span><h2>My Looks</h2></div></div>{data.outfits.length ? <div className="outfit-grid">{data.outfits.map(outfit => { const items = outfit.itemIds.map(id => data.garments.find(item => item.id === id)).filter((item): item is Garment => Boolean(item)); return <article className="outfit-card" key={outfit.id}><div className="outfit-photos">{items.slice(0, 4).map(item => <GarmentVisual key={item.id} garment={item} />)}</div><div className="outfit-info"><small>{outfit.occasion} · {formatDate(outfit.createdAt)}</small><h3>{outfit.name}</h3><p>{items.map(item => item.name).join(' + ')}</p><div className="outfit-actions"><button onClick={() => logWear(items.map(item => item.id), outfit.id)}><Check size={15} /> Wore this</button><button aria-label={`Delete ${outfit.name}`} onClick={() => removeOutfit(outfit.id)}><Trash2 size={16} /></button></div></div></article> })}</div> : <EmptyState icon={<LayoutGrid size={29} />} title="Looks you love will live here" text="Build and save an outfit to start your collection." />}</section>
      </>}

      {page === 'Insights' && <><div className="page-heading"><div><span className="section-kicker">THE LITTLE DETAILS</span><h1>Style Insights <span className="heading-spark">✦</span></h1><p>A gentle look at what you own and wear.</p></div></div><div className="stats-grid"><div className="stat-card"><span className="stat-icon purple"><Shirt /></span><strong>{data.garments.length}</strong><span>pieces in your wardrobe</span></div><div className="stat-card"><span className="stat-icon pink"><Heart /></span><strong>{data.outfits.length}</strong><span>looks you've saved</span></div><div className="stat-card"><span className="stat-icon blue"><CalendarDays /></span><strong>{totalWears}</strong><span>item wears logged</span></div><div className="stat-card"><span className="stat-icon peach"><Sparkles /></span><strong>{data.garments.filter(item => (wearCounts[item.id] ?? 0) === 0).length}</strong><span>pieces to rediscover</span></div></div>
        <div className="insights-layout"><section className="glass-panel"><span className="section-kicker">YOUR CLOSET AT A GLANCE</span><h2>What’s in your wardrobe</h2>{data.garments.length ? <div className="category-bars">{categories.map(name => { const count = data.garments.filter(item => item.category === name).length; return <div className="category-bar" key={name}><div><span>{categorySymbols[name]} {name}</span><strong>{count}</strong></div><div className="bar-track"><i style={{ width: `${count / data.garments.length * 100}%` }} /></div></div> })}</div> : <EmptyState icon={<BarChart3 size={26} />} title="Your story starts with one piece" text="Add an item to see your wardrobe take shape." />}</section><section className="glass-panel"><span className="section-kicker">A SECOND CHANCE</span><h2>Ready for a rewear</h2><p className="panel-intro">Pieces with the fewest logged wears rise to the top.</p>{anchors.length ? <div className="rewear-list">{anchors.slice(0, 4).map(item => <div key={item.id}><GarmentVisual garment={item} /><div><strong>{item.name}</strong><small>{wearCounts[item.id] ?? 0} wears · {item.category}</small></div><button aria-label={`Wear ${item.name} today`} onClick={() => logWear([item.id])}><ChevronRight size={18} /></button></div>)}</div> : <EmptyState icon={<Heart size={26} />} title="Nothing to rediscover yet" text="Your pieces will show up here once you add them." />}</section></div>
      </>}

      {page === 'Settings' && <><div className="page-heading"><div><span className="section-kicker">YOUR SPACE</span><h1>Settings <span className="heading-spark">✦</span></h1><p>Keep your wardrobe yours.</p></div></div><ProfileCard profile={profile} memories={memories} onEdit={() => setProfileOpen(true)} onReset={resetProfile} /><AccountPanel key={scope} user={account.user} profile={profile} memories={memories} onLoad={saveProfile} onBringGuest={bringGuestWardrobe} onSignOut={signOut} /><div className="settings-layout"><section className="glass-panel"><span className="settings-icon"><Download size={24} /></span><h2>Your data, your way</h2><p>Almira keeps your wardrobe, profile and memories on this device. Export a backup before changing devices or clearing browser data. Guest and signed-in copies are kept separately.</p><div className="settings-actions"><button className="button button-primary" onClick={() => downloadJson(data)}><Download size={17} /> Export backup</button><label className="button button-soft upload-button"><Upload size={17} /> Import backup<input type="file" accept="application/json,.json" onChange={event => { void importBackup(event.target.files?.[0]); event.target.value = '' }} /></label></div></section><section className="glass-panel"><span className="settings-icon pink"><CloudSun size={24} /></span><h2>Made for every screen</h2><p>Use Almira in your phone or desktop browser. You can add it to your home screen where your browser supports installation. Live fashion coverage and AI styling are being connected.</p><button className="text-button" onClick={() => navigate('Today')}>Back to Today <ArrowRight size={16} /></button></section></div></>}
      {page === 'Settings' && <section className="glass-panel help-entry" aria-label="Almira user guide"><span className="settings-icon"><BookOpen size={24} /></span><div className="help-entry-copy"><h2>A little guide to your closet</h2><p>From your first piece to a favorite look. Find your way around Almira.</p></div><button className="button button-soft button-small" onClick={() => setHelpOpen(true)}>How to use Almira <ArrowRight size={16} /></button></section>}
    </main>

    <nav className="bottom-nav" aria-label="Mobile navigation">{pages.map(({ name, icon: Icon }) => <button key={name} className={page === name ? 'active' : ''} aria-current={page === name ? 'page' : undefined} onClick={() => navigate(name)}><Icon size={21} /><span>{name}</span></button>)}</nav>
    {notice && <div role="status" className="toast"><Sparkles size={16} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button></div>}
    {helpOpen && <HelpSheet onClose={() => setHelpOpen(false)} />}

    {modalOpen && <Modal title={editingId ? 'Edit your item' : 'Add a new item'} kicker="A LITTLE CLOSET MAGIC" onClose={() => setModalOpen(false)}><form onSubmit={saveGarment}><label className="image-picker"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void handleImage(event.target.files?.[0])} /><span className="image-picker-preview">{draft.image ? <img src={draft.image} alt="Garment preview" /> : <Camera size={30} />}</span><strong>{busyImage ? 'Preparing image…' : draft.image ? 'Change photo' : 'Add a photo'}</strong><small>JPG, PNG or WebP · up to 12 MB</small></label><div className="form-grid"><label className="wide">Item name <input required maxLength={100} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. My favorite lilac shirt" /></label><label>Category <select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value as Category })}>{categories.map(name => <option key={name}>{name}</option>)}</select></label><label>Color <input value={draft.color} onChange={event => setDraft({ ...draft, color: event.target.value })} placeholder="e.g. Lilac" /></label><label>Occasion <input value={draft.occasion} onChange={event => setDraft({ ...draft, occasion: event.target.value })} placeholder="e.g. Everyday" /></label><label>Season <select value={draft.season} onChange={event => setDraft({ ...draft, season: event.target.value })}>{['All year', 'Spring', 'Summer', 'Autumn', 'Winter', 'Monsoon'].map(name => <option key={name}>{name}</option>)}</select></label><label className="wide">Purchase price <input type="number" min="0" step="0.01" value={draft.purchasePrice} onChange={event => setDraft({ ...draft, purchasePrice: event.target.value })} placeholder="Optional" /></label></div><div className="modal-actions"><button type="button" className="button button-soft" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busyImage}><Check size={17} /> {editingId ? 'Save changes' : 'Add to wardrobe'}</button></div></form></Modal>}
    {styleInitial && <StyleSheet garments={data.garments} wearCounts={wearCounts} profile={profile} initial={styleInitial} onClose={() => setStyleInitial(null)} onAdd={() => { setStyleInitial(null); openAdd() }} onSave={saveOutfit} onWear={ids => logWear(ids)} />}
    {profileOpen && <ProfileSheet profile={profile} memories={memories} onClose={() => setProfileOpen(false)} onSave={saveProfile} />}
  </div>
}
