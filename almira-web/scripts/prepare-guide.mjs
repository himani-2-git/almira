import { writeFile } from 'node:fs/promises'
import { guideIntro, guideSections, guideStatus } from '../src/help.ts'

const sections = guideSections.map(section => `## ${section.title}\n\n${section.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n${section.note}`)
await writeFile(new URL('../../docs/user-guide.md', import.meta.url), `# How to use Almira\n\n${guideIntro}\n\n**Current version:** ${guideStatus}\n\nOpen this guide in the app at **Settings → How to use Almira**.\n\n${sections.join('\n\n')}\n\n---\n\nUpdated 1 October 2026. Generated from the same content as the in-app guide; regenerate with \`node scripts/prepare-guide.mjs\` from \`almira-web\`.\n`)
console.log('Prepared docs/user-guide.md from the in-app guide.')
