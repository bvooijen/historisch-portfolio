# De Reis van de Historicus — Contentplan & Architectuur
**Portfolio-website Ben van Ooijen · benvanooijen.nl · v1.0 (juli 2026)**

Dit document is de volledige briefing voor de bouw in Claude Code. Het bevat concept, structuur, alle content per station, puzzelspecificaties, designrichting, assets-checklist en technische afspraken.

---

## 1. Doel & doelgroep

- **Primair doel:** sollicitatie-instrument. De site moet een sectievoorzitter of schoolleider in Rotterdam e.o. binnen twee minuten overtuigen dat Ben een eerstegraads docent is die zijn eigen curriculum bouwt, examenklassen draait en didactisch innoveert.
- **Toon:** professioneel maar speels; de vorm bewijst de boodschap (een docent die gamificatie predikt, laat het zien).
- **Buiten beeld:** Paideia (commerciële ambitie), het functiemixgeschil, alles over de huidige werkgever behalve feitelijke functieomschrijving.
- **Kernboodschap per bezoeker:** "Deze docent bouwt alles zelf, kent de bovenbouw, en werkt graag samen in een sectie." Het woord *samen* moet expliciet terugkomen (sollicitatiefeedback: te weinig nadruk op samenwerken).

## 2. Concept & flow

De bezoeker maakt een reis door zes "stations": historische tijdvakken die metaforisch Bens levensfasen dragen, chronologisch oplopend in zowel de geschiedenis als zijn biografie.

- **Landing:** EraGuessr-achtige opening. Eén historisch beeld vult het scherm met de vraag *"Waar in de tijd ben je?"* — één klik op de tijdlijn en de reis begint. Dit is het visitekaartje, geen drempel: fout raden bestaat niet, elke klik start de reis met een knipoog ("Bijna! Je bent in 1602 — het jaar dat de VOC werd opgericht. Reis mee.").
- **Navigatie:** horizontale tijdlijn, altijd zichtbaar. Vooruit en terug reizen kan altijd; puzzels zijn optioneel.
- **Ontgrendelen:** elk station heeft een mini-puzzel (30–60 sec). Oplossen ontgrendelt een verdieping (document, demo, bio-fragment). Voortgang in localStorage.
- **Reisdossier (signature-element):** een paspoort/dossier onderin beeld dat per station een "stempel" krijgt. Bij zes stempels: subtiele beloning (zie station 6).
- **ESSENTIEEL — de overslaan-route:** rechtsboven permanent: **"Sla de reis over →"** naar `/overzicht`: een klassieke één-pagina met foto, CV-samenvatting, projecten, visie en contact. Drukbezette lezers krijgen daar in 60 seconden alles. De reis is voor wie tijd en nieuwsgierigheid heeft.

## 3. De zes stations

> Copy hieronder is conceptversie — bij de bouw redactioneel aanscherpen, maar de feiten zijn definitief (bron: CV juli 2026).

### Station 1 · De Oudheid — *De Oorsprong* (1996–2002)
- **Tijdvak-sfeer:** Grieks, papyrus, het woord ἱστορία.
- **Feiten:** Gemeentelijk Gymnasium Hilversum, 1996–2002. Profiel natuur & techniek, extra vakken geschiedenis en Grieks.
- **Verhaal:** de klassieke vorming als startpunt. Waar de nieuwsgierigheid naar het verleden begon.
- **Puzzel:** ontcijfer ἱστορία met een letterschuif (Grieks → Latijns alfabet). Hint na 20 sec.
- **Ontgrendelt:** persoonlijk bio-fragment (Rotterdam, gezin, marathonloper, lezer op het snijvlak van geschiedenis en wetenschap — kort, menselijk, geen privédetails).

### Station 2 · De Tijd van Ontdekkers — *Amsterdam* (2003–2010)
- **Tijdvak-sfeer:** VOC, kaarten, de Nieuwe Wereld.
- **Feiten:** WO Bachelor geschiedenis, Universiteit van Amsterdam (2003–2010). Major American Studies, minor English Proficiency.
- **Verhaal:** de verkenning — een Nederlandse historicus die de Atlantische oceaan overstak, intellectueel dan. De basis voor latere TTO-inzetbaarheid (Engels vloeiend, vakinhoud in het Engels).
- **Puzzel:** EraGuessr-stijl: één afbeelding (publiek domein, bijv. kaart van Nieuw-Amsterdam), raad het jaartal op een slider. Marge ±25 jaar = goed.
- **Ontgrendelt:** kaartje "van Amsterdam naar Amerika": de rode draad American Studies door bachelor én master.

