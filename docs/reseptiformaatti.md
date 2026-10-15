# Reseptitiedoston formaatti

Yksi resepti = yksi markdown-tiedosto kansiossa `reseptit/`. Tiedoston nimi on pienillä kirjaimilla ilman ääkkösiä, esim. `broileri-bataattipata.md`. Sovellus lukee tiedostot julkaisun yhteydessä, joten uusi resepti näkyy kaikille, kun tiedosto on lisätty ja `git push` tehty.

## Rakenne

```markdown
---
nimi: Broileri-bataattipata
annokset: 4
kesto: 45
sisältää: [liha, kana, maito, laktoosi, valkosipuli]
avainsanat: [broileri, pata, bataatti, arki]
lähde: https://yhteishyva.fi/reseptit/broileri-bataattipata/recipe-1179
---

## Ainekset

- 400 g bataatti
- 1 paprika
- 2 valkosipulin kynttä

## Valmistus

> 400 g bataattia
> 1 paprika

1. Kuori ja kuutioi bataatti.
2. Ruskista liha.

---

> 1 dl vettä

3. Lisää vesi ja anna hautua.
```

## Kentät

| Kenttä | Pakollinen | Kuvaus |
|---|---|---|
| `nimi` | kyllä | Reseptin nimi. Jos puuttuu, käytetään tiedoston nimeä. |
| `annokset` | suositus | Numero, esim. `4`. Teksti "4 annosta" luetaan myös. |
| `kesto` | suositus | Minuutit, esim. `45`. Myös "noin 45 min" ja "1 h 30 min" luetaan. |
| `sisältää` | **kyllä** | Suodatustunnisteet tiedostosta `src/tags.ts`: mitä reseptissä on. Sopivuus perheenjäsenille lasketaan näistä. Tyhjä lista `[]` tarkoittaa, ettei reseptissä ole mitään listan tunnisteista. Jos kenttä puuttuu, sovellus ei väitä reseptin sopivan kenellekään. |
| `avainsanat` | ei | Vapaita sanoja (broileri, pata, arki). Käytetään myöhemmin hakuun ja vaihtelun varmistamiseen. Vanha nimi `tunnisteet` luetaan myös. |
| `lähde` | ei | Linkki alkuperäiseen reseptiin. |

Listat kirjoitetaan pilkuilla erotettuna: `[a, b, c]`.

## Ainekset

Yksi aines per rivi, alussa `- `. Muoto on `määrä yksikkö aine`, esim. `0,5 dl maitoa` tai `1 paprika`. Määrän desimaalierottimena toimii pilkku, ja murtoluvut (`1/2`, `1 1/2`) luetaan. Kirjoita aineen nimi samalla tavalla kaikkialla (`valkosipulin kynttä`, ei välillä `valkosipulinkynttä`), jotta ostoslista osaa myöhemmin laskea määrät yhteen.

## Valmistus

- Askeleet numeroituina riveinä: `1.`, `2.`, `3.`
- Rivit, jotka alkavat merkillä `>`, ovat kyseisen vaiheen ainekset ("Tarvitset tässä vaiheessa").
- Rivi `---` erottaa vaiheet. Uusi `>`-lohko askelten jälkeen aloittaa uuden vaiheen myös ilman erotinta.

## Reseptin luominen verkkolähteestä Clauden avulla

Kunnes sovellus osaa tämän itse, voit pyytää Claudea (keskustelussa, jossa on verkkohaku):

> Tee tämän reseptin pohjalta reseptitiedosto formaatilla `docs/reseptiformaatti.md`: [linkki]. Kirjoita ohje omin sanoin, lisää lähde-kenttä, ja valitse `sisältää`-kenttään vain tunnisteet tästä listasta: maito, laktoosi, gluteeni, kananmuna, kala, äyriäiset, pähkinät, maapähkinä, soija, selleri, sinappi, seesami, sieni, sipuli, valkosipuli, tulinen, liha, kana, sianliha.

Tarkista tuloksesta ainekset ja `sisältää`-kenttä ennen tallennusta.
