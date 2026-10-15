import type { Perheenjasen, Resepti } from './types'

export interface Osuma {
  nimi: string
  tunnisteet: string[]
}

export interface Sopivuus {
  eiSovi: Osuma[]
  inhokit: Osuma[]
}

export function arvioi(resepti: Resepti, jasenet: Perheenjasen[]): Sopivuus {
  const eiSovi: Osuma[] = []
  const inhokit: Osuma[] = []

  for (const j of jasenet) {
    const kielletyt = resepti.tunnisteet.filter((t) => j.eiSaa.includes(t))
    if (kielletyt.length > 0) eiSovi.push({ nimi: j.nimi, tunnisteet: kielletyt })

    const ei = resepti.tunnisteet.filter((t) => j.inhokit.includes(t))
    if (ei.length > 0) inhokit.push({ nimi: j.nimi, tunnisteet: ei })
  }

  return { eiSovi, inhokit }
}

export function kuvaa(osumat: Osuma[]): string {
  return osumat.map((o) => `${o.nimi} (${o.tunnisteet.join(', ')})`).join(', ')
}