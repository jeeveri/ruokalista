import { useEffect, useState } from 'react'
import { storage } from './storage'
import type { Perheenjasen } from './types'
import { Perhe } from './Perhe'
import './App.css'

const OLETUS: Perheenjasen[] = [
  { id: 'jesperi', nimi: 'Jesperi', eiSaa: [], inhokit: [], lempiruoat: '' },
  { id: 'terhi', nimi: 'Terhi', eiSaa: [], inhokit: [], lempiruoat: '' },
  { id: 'eemeli', nimi: 'Eemeli', eiSaa: [], inhokit: [], lempiruoat: '' },
]

type Nakyma = 'viikko' | 'perhe'

function App() {
  const [nakyma, setNakyma] = useState<Nakyma>('viikko')
  const [jasenet, setJasenet] = useState<Perheenjasen[]>(OLETUS)
  const [ladattu, setLadattu] = useState(false)

  useEffect(() => {
    storage.get<Perheenjasen[]>('perheenjasenet', OLETUS).then((j) => {
      setJasenet(j)
      setLadattu(true)
    })
  }, [])

  function muuta(uudet: Perheenjasen[]) {
    setJasenet(uudet)
    if (ladattu) storage.set('perheenjasenet', uudet)
  }

  return (
    <main className="sovellus">
      <h1>Ruokalista</h1>

      <nav className="valilehdet">
        <button
          type="button"
          className={nakyma === 'viikko' ? 'aktiivinen' : ''}
          onClick={() => setNakyma('viikko')}
        >
          Viikko
        </button>
        <button
          type="button"
          className={nakyma === 'perhe' ? 'aktiivinen' : ''}
          onClick={() => setNakyma('perhe')}
        >
          Perhe
        </button>
      </nav>

      {nakyma === 'viikko' && (
        <section>
          <h2>Viikon ruokalista</h2>
          <p className="pieni">
            Tulossa vaiheessa 4. Perheessä on {jasenet.length} jäsentä.
          </p>
        </section>
      )}

      {nakyma === 'perhe' && <Perhe jasenet={jasenet} onMuuta={muuta} />}
    </main>
  )
}

export default App