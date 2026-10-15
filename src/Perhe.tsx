import { TAGIT } from './tags'
import type { Perheenjasen } from './types'

interface Props {
  jasenet: Perheenjasen[]
  onMuuta: (jasenet: Perheenjasen[]) => void
}

function vaihda(lista: string[], tunniste: string): string[] {
  return lista.includes(tunniste)
    ? lista.filter((t) => t !== tunniste)
    : [...lista, tunniste]
}

export function Perhe({ jasenet, onMuuta }: Props) {
  function paivita(id: string, muutos: Partial<Perheenjasen>) {
    onMuuta(jasenet.map((j) => (j.id === id ? { ...j, ...muutos } : j)))
  }

  // Tunniste voi olla vain toisessa listassa: "ei saa" tai "inhokki"
  function vaihdaEiSaa(j: Perheenjasen, t: string) {
    paivita(j.id, {
      eiSaa: vaihda(j.eiSaa, t),
      inhokit: j.inhokit.filter((x) => x !== t),
    })
  }

  function vaihdaInhokki(j: Perheenjasen, t: string) {
    paivita(j.id, {
      inhokit: vaihda(j.inhokit, t),
      eiSaa: j.eiSaa.filter((x) => x !== t),
    })
  }

  function lisaa() {
    const nimi = window.prompt('Perheenjäsenen nimi?')?.trim()
    if (!nimi) return
    onMuuta([
      ...jasenet,
      { id: crypto.randomUUID(), nimi, eiSaa: [], inhokit: [], lempiruoat: '' },
    ])
  }

  function poista(j: Perheenjasen) {
    if (window.confirm(`Poistetaanko ${j.nimi}?`)) {
      onMuuta(jasenet.filter((x) => x.id !== j.id))
    }
  }

  return (
    <section>
      <h2>Perhe</h2>
      {jasenet.map((j) => (
        <details key={j.id} className="kortti">
          <summary>
            <strong>{j.nimi}</strong>
            <span className="yhteenveto">
              {j.eiSaa.length > 0 && ` · Ei saa: ${j.eiSaa.join(', ')}`}
              {j.inhokit.length > 0 && ` · Inhokit: ${j.inhokit.join(', ')}`}
            </span>
          </summary>

          <label className="kentta">
            Nimi
            <input
              value={j.nimi}
              onChange={(e) => paivita(j.id, { nimi: e.target.value })}
            />
          </label>

          <h3>Ei saa syödä</h3>
          <div className="chipit">
            {TAGIT.map((t) => (
              <button
                key={t}
                type="button"
                className={'chip' + (j.eiSaa.includes(t) ? ' ei' : '')}
                aria-pressed={j.eiSaa.includes(t)}
                onClick={() => vaihdaEiSaa(j, t)}
              >
                {t}
              </button>
            ))}
          </div>

          <h3>Inhokit</h3>
          <div className="chipit">
            {TAGIT.map((t) => (
              <button
                key={t}
                type="button"
                className={'chip' + (j.inhokit.includes(t) ? ' inhokki' : '')}
                aria-pressed={j.inhokit.includes(t)}
                onClick={() => vaihdaInhokki(j, t)}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="kentta">
            Lempiruoat
            <textarea
              rows={3}
              value={j.lempiruoat}
              placeholder="esim. lasagne, kanakeitto, kalapuikot"
              onChange={(e) => paivita(j.id, { lempiruoat: e.target.value })}
            />
          </label>

          <button type="button" className="poista" onClick={() => poista(j)}>
            Poista {j.nimi}
          </button>
        </details>
      ))}

      <button type="button" className="lisaa" onClick={lisaa}>
        + Lisää perheenjäsen
      </button>
    </section>
  )
}