### Station 3 · De Tijd van Telegraaf en Telefoon — *Het Netwerk* (2010–2018)
- **Tijdvak-sfeer:** industriële communicatierevolutie — telegraaf, telefoonnetten, de wereld die verbonden raakt. Metafoor voor: communicatieprofessional in de telecomsector.
- **Feiten:** communicatieafdelingen van Ziggo en Tele2/T-Mobile, 2010–2018. Begin 2019 bewust de corporate loopbaan beëindigd om docent geschiedenis te worden.
- **Verhaal — dit is het scharnierpunt van de site:** negen jaar corporate communicatie is geen omweg maar een leerschool: helder schrijven, complexe boodschappen toegankelijk maken, werken in teams met deadlines en stakeholders. Precies de vaardigheden die een sectie binnenhaalt. De carrièreswitch framen als kracht: *"In 2019 koos ik. Niet weg van iets, maar naar iets toe."*
- **Puzzel:** morse-decodeeropdracht: één kort woord in morse (audio + visueel), decodeersleutel ernaast. Antwoord: KEUZE.
- **Ontgrendelt:** het switch-verhaal in 150 woorden — waarom onderwijs, waarom geschiedenis.

### Station 4 · De Tijd van Televisie en Computer — *De Master* (2019–2020)
- **Tijdvak-sfeer:** 1970, Washington, archieffootage-esthetiek.
- **Feiten:** WO Master geschiedenis (American Studies), UvA, 2019–2020. Thesis: *President Richard Nixon and the founding of the Environmental Protection Agency in 1970*. Parallel: educatieve module ICLON Leiden (2019, tweedegraads bevoegdheid, stage Wolfert Tweetalig/BOOR).
- **Verhaal:** wetenschappelijk niveau tonen met één concreet, verrassend onderwerp: de Republikein die het milieuagentschap oprichtte. Laat zien dat Ben denkt in paradoxen en bronnen — de kern van historisch redeneren.
- **Puzzel = mini-bronnenoefening (voorproefje op station 5):** één fragment uit Nixons Reorganization Plan No. 3 (1970) of zijn milieuboodschap aan het Congres (US government works: publiek domein). Eén vraag in BLAV-stijl: *"Wat zegt de afzender over de betrouwbaarheid van deze bron?"* — drie antwoordopties met uitleg per optie.
- **Ontgrendelt:** thesis-samenvatting (300 woorden) + de les die de thesis Ben leerde over verrassende causaliteit.

### Station 5 · De Eenentwintigste Eeuw — *De Revolutie in de Klas* (2019–heden) — **ZWAARTEPUNT**
- **Tijdvak-sfeer:** het heden; hier verandert de site van vertelling naar demonstratie.
- **Feiten (CV):** Eerstegraads docent geschiedenis, Portus Groene Hart, Barendrecht (aug 2019–heden). TTO-docent (m/h/v) inclusief examenklassen, mentor. Curriculum en toetsen bovenbouw vwo, internationale excursies klas 4, opzetten schaaktoernooi alle leerjaren. Eerstegraads bevoegdheid: WO Master ICLON, Universiteit Leiden (2023–2024, geschiedenis en staatsinrichting). Kort intermezzo Melanchthon Schiebroek (voorjaar 2020, onderbouw h/v/g). Methodes: Bricks History (TTO), Feniks, Forum.
- **Verhaal:** "Ik bouw mijn eigen lesmateriaal — van complete lessenseries tot toetsen, gameshows en digitale leeromgevingen." Concrete voorbeelden benoemen zonder methode-content te tonen: lessenserie Koude Oorlog (3 havo TTO), curriculum rond Harari's *Nexus* verweven met HC Duitsland (5/6 vwo), Domein D democratie & rechtsstaat (4 havo), HC-examentraining. Alles activerende didactiek, historische vaardigheden geïntegreerd.
- **Demo 1 (primair) — de bronnenoefening:** een volwaardige interactieve bronnenanalyse zoals leerlingen die krijgen: één publiek-domein-bron (bijv. propagandaposter Koude Oorlog uit US National Archives), vragen over motief, betrouwbaarheid, representativiteit, met feedback per antwoord. Dit ís het portfolio: de bezoeker ervaart Bens didactiek.
- **Demo 2 (secundair) — gameshow-fragment:** één ronde van een quizformat (3 vragen, timer, score) als smaakmaker van de gamification-aanpak. Compact houden; demo 1 is de ster.
- **Screenshots:** 2–3 stills van bestaande tools (dashboard, gameshow, Nexus-werkboek) in een browser-frame. **Checklist: geen leerlingnamen, geen methode-afbeeldingen, geen gelicenseerd beeld in de screenshot.**
- **Puzzel:** geen aparte puzzel — de demo's afronden geeft de stempel.
- **Ontgrendelt:** "Wat ik een sectie breng" — vijf punten, met *samenwerken* voorop: materiaal ontwikkelen ín samenspraak, voortbouwen op wat er ligt, delen wat werkt.

