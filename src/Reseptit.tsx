import { useState } from 'react'
import { TAGIT } from './tags'
import { arvioi, kuvaa } from './sopivuus'
import type { Aine, Perheenjasen, Resepti } from './types'

interface Props {
  reseptit: Resepti[]
  jasenet: Perheenjasen[]
  onMuuta: (reseptit: Resepti[]) => void
}

function tyhjaResepti(): Resepti {
  return {
    id: crypto.randomUUID(),
    nimi: '',
    annokset: 4,
    kestoMin: 30,
    aineet: [{ nimi: '', maara: null, yksikko: '' }],
    tunnisteet: [],
    ohje: '',
    lahde: '',
  }
}

function aineRivi(a: Aine): string {
  return [a.maara ?? '', a.yksikko, a.nimi].join(' ').replace(/\s+/g, ' ').trim()
}

export function Reseptit({ reseptit, jasenet, onMuuta }: Props) {
  const [muokattava, setMuokattava] = useState<Resepti | null>(null)

  function tallenna(r: Resepti) {
    const siivottu: Resepti = {
      ...r,
      nimi: r.nimi.trim(),
      aineet: r.aineet.filter((a) => a.nimi.trim() !== ''),
    }
    const olemassa = reseptit.some((x) => x.id === siivottu.id)
    onMuuta(
      olemassa
        ? reseptit.map((x) => (x.id === siivottu.id ? siivottu : x))
        : [...reseptit, siivottu],
    )
    setMuokattava(null)
  }

  function poista(r: Resepti) {
    if (window.confirm(`Poistetaanko resepti "${r.nimi}"?`)) {
      onMuuta(reseptit.filter((x) => x.id !== r.id))
    }
  }

  if (muokattava) {
    return (
      <ReseptiLomake
        alku={muokattava}
        onTallenna={tallenna}
        onPeruuta={() => setMuokattava(null)}
      />
    )
  }

  return (
    <section>
      <h2>Reseptit</h2>
      {reseptit.length === 0 && (
        <p className="pieni">Ei vielä reseptejä. Lisää ensimmäinen alta.</p>
      )}

      {reseptit.map((r) => {
        const s = arvioi(r, jasenet)
        return (
          <details key={r.id} className="kortti">
            <summary>
              <strong>{r.nimi}</strong>
              <span className="yhteenveto"> · {r.kestoMin} min</span>
              <div>
                {s.eiSovi.length > 0 && (
                  <span className="merkki vaara">Ei sovi: {kuvaa(s.eiSovi)}</span>
                )}{' '}
                {s.inhokit.length > 0 && (
                  <span className="merkki varoitus">Inhokki: {kuvaa(s.inhokit)}</span>
                )}
                {s.eiSovi.length === 0 && s.inhokit.length === 0 && (
                  <span className="merkki ok">Sopii kaikille</span>
                )}
              </div>
            </summary>

            <p className="pieni">
              {r.annokset} annosta
              {r.tunnisteet.length > 0 && ` · Sisältää: ${r.tunnisteet.join(', ')}`}
            </p>

            <h3>Aineet</h3>
            <ul>
              {r.aineet.map((a, i) => (
                <li key={i}>{aineRivi(a)}</li>
              ))}
            </ul>

            {r.ohje && (
              <>
                <h3>Ohje</h3>
                <p className="ohje">{r.ohje}</p>
              </>
            )}

            {r.lahde && (
              <p className="pieni">
                Lähde:{' '}
                <a href={r.lahde} target="_blank" rel="noreferrer">
                  {r.lahde}
                </a>
              </p>
            )}

            <button type="button" className="toissijainen" onClick={() => setMuokattava(r)}>
              Muokkaa
            </button>{' '}
            <button type="button" className="poista" onClick={() => poista(r)}>
              Poista
            </button>
          </details>
        )
      })}

      <button type="button" className="lisaa" onClick={() => setMuokattava(tyhjaResepti())}>
        + Uusi resepti
      </button>
    </section>
  )
}

