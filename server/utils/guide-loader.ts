import { readFile } from 'fs/promises'
import { join } from 'path'

const cache = new Map<string, string>()

export async function loadGuideFile(profilePath: string): Promise<string> {
  if (cache.has(profilePath)) return cache.get(profilePath)!

  try {
    const content = await readFile(join(process.cwd(), profilePath), 'utf-8')
    cache.set(profilePath, content)
    return content
  } catch {
    return ''
  }
}
