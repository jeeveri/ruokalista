import { useState } from 'react'
import type { Perheenjasen, Resepti } from './types'
import { useTallennettu } from './useTallennettu'
import { Perhe } from './Perhe'
import { Reseptit } from './Reseptit'
import './App.css'

const OLETUS_JASENET: Perheenjasen[] = [
  { id: 'jesperi', nimi: 'Jesperi', eiSaa: [], inhokit: [], lempiruoat: '' },
  { id: 'terhi', nimi: 'Terhi', eiSaa: [], inhokit: [], lempiruoat: '' },
  { id: 'eemeli', nimi: 'Eemeli', eiSaa: [], inhokit: [], lempiruoat: '' },
]

type Nakyma = 'viikko' | 'reseptit' | 'perhe'

const VALILEHDET: { id: Nakyma; nimi: string }[] = [
  { id: 'viikko', nimi: 'Viikko' },
  { id: 'reseptit', nimi: 'Reseptit' },
  { id: 'perhe', nimi: 'Perhe' },
]

function App() {
  const [nakyma, setNakyma] = useState<Nakyma>('viikko')
  const [jasenet, setJasenet] = useTallennettu<Perheenjasen[]>('perheenjasenet', OLETUS_JASENET)
  const [reseptit, setReseptit] = useTallennettu<Resepti[]>('reseptit', [])

  return (
    <main className="sovellus">
      <h1>Ruokalista</h1>

      <nav className="valilehdet">
        {VALILEHDET.map((v) => (
          <button
            key={v.id}
            type="button"
            className={nakyma === v.id ? 'aktiivinen' : ''}
            onClick={() => setNakyma(v.id)}
          >
            {v.nimi}
          </button>
        ))}
      </nav>

      {nakyma === 'viikko' && (
        <section>
          <h2>Viikon ruokalista</h2>
          <p className="pieni">
            Tulossa vaiheessa 4. Reseptejä on {reseptit.length} ja perheessä {jasenet.length}{' '}
            jäsentä.
          </p>
        </section>
      )}

      {nakyma === 'reseptit' && (
        <Reseptit reseptit={reseptit} jasenet={jasenet} onMuuta={setReseptit} />
      )}

      {nakyma === 'perhe' && <Perhe jasenet={jasenet} onMuuta={setJasenet} />}
    </main>
  )
}

export default App