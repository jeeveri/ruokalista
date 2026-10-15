import type { Aine, Resepti, Vaihe } from './types'

// Tunnetut mittayksiköt. Jos aineksen määrän perässä on jokin näistä, se luetaan yksiköksi.
const YKSIKOT = new Set([
  'g', 'kg', 'mg', 'dl', 'l', 'ml', 'cl', 'tl', 'rkl', 'kpl', 'ps', 'prk', 'pkt', 'rs', 'tlk',
  'ruukku', 'ruukkua', 'nippu', 'nippua', 'purkki', 'purkkia', 'pussi', 'pussia', 'siivu', 'siivua',
])

function normalisoi(teksti: string): string {
  return teksti.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
}

function erotaFrontmatter(teksti: string): { fm: Record<string, string>; runko: string } {
  const t = normalisoi(teksti)
  const m = t.match(/^---\n([\s\S]*?)\n---\s*(?:\n|$)([\s\S]*)$/)
  if (!m) return { fm: {}, runko: t }
  const fm: Record<string, string> = {}
  for (const rivi of m[1].split('\n')) {
    const i = rivi.indexOf(':')
    if (i < 1) continue
    fm[rivi.slice(0, i).trim().toLowerCase()] = rivi.slice(i + 1).trim()
  }
  return { fm, runko: m[2] }
}

function lueLuku(arvo: string | undefined): number {
  if (!arvo) return 0
  const m = arvo.match(/\d+(?:[.,]\d+)?/)
  return m ? Number(m[0].replace(',', '.')) : 0
}

// "45", "noin 45 min", "1 h 30 min" ja "1,5 h" -> minuutit
function lueKesto(arvo: string | undefined): number {
  if (!arvo) return 0
  const t = arvo.toLowerCase()
  const h = t.match(/(\d+(?:[.,]\d+)?)\s*(?:h|tunti|tuntia)/)
  const min = t.match(/(\d+)\s*(?:min|minuuttia)/)
  if (h || min) {
    return Math.round((h ? Number(h[1].replace(',', '.')) * 60 : 0) + (min ? Number(min[1]) : 0))
  }
  return lueLuku(arvo)
}

// "[a, b, c]" tai "[a b c]" tai "a, b" -> ["a", "b", "c"]
function lueLista(arvo: string | undefined): string[] {
  if (!arvo) return []
  const sisus = arvo
    .trim()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/["']/g, '')
  const osat = sisus.includes(',') ? sisus.split(',') : sisus.split(/\s+/)
  return osat.map((s) => s.trim().toLowerCase()).filter(Boolean)
}

function jaaOsiin(runko: string): Map<string, string> {
  const osat = new Map<string, string>()
  let nimi: string | null = null
  let rivit: string[] = []
  const tallenna = () => {
    if (nimi !== null) osat.set(nimi, rivit.join('\n').trim())
  }
  for (const rivi of runko.split('\n')) {
    const m = rivi.match(/^##\s+(.+?)\s*$/)
    if (m) {
      tallenna()
      nimi = m[1].toLowerCase()
      rivit = []
    } else {
      rivit.push(rivi)
    }
  }
  tallenna()
  return osat
}

function lueMaara(rivi: string): { maara: number | null; loput: string } {
  const s = rivi.trim()
  // Murtoluku: "1/2" tai "1 1/2"
  let m = s.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)\s+(.*)$/)
  if (m) {
    const kokonaiset = m[1] ? Number(m[1]) : 0
    return { maara: kokonaiset + Number(m[2]) / Number(m[3]), loput: m[4] }
  }
  // Kokonaisluku tai desimaali, mahdollinen väli ("2-3"): käytetään alkupäätä
  m = s.match(/^(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?\s*(.*)$/)
  if (m) return { maara: Number(m[1].replace(',', '.')), loput: m[2] }
  return { maara: null, loput: s }
}

export function lueAineet(teksti: string): Aine[] {
  const aineet: Aine[] = []
  for (const raaka of teksti.split('\n')) {
    const rivi = raaka.trim().replace(/^[-*+]\s+/, '').trim()
    if (rivi === '' || rivi.startsWith('#') || /^-{3,}$/.test(rivi)) continue
    if (rivi.endsWith(':') || /^\*\*.*\*\*:?$/.test(rivi)) continue // ryhmän otsikko, esim. "Kastike:"

    const { maara, loput } = lueMaara(rivi)
    const sanat = loput.split(/\s+/)
    let yksikko = ''
    let nimi = loput
    if (maara !== null && sanat.length > 1 && YKSIKOT.has(sanat[0].toLowerCase())) {
      yksikko = sanat[0].toLowerCase()
      nimi = sanat.slice(1).join(' ')
    }
    nimi = nimi.replace(/\s+/g, ' ').trim()
    if (nimi !== '') aineet.push({ nimi, maara, yksikko })
  }
  return aineet
}

export function aineRivi(a: Aine): string {
  const maara = a.maara === null ? '' : String(a.maara).replace('.', ',')
  return [maara, a.yksikko, a.nimi].filter((x) => x !== '').join(' ')
}

// Pilkkoo valmistus-osion vaiheisiin: ">"-rivit ovat vaiheen aineet, numeroidut rivit askeleita,
// "---" erottaa vaiheet. Uusi ">"-lohko askelten jälkeen aloittaa uuden vaiheen myös ilman "---".
export function jasennaVaiheet(valmistus: string): Vaihe[] {
  const vaiheet: Vaihe[] = []
  let nykyinen: Vaihe = { aineet: [], askeleet: [] }

  const sulje = () => {
    if (nykyinen.aineet.length > 0 || nykyinen.askeleet.length > 0) vaiheet.push(nykyinen)
    nykyinen = { aineet: [], askeleet: [] }
  }

  for (const raaka of normalisoi(valmistus).split('\n')) {
    const rivi = raaka.trim()
    if (rivi === '') continue
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(rivi)) {
      sulje()
      continue
    }
    if (rivi.startsWith('>')) {
      if (nykyinen.askeleet.length > 0) sulje()
      nykyinen.aineet.push(rivi.replace(/^>\s?/, '').trim())
      continue
    }
    const nro = rivi.match(/^(\d+)[.)]\s+(.*)$/)
    if (nro) nykyinen.askeleet.push({ numero: Number(nro[1]), teksti: nro[2] })
    else nykyinen.askeleet.push({ numero: null, teksti: rivi })
  }
  sulje()
  return vaiheet
}

