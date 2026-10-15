export interface Perheenjasen {
  id: string
  nimi: string
  eiSaa: string[] // kova sääntö: allergiat ja ruokavalio
  inhokit: string[] // pehmeä sääntö: varoitus, ei piilota
  lempiruoat: string // vapaa teksti
}

export interface Aine {
  nimi: string
  maara: number | null
  yksikko: string
}

export interface Resepti {
  id: string
  nimi: string
  annokset: number
  kestoMin: number
  aineet: Aine[]
  tunnisteet: string[] // mitä reseptissä on, ks. tags.ts
  ohje: string
  lahde: string
}