interface LomakeProps {
  alku: Resepti
  onTallenna: (r: Resepti) => void
  onPeruuta: () => void
}

function ReseptiLomake({ alku, onTallenna, onPeruuta }: LomakeProps) {
  const [r, setR] = useState<Resepti>(alku)

  function paivitaAine(i: number, muutos: Partial<Aine>) {
    setR({ ...r, aineet: r.aineet.map((a, j) => (j === i ? { ...a, ...muutos } : a)) })
  }
  function poistaAine(i: number) {
    setR({ ...r, aineet: r.aineet.filter((_, j) => j !== i) })
  }
  function lisaaAine() {
    setR({ ...r, aineet: [...r.aineet, { nimi: '', maara: null, yksikko: '' }] })
  }
  function vaihdaTunniste(t: string) {
    setR({
      ...r,
      tunnisteet: r.tunnisteet.includes(t)
        ? r.tunnisteet.filter((x) => x !== t)
        : [...r.tunnisteet, t],
    })
  }

  const voiTallentaa = r.nimi.trim() !== ''

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (voiTallentaa) onTallenna(r)
      }}
    >
      <h2>{alku.nimi ? 'Muokkaa reseptiä' : 'Uusi resepti'}</h2>

      <label className="kentta">
        Nimi
        <input value={r.nimi} onChange={(e) => setR({ ...r, nimi: e.target.value })} required />
      </label>

      <div className="kaksi">
        <label className="kentta">
          Annokset
          <input
            type="number"
            min={1}
            value={r.annokset}
            onChange={(e) => setR({ ...r, annokset: Number(e.target.value) })}
          />
        </label>
        <label className="kentta">
          Kesto (min)
          <input
            type="number"
            min={1}
            value={r.kestoMin}
            onChange={(e) => setR({ ...r, kestoMin: Number(e.target.value) })}
          />
        </label>
      </div>

      <h3>Aineet</h3>
      {r.aineet.map((a, i) => (
        <div key={i} className="ainerivi">
          <input
            type="number"
            step="any"
            min={0}
            placeholder="Määrä"
            value={a.maara ?? ''}
            onChange={(e) =>
              paivitaAine(i, { maara: e.target.value === '' ? null : Number(e.target.value) })
            }
          />
          <input
            placeholder="Yksikkö"
            value={a.yksikko}
            onChange={(e) => paivitaAine(i, { yksikko: e.target.value })}
          />
          <input
            placeholder="Aine"
            value={a.nimi}
            onChange={(e) => paivitaAine(i, { nimi: e.target.value })}
          />
          <button type="button" aria-label="Poista rivi" onClick={() => poistaAine(i)}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="toissijainen" onClick={lisaaAine}>
        + Lisää aine
      </button>

      <h3>Mitä reseptissä on?</h3>
      <div className="chipit">
        {TAGIT.map((t) => (
          <button
            key={t}
            type="button"
            className={'chip' + (r.tunnisteet.includes(t) ? ' on' : '')}
            aria-pressed={r.tunnisteet.includes(t)}
            onClick={() => vaihdaTunniste(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="kentta">
        Ohje
        <textarea rows={6} value={r.ohje} onChange={(e) => setR({ ...r, ohje: e.target.value })} />
      </label>

      <label className="kentta">
        Lähde (linkki, valinnainen)
        <input
          type="url"
          value={r.lahde}
          placeholder="https://"
          onChange={(e) => setR({ ...r, lahde: e.target.value })}
        />
      </label>

      <div className="toiminnot">
        <button type="submit" className="ensisijainen" disabled={!voiTallentaa}>
          Tallenna
        </button>
        <button type="button" className="toissijainen" onClick={onPeruuta}>
          Peruuta
        </button>
      </div>
    </form>
  )
}