// sallitut = tags.ts:n tunnistelista. Sen avulla huomataan kirjoitusvirheet suodatustunnisteissa.
export function jasennaResepti(id: string, teksti: string, sallitut: string[]): Resepti {
  const { fm, runko } = erotaFrontmatter(teksti)
  const osat = jaaOsiin(runko)
  const varoitukset: string[] = []

  const nimi = (fm['nimi'] ?? '').trim() || id
  if (!(fm['nimi'] ?? '').trim()) varoitukset.push('nimi puuttuu, käytetään tiedoston nimeä')

  const sisaltaaArvo = fm['sisältää'] ?? fm['sisaltaa']
  const sisaltaaPuuttuu = sisaltaaArvo === undefined || sisaltaaArvo.trim() === ''
  const sisaltaa = lueLista(sisaltaaArvo)
  if (sisaltaaPuuttuu) {
    varoitukset.push('sisältää-kenttä puuttuu, joten sopivuutta ei voi arvioida')
  }
  const tuntemattomat = sisaltaa.filter((t) => !sallitut.includes(t))
  if (tuntemattomat.length > 0) {
    varoitukset.push(
      `tuntemattomia tunnisteita: ${tuntemattomat.join(', ')} (korjaa kirjoitusasu tai lisää tunniste tiedostoon tags.ts)`,
    )
  }

  const aineet = lueAineet(osat.get('ainekset') ?? osat.get('aineet') ?? '')
  if (aineet.length === 0) varoitukset.push('ainekset puuttuvat')

  return {
    id,
    nimi,
    annokset: lueLuku(fm['annokset']),
    kestoMin: lueKesto(fm['kesto'] ?? fm['valmistusaika']),
    lahde: (fm['lähde'] ?? fm['lahde'] ?? '').trim(),
    avainsanat: lueLista(fm['avainsanat'] ?? fm['tunnisteet']),
    sisaltaa,
    sisaltaaPuuttuu,
    aineet,
    valmistus: osat.get('valmistus') ?? osat.get('ohje') ?? '',
    varoitukset,
  }
}

// Reseptistä markdown-tiedosto (lomakkeen vienti)
export function muotoileResepti(r: Resepti): string {
  const rivit: string[] = ['---', `nimi: ${r.nimi}`]
  if (r.annokset > 0) rivit.push(`annokset: ${r.annokset}`)
  if (r.kestoMin > 0) rivit.push(`kesto: ${r.kestoMin}`)
  // Jos tunnisteita ei ole valittu eikä ole erikseen vahvistettu, ettei niitä ole, kenttä jätetään pois
  if (!(r.sisaltaa.length === 0 && r.sisaltaaPuuttuu)) {
    rivit.push(`sisältää: [${r.sisaltaa.join(', ')}]`)
  }
  if (r.avainsanat.length > 0) rivit.push(`avainsanat: [${r.avainsanat.join(', ')}]`)
  if (r.lahde) rivit.push(`lähde: ${r.lahde}`)
  rivit.push('---', '', '## Ainekset', '')
  for (const a of r.aineet) rivit.push(`- ${aineRivi(a)}`)
  rivit.push('', '## Valmistus', '', r.valmistus.trim(), '')
  return rivit.join('\n')
}
