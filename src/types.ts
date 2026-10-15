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

export interface Askel {
  numero: number | null
  teksti: string
}

// Yksi valmistuksen vaihe: sen aineslista ja askeleet
export interface Vaihe {
  aineet: string[]
  askeleet: Askel[]
}

export interface Resepti {
  id: string // tiedoston nimi ilman .md-päätettä
  nimi: string
  annokset: number
  kestoMin: number
  lahde: string
  avainsanat: string[] // vapaat avainsanat (broileri, pata, arki)
  sisaltaa: string[] // suodatustunnisteet tags.ts-listasta: mitä reseptissä on
  sisaltaaPuuttuu: boolean // true, jos tiedostosta puuttuu sisältää-kenttä
  aineet: Aine[]
  valmistus: string // valmistus-osion raaka markdown
  varoitukset: string[] // tiedoston tarkistuksessa löytyneet huomautukset
}
