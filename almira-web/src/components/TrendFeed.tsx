import { useState } from 'react'
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import { previewStories, type TrendStory } from '../trends'
import { EditorialArt } from './EditorialArt'
import { Modal } from './Modal'

function TrendCard({ story, featured = false, onRead, onWear }: {
  story: TrendStory; featured?: boolean; onRead: (story: TrendStory) => void; onWear: (story: TrendStory) => void
}) {
  return <article className={`trend-card ${featured ? 'trend-featured' : 'trend-small'}`}>
    <button className="trend-art-button" onClick={() => onRead(story)} aria-label={`Read preview: ${story.title}`}><EditorialArt kind={story.artwork} /><span className="art-caption">Original illustration</span></button>
    <div className="trend-copy"><span className="section-kicker">{story.category}</span><button className="trend-title-button" onClick={() => onRead(story)}><h3>{story.title}</h3></button><p>{story.deck}</p><div className="trend-meta"><span>Almira preview</span><span>Sample story</span></div><div className="trend-footer"><div className="color-dots" aria-label="Illustration color palette">{story.colors.map(color => <i key={color} style={{ background: color }} />)}</div><button className="text-button" onClick={() => onWear(story)}>Wear it with mine <ArrowRight size={15} /></button></div></div>
  </article>
}

export function TrendFeed({ onWear }: { onWear: (story: TrendStory) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<TrendStory | null>(null)
  const [filter, setFilter] = useState('All stories')
  function wear(story: TrendStory) { setExpanded(false); setSelected(null); onWear(story) }
  const filtered = previewStories.filter(story => filter === 'All stories' || story.tags.includes(filter))
  return <>
    <section className="section-block trends-section" aria-labelledby="trends-title"><div className="section-heading"><div><span className="section-kicker">A LITTLE INSPIRATION</span><h2 id="trends-title">Today in <span className="gradient-text">Style</span> <span className="heading-spark">✧</span></h2><p className="section-intro">Beautiful ideas, with a little room for you.</p></div><button className="text-button" onClick={() => setExpanded(true)}>See all <ChevronRight size={17} /></button></div>
      <div className="preview-disclosure"><Sparkles size={14} /><span>Design preview · sample stories and illustrations. Live fashion coverage is coming.</span></div>
      <div className="editorial-grid"><TrendCard story={previewStories[0]} featured onRead={setSelected} onWear={wear} /><div className="editorial-side">{previewStories.slice(1).map(story => <TrendCard key={story.id} story={story} onRead={setSelected} onWear={wear} />)}</div></div>
    </section>
    {expanded && !selected && <Modal title="A little inspiration" kicker="TODAY IN STYLE · PREVIEW" onClose={() => setExpanded(false)} className="trends-modal"><p className="stylist-intro">Explore these sample stories. Every illustration belongs to this design preview.</p><div className="story-filters">{['All stories', 'Color', 'Layers', 'Accessories'].map(label => <button key={label} className={label === filter ? 'filter-pill active' : 'filter-pill'} onClick={() => setFilter(label)} aria-pressed={label === filter}>{label}</button>)}</div><div className="all-stories">{filtered.map(story => <TrendCard key={story.id} story={story} featured onRead={setSelected} onWear={wear} />)}</div></Modal>}
    {selected && <Modal title={selected.title} kicker={`${selected.category} · PREVIEW`} onClose={() => setSelected(null)} className="story-modal"><div className="story-detail-art"><EditorialArt kind={selected.artwork} /></div><div className="story-detail-meta"><span>Original Almira illustration</span><span>Sample story · no event reporting</span></div><p className="story-summary">{selected.summary}</p><div className="story-tags">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="story-action"><div><h3>Make the idea yours</h3><p>Find a starting point in your own wardrobe.</p></div><button className="button button-primary" onClick={() => wear(selected)}><Sparkles size={17} /> Wear it with mine</button></div></Modal>}
  </>
}
