import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateManifest, resolveSkills, scanLocalPackage } from 'npm-agentskills'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

async function main() {
  console.log('Testing npm-agentskills core...\n')

  // Scan local package.json
  const localSkills = await scanLocalPackage(__dirname)
  console.log('Local skills found:', localSkills.length)

  // Resolve skills
  const skills = await resolveSkills([], localSkills)
  console.log('Resolved skills:', skills.map(s => s.name))

  // Generate manifest
  const manifest = generateManifest(skills)
  console.log('Manifest:', JSON.stringify(manifest, null, 2))

  // Write to output
  const outputDir = join(__dirname, 'output')
  await fsp.mkdir(outputDir, { recursive: true })
  await fsp.writeFile(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log('\nWrote manifest to output/manifest.json')
}

main().catch(console.error)