### Station 6 · De Toekomst — *Visie & Contact*
- **Verhaal (visie, ±200 woorden):** geschiedenis als denkvak: leerlingen leren met bronnen redeneren, oorzaak en gevolg wegen, standplaatsgebondenheid herkennen — vaardigheden voor burgers, niet alleen voor toetsen. Activerende didactiek en spelvormen zijn middel, geen doel. Curriculumontwerp als ambacht. En: onderwijs maak je samen — sectie, school, leerling.
- **Contact:** benvanooijen1984@gmail.com (mailto-knop), downloadbaar CV (PDF), woonplaats Rotterdam. Géén LinkedIn, géén telefoonnummer op de publieke site (spam), géén postadres.
- **Beloning zes stempels:** het reisdossier klapt open tot een "historisch certificaat van volharding" — printbaar, met knipoog. Laag houden in toon, hoog in afwerking.

## 4. Designrichting

**Vertrekpunt: Bens bestaande visuele taal** (geanalyseerd uit escape room-tool "De Breuk met Moskou" en PowerPoint HC Britse Rijk):
- Donkere, atmosferische basis (near-black / diep marineblauw `#242852` uit het pptx-thema)
- Typemachine-achtige labels met ruime letterspatiëring als "eyebrows" (KAMER 2 VAN 5-stijl)
- Goudgeel voor koppen, signaalrood voor puzzel-labels en actieknoppen
- Bronteksten in serif-cursief op documentkaarten met gekleurde accentrand
- Voortgangsindicator met stippen; dossier/archief-esthetiek is er al

**Design tokens (voorstel, in Claude Code verfijnen):**
- Kleur: inkt `#12141A` (basis), marineblauw `#242852` (vlakken), goud-oker `#E8B84B` (koppen/stempels), signaalrood `#B3261E` (interactie/CTA), perkament `#F2E9D8` (lichte modus /overzicht + documentkaarten), archiefblauw `#4A66AC` (citaten/links)
- Type: **Spectral** (verhaal- en bronteksten, italic voor citaten) · **Archivo** (UI, navigatie) · **Special Elite of Courier Prime** (typewriter-eyebrows en stempels — spaarzaam, alleen als label)
- **Let op:** /overzicht (de sollicitatiepagina) wordt de líchte variant — perkament/wit met inkt — zodat die pagina print- en scanvriendelijk is. De reis is donker en atmosferisch, het overzicht zakelijk licht. Zelfde tokens, omgekeerde toepassing.

**Era-authentiek beeld per station** (allemaal publiek domein, uniform behandeld met een duotone/inkt-overlay zodat zes eeuwen beeldmateriaal één geheel vormen):
1. **Oudheid:** Grieks roodfigurig aardewerk of papyrusfragment — Rijksstudio, Met Museum Open Access (CC0), Wikimedia PD
2. **Ontdekkers:** Castello Plan van Nieuw-Amsterdam (1660, PD) of VOC-kaart — Rijksstudio / New York Public Library Digital Collections
3. **Telegraaf en Telefoon:** telegraafkantoor of telefonistencentrale ±1900 — Library of Congress (PD)
4. **1970:** Nixon-materiaal uit het Documerica-fotoproject — nota bene een fotoarchief van de EPA zélf (US National Archives, US gov = PD). Thematisch perfect bij de thesis.
5. **Heden:** eigen screenshots in een browser-frame (escape room-screenshot is al bruikbaar als voorbeeld van de huisstijl)
6. **Toekomst:** historische sterrenkaart (bijv. Cellarius, Harmonia Macrocosmica, PD via Rijksstudio) — verleden en toekomst in één beeld

