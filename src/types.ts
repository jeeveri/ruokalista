export interface Perheenjasen {
  id: string
  nimi: string
  eiSaa: string[] // kova sääntö: allergiat ja ruokavalio
  inhokit: string[] // pehmeä sääntö: varoitus, ei piilota
  lempiruoat: string // vapaa teksti
}