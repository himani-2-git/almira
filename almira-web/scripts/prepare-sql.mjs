import { readFile, writeFile } from 'node:fs/promises'
const migrations = ['20261001000100_wardrobe_foundation.sql', '20261001000200_style_profiles.sql']
const sections = []
for (const file of migrations) {
  const source = await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8')
  sections.push(`-- ${file}\n${source.replace(/^begin;\s*$/mi, '').replace(/^commit;\s*$/mi, '').trim()}`)
}
await writeFile(new URL('../supabase/setup.sql', import.meta.url), `-- Almira: apply ONCE to the new Supabase project in SQL Editor.\n-- Creates private tables, photo policies and profile sync. Does not delete existing data.\n-- If any statement fails, the entire transaction rolls back.\nbegin;\n\n${sections.join('\n\n')}\n\ncommit;\n`)
console.log('Prepared supabase/setup.sql from both migrations.')
