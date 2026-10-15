import { useEffect, useState } from 'react'
import { storage } from './storage'
import './App.css'

function App() {
  const [kaynnit, setKaynnit] = useState(0)

  useEffect(() => {
    storage.get<number>('kaynnit', 0).then((n) => {
      const uusi = n + 1
      setKaynnit(uusi)
      storage.set('kaynnit', uusi)
    })
  }, [])

  return (
    <main className="sovellus">
      <h1>Ruokalista</h1>
      <p>Mitä tänään syötäisiin?</p>
      <p className="pieni">Sovellus on avattu tällä laitteella {kaynnit} kertaa.</p>
    </main>
  )
}

export default App