import { jasennaResepti } from './reseptiTiedosto'
import { TAGIT } from './tags'
import type { Resepti } from './types'

// Vite lukee kansion reseptit/ kaikki .md-tiedostot mukaan sovellukseen julkaisun yhteydessä.
const tiedostot = import.meta.glob<string>('/reseptit/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const RESEPTIT: Resepti[] = Object.entries(tiedostot)
  .map(([polku, teksti]) => {
    const id = (polku.split('/').pop() ?? polku).replace(/\.md$/i, '')
    return jasennaResepti(id, teksti, TAGIT)
  })
  .sort((a, b) => a.nimi.localeCompare(b.nimi, 'fi'))
