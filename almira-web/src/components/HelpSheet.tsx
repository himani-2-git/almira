import { ChevronDown } from 'lucide-react'
import { guideIntro, guideSections, guideStatus } from '../help'
import { Modal } from './Modal'

export function HelpSheet({ onClose }: { onClose: () => void }) {
  return <Modal title="How to use Almira" kicker="YOUR CLOSET COMPANION" onClose={onClose} className="help-modal">
    <p className="help-intro">{guideIntro}</p>
    <p className="help-version"><strong>A little heads-up</strong>{guideStatus}</p>
    <div className="help-sections">{guideSections.map((section, index) => <details key={section.id} open={index === 0}>
      <summary><span className="help-number">{String(index + 1).padStart(2, '0')}</span><span>{section.title}</span><ChevronDown size={17} aria-hidden="true" /></summary>
      <div className="help-section-content"><ol>{section.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="help-note">{section.note}</p></div>
    </details>)}</div>
    <div className="help-footer"><button className="button button-primary button-small" onClick={onClose}>Back to my closet</button></div>
  </Modal>
}