- **Signature:** het reisdossier (zie §2). Alle overige animatie terughoudend: scroll-reveal per station, verder rust. `prefers-reduced-motion` respecteren.
- Bij elk beeld bronvermelding in het colofon — goede gewoonte én vakinhoudelijk visitekaartje.
- **Profielfoto:** aangeleverde foto is 200×200 px — te klein voor hero-gebruik. Opties: (a) alleen klein gebruiken (avatar in header en op /overzicht, max ~120 px weergave), (b) betere scan/origineel van de CV-foto aanleveren, (c) nieuwe foto tegen rustige achtergrond. Voor v1: optie a, upgraden zodra beter bestand beschikbaar is.

## 5. Technische afspraken

- **Stack:** Vite + vanilla JS (geen framework), één CSS-bestand met design tokens (custom properties), content in één `content.js`/JSON zodat teksten los van markup te redigeren zijn.
- **Structuur:**
  - `/` — landing (EraGuessr-opening) + de zes stations als secties of routes
  - `/overzicht` — de klassieke sollicitatiepagina (statisch, snel, printbaar)
  - `/colofon` — beeldverantwoording + techniek
- **State:** localStorage: `reis.stempels` (array), `reis.unlocks` (object). Geen backend, geen cookies, geen analytics in v1 (privacyvriendelijk is hier ook een statement).
- **Hosting:** GitHub Pages, repo onder `bvooijen`. Custom domain benvanooijen.nl via TransIP: A-records naar GitHub Pages-IP's + CNAME `www`, HTTPS afdwingen in Pages-instellingen.
- **Kwaliteitsvloer:** responsive tot 360 px, toetsenbordnavigatie door de tijdlijn, zichtbare focus, alt-teksten op alle historische beelden (vakdocent-waardig: beschrijvend én dateerbaar), Lighthouse ≥ 95.
- **SEO minimaal:** title/description per route, OG-tags met profielfoto klein, sitemap. Doel: vindbaar op "Ben van Ooijen geschiedenis docent".

## 6. Assets-checklist (aan te leveren door Ben)

| # | Asset | Status |
|---|-------|--------|
| 1 | CV als nette PDF voor download | Ben werkt zelf de correcties bij ("Vitae"), daarna in repo als `/assets/cv-ben-van-ooijen.pdf` |
| 2 | Profielfoto hoge resolutie | Ben regelt scherpere foto; tot die tijd 200 px-versie alleen als kleine avatar |
| 3 | Screenshots eigen tools | escape room-screenshot aanwezig; nog 1–2 andere (dashboard/gameshow) welkom. Checklist per screenshot: geen leerlingnamen, geen methodebeeld |
| 4 | Domein benvanooijen.nl | ✔ geclaimd bij TransIP |
| 5 | PowerPoint HC Britse Rijk (stijlreferentie) | aanwezig — alleen als referentie, niet publiceren (bevat mogelijk gelicenseerd beeld) |
| 6 | Akkoord op alle conceptteksten (m.n. switch-verhaal station 3) | volgt bij bouw |

**Belangrijk bij de overdracht naar Claude Code:** dit markdown-bestand vervoert geen afbeeldingen. Zet de bestanden zelf in de repo onder `/assets/` (foto, CV-PDF, screenshots) voordat je de startprompt geeft.

## 7. Startprompt voor Claude Code

> Bouw een statische portfolio-site volgens `reis-van-de-historicus-contentplan.md` (in deze repo). Stack: Vite + vanilla JS, geen framework. Volg het plan exact: zes stations, landing met jaartal-raadspel, /overzicht als klassieke lichte pagina, reisdossier met stempels in localStorage, design tokens uit §4 (donkere reis, licht overzicht, Spectral/Archivo/typewriter-labels). Download de publiek-domein-beelden uit §4 zelf (Rijksstudio, LOC, US National Archives, Met Open Access), optimaliseer ze (WebP, max 1600 px) en pas de duotone-behandeling toe; noteer elke bron in /colofon. Eigen assets staan in `/assets/`. Werk station voor station en laat na elk station een preview zien voordat je doorgaat. Begin met de projectstructuur, tokens en de landing.

---
*Opgesteld met Claude · alle biografische feiten geverifieerd tegen CV Ben van Ooijen (juli 2026).*
