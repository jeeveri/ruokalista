import { useState } from 'react'
import { TAGIT } from './tags'
import { arvioi, kuvaa } from './sopivuus'
import { aineRivi, jasennaVaiheet, muotoileResepti } from './reseptiTiedosto'
import type { Aine, Perheenjasen, Resepti } from './types'

interface Props {
  reseptit: Resepti[]
  jasenet: Perheenjasen[]
}

function tyhjaResepti(): Resepti {
  return {
    id: '',
    nimi: '',
    annokset: 4,
    kestoMin: 30,
    lahde: '',
    avainsanat: [],
    sisaltaa: [],
    sisaltaaPuuttuu: true,
    aineet: [{ nimi: '', maara: null, yksikko: '' }],
    valmistus: '',
    varoitukset: [],
  }
}

function tiedostonNimi(r: Resepti): string {
  if (r.id) return `${r.id}.md`
  const slug = r.nimi
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'resepti'}.md`
}

function lataaTiedosto(nimi: string, sisalto: string) {
  const blob = new Blob([sisalto], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nimi
  a.click()
  URL.revokeObjectURL(url)
}

export function Reseptit({ reseptit, jasenet }: Props) {
  const [muokattava, setMuokattava] = useState<Resepti | null>(null)

  if (muokattava) {
    return <ReseptiLomake alku={muokattava} onSulje={() => setMuokattava(null)} />
  }

  return (
    <section>
      <h2>Reseptit</h2>
      {reseptit.length === 0 && (
        <p className="pieni">
          Ei vielä reseptejä. Lisää markdown-tiedostoja repon kansioon reseptit/ tai tee resepti
          lomakkeella.
        </p>
      )}

      {reseptit.map((r) => {
        const s = arvioi(r, jasenet)
        return (
          <details key={r.id} className="kortti">
            <summary>
              <strong>{r.nimi}</strong>
              {r.kestoMin > 0 && <span className="yhteenveto"> · {r.kestoMin} min</span>}
              <div>
                {r.sisaltaaPuuttuu ? (
                  <span className="merkki neutraali">Sopivuutta ei voi arvioida</span>
                ) : (
                  <>
                    {s.eiSovi.length > 0 && (
                      <span className="merkki vaara">Ei sovi: {kuvaa(s.eiSovi)}</span>
                    )}{' '}
                    {s.inhokit.length > 0 && (
                      <span className="merkki varoitus">Inhokki: {kuvaa(s.inhokit)}</span>
                    )}
                    {s.eiSovi.length === 0 && s.inhokit.length === 0 && (
                      <span className="merkki ok">Sopii kaikille</span>
                    )}
                  </>
                )}{' '}
                {r.varoitukset.length > 0 && (
                  <span className="merkki varoitus">Huomautuksia tiedostossa</span>
                )}
              </div>
            </summary>

            <p className="pieni">
              {r.annokset > 0 && `${r.annokset} annosta`}
              {r.sisaltaa.length > 0 && ` · Sisältää: ${r.sisaltaa.join(', ')}`}
            </p>
            {r.avainsanat.length > 0 && (
              <p className="pieni">Avainsanat: {r.avainsanat.join(', ')}</p>
            )}

            {r.varoitukset.length > 0 && (
              <div className="huomio">
                <strong>Tiedostossa {r.id}.md on huomautettavaa:</strong>
                <ul>
                  {r.varoitukset.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            <h3>Ainekset</h3>
            <ul>
              {r.aineet.map((a, i) => (
                <li key={i}>{aineRivi(a)}</li>
              ))}
            </ul>

            {r.valmistus && (
              <>
                <h3>Valmistus</h3>
                {jasennaVaiheet(r.valmistus).map((v, i) => (
                  <div key={i} className="vaihe">
                    {v.aineet.length > 0 && (
                      <ul className="tarvitset">
                        {v.aineet.map((a, j) => (
                          <li key={j}>{a}</li>
                        ))}
                      </ul>
                    )}
                    <ol>
                      {v.askeleet.map((s2, j) => (
                        <li key={j} value={s2.numero ?? undefined}>
                          {s2.teksti}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
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
              Muokkaa lomakkeella
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
  onSulje: () => void
}

function ReseptiLomake({ alku, onSulje }: LomakeProps) {
  const [r, setR] = useState<Resepti>(alku)
  const [avainsanat, setAvainsanat] = useState(alku.avainsanat.join(', '))
  const [eiMitaan, setEiMitaan] = useState(!alku.sisaltaaPuuttuu && alku.sisaltaa.length === 0)
  const [kopioitu, setKopioitu] = useState(false)

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
      sisaltaa: r.sisaltaa.includes(t) ? r.sisaltaa.filter((x) => x !== t) : [...r.sisaltaa, t],
    })
  }

  // Tiedostoon menevä versio: siivotaan tyhjät rivit ja päätellään sisältää-kentän tila
  const luonnos: Resepti = {
    ...r,
    nimi: r.nimi.trim(),
    avainsanat: avainsanat
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    aineet: r.aineet.filter((a) => a.nimi.trim() !== ''),
    sisaltaaPuuttuu: r.sisaltaa.length === 0 && !eiMitaan,
  }
  const teksti = muotoileResepti(luonnos)
  const tiedosto = tiedostonNimi(luonnos)
  const voiVieda = luonnos.nimi !== ''

  async function kopioi() {
    try {
      await navigator.clipboard.writeText(teksti)
      setKopioitu(true)
      setTimeout(() => setKopioitu(false), 2000)
    } catch {
      window.alert('Kopiointi ei onnistunut. Valitse teksti esikatselusta ja kopioi käsin.')
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h2>{alku.nimi ? 'Muokkaa reseptiä' : 'Uusi resepti'}</h2>

      <label className="kentta">
        Nimi
        <input value={r.nimi} onChange={(e) => setR({ ...r, nimi: e.target.value })} />
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

      <h3>Ainekset</h3>
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
            className={'chip' + (r.sisaltaa.includes(t) ? ' on' : '')}
            aria-pressed={r.sisaltaa.includes(t)}
            onClick={() => vaihdaTunniste(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {r.sisaltaa.length === 0 && (
        <label className="vihje valinta">
          <input
            type="checkbox"
            checked={eiMitaan}
            onChange={(e) => setEiMitaan(e.target.checked)}
          />{' '}
          Reseptissä ei ole mitään listan tunnisteista
        </label>
      )}

      <label className="kentta">
        Avainsanat (pilkulla erotettuna)
        <input
          value={avainsanat}
          placeholder="broileri, pata, arki"
          onChange={(e) => setAvainsanat(e.target.value)}
        />
      </label>

      <label className="kentta">
        Valmistus
        <textarea
          rows={12}
          value={r.valmistus}
          placeholder={'> 400 g bataattia\n> 1 paprika\n\n1. Kuori ja kuutioi bataatti.\n2. Ruskista liha.\n\n---\n\n> 1 dl vettä\n\n3. Lisää vesi.'}
          onChange={(e) => setR({ ...r, valmistus: e.target.value })}
        />
      </label>
      <p className="vihje">
        Kirjoita askeleet numeroituina riveinä (1. 2. 3.). Rivit, jotka alkavat merkillä &gt;,
        näytetään kyseisen vaiheen aineslistana. Rivi --- erottaa vaiheet.
      </p>

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
        <button
          type="button"
          className="ensisijainen"
          disabled={!voiVieda}
          onClick={() => lataaTiedosto(tiedosto, teksti)}
        >
          Lataa {tiedosto}
        </button>
        <button type="button" className="toissijainen" disabled={!voiVieda} onClick={kopioi}>
          {kopioitu ? 'Kopioitu!' : 'Kopioi teksti'}
        </button>
        <button type="button" className="toissijainen" onClick={onSulje}>
          Sulje
        </button>
      </div>
      <p className="vihje">
        Sovellus ei voi itse kirjoittaa tiedostoja repoon. Tallenna ladattu tiedosto repon kansioon
        reseptit/ ja tee git push, niin resepti tulee kaikille.
      </p>

      <h3>Esikatselu</h3>
      <pre className="esikatselu">{teksti}</pre>
    </form>
  )
}
