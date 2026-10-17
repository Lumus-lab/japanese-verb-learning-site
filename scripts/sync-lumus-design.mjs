import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const design = path.resolve(process.env.LUMUS_DESIGN_DIR || path.join(project, '../design-system'))
const target = path.join(project, 'public/design')
const hash = (value) => createHash('sha256').update(value).digest('hex')
const hasSource = await stat(design).then(() => true).catch((error) => {
  if (error.code !== 'ENOENT' || process.env.LUMUS_DESIGN_DIR) throw error
  return false
})

if (!hasSource) {
  // Independent checkouts and Pages builds use the checked-in design snapshot.
  const version = JSON.parse(await readFile(path.join(target, 'version.json'), 'utf8'))
  const tokens = await readFile(path.join(target, 'tokens.css'), 'utf8')
  const shell = await readFile(path.join(target, 'lumus-shell.css'), 'utf8')
  if (!tokens.includes(version.themeId) || hash(tokens) !== version.tokensSha256 || hash(shell) !== version.shellSha256) {
    throw new Error('Pinned Lumus design files do not match version.json. Sync from the design source first.')
  }
  console.log(`Using pinned Lumus theme: ${version.themeId}`)
} else {
  const theme = JSON.parse(await readFile(path.join(design, 'current.theme.json'), 'utf8'))
  const tokens = await readFile(path.join(design, 'tokens.css'), 'utf8')
  const shell = await readFile(path.join(design, 'lumus-shell.css'), 'utf8')
  if (!tokens.includes(theme.id)) throw new Error('Design tokens do not match the selected theme.')
  await mkdir(target, { recursive: true })
  for (const name of ['tokens.css', 'lumus-shell.css']) await copyFile(path.join(design, name), path.join(target, name))
  await writeFile(path.join(target, 'version.json'), JSON.stringify({
    schemaVersion: 1,
    themeId: theme.id,
    fingerprint: theme.fingerprint,
    tokensSha256: hash(tokens),
    shellSha256: hash(shell),
  }, null, 2) + '\n')
  console.log(`Lumus theme: ${theme.id}`)
}
