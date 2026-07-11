import { geefStempel, isOntgrendeld, ontgrendel } from '../state.js';

/**
 * Station 1 · De Oudheid — de letterschuif (contentplan §3).
 * Ontcijfer ἱστορία: per Griekse letter schuift de bezoeker naar de Latijnse
 * omzetting. De ἱ draagt een spiritus asper — dáár zit de H. Hint na 20 sec.
 */

const SCHUIVEN = [
  { grieks: 'ἱ', opties: ['I', 'HI', 'EI', 'J'], goed: 'HI' },
  { grieks: 'σ', opties: ['C', 'O', 'S', 'E'], goed: 'S' },
  { grieks: 'τ', opties: ['T', 'Y', 'F', 'P'], goed: 'T' },
  { grieks: 'ο', opties: ['Q', 'O', 'U', 'D'], goed: 'O' },
  { grieks: 'ρ', opties: ['P', 'B', 'R', 'F'], goed: 'R' },
  { grieks: 'ί', opties: ['I', 'L', 'J', 'Y'], goed: 'I' },
  { grieks: 'α', opties: ['A', 'D', 'O', 'E'], goed: 'A' },
];

const HINT =
  'Hint: het teken ῾ boven de eerste letter is een ademteken. De Grieken schreven de h niet — ze bliezen hem.';

const SUCCES =
  '<strong>ἱστορία</strong> — <em>historia</em>: onderzoek. Geschiedenis begint niet bij weten, maar bij vragen.';

const BIO = `
  <p class="eyebrow">Ontgrendeld · bio-fragment</p>
  <p>Buiten het lokaal: Rotterdammer, met gezin. Marathonloper — de enige plek
  waar ik langzamer denk dan ik loop. Lezer op het snijvlak van geschiedenis en
  wetenschap, van Herodotus tot Harari. De nieuwsgierigheid van het gymnasium is
  nooit overgegaan; ik heb er mijn beroep van gemaakt.</p>
`;

export function initOudheid() {
  const puzzel = document.querySelector('[data-puzzel-oudheid]');
  const schuivenWortel = document.querySelector('[data-oudheid-schuiven]');
  const unlockWortel = document.querySelector('[data-unlock-oudheid]');
  if (!puzzel || !schuivenWortel || !unlockWortel) return;

  if (isOntgrendeld('oudheid')) {
    toonOpgelost(schuivenWortel);
    toonBio(unlockWortel);
    return;
  }

  unlockWortel.innerHTML = `
    <p class="ontgrendeling__slot">
      <span aria-hidden="true">▢</span> vergrendeld — los de puzzel op voor het bio-fragment
    </p>
  `;

  schuivenWortel.innerHTML = `
    <p class="puzzel__woord" lang="grc" aria-label="Het Griekse woord: historia">ἱστορία</p>
    <div class="schuiven" role="group" aria-label="Letterschuif: zet elke Griekse letter om">
      ${SCHUIVEN.map(
        (s, i) => `
        <div class="schuif" data-schuif="${i}">
          <span class="schuif__grieks" aria-hidden="true">${s.grieks}</span>
          <button class="schuif__pijl" type="button" data-richting="-1"
                  aria-label="Vorige letter voor ${s.grieks}">▲</button>
          <output class="schuif__venster" aria-label="Omzetting van ${s.grieks}">${s.opties[0]}</output>
          <button class="schuif__pijl" type="button" data-richting="1"
                  aria-label="Volgende letter voor ${s.grieks}">▼</button>
        </div>
      `
      ).join('')}
    </div>
    <p class="puzzel__melding" data-melding aria-live="polite"></p>
    <button class="knop knop--rood" type="button" data-controleer>Ontcijfer</button>
  `;

  const posities = SCHUIVEN.map(() => 0);
  const melding = schuivenWortel.querySelector('[data-melding]');

  schuivenWortel.addEventListener('click', (e) => {
    const pijl = e.target.closest('.schuif__pijl');
    if (!pijl) return;
    const schuif = pijl.closest('[data-schuif]');
    const i = Number(schuif.dataset.schuif);
    const n = SCHUIVEN[i].opties.length;
    posities[i] = (posities[i] + Number(pijl.dataset.richting) + n) % n;
    schuif.querySelector('.schuif__venster').textContent =
      SCHUIVEN[i].opties[posities[i]];
    schuif.classList.remove('schuif--fout', 'schuif--goed');
  });

  /* hint na 20 seconden (§3) */
  const hintTimer = setTimeout(() => {
    if (!melding.textContent) melding.textContent = HINT;
  }, 20000);

  schuivenWortel
    .querySelector('[data-controleer]')
    .addEventListener('click', () => {
      let allesGoed = true;
      SCHUIVEN.forEach((s, i) => {
        const schuif = schuivenWortel.querySelector(`[data-schuif="${i}"]`);
        const goed = s.opties[posities[i]] === s.goed;
        schuif.classList.toggle('schuif--goed', goed);
        schuif.classList.toggle('schuif--fout', !goed);
        if (!goed) allesGoed = false;
      });

      if (!allesGoed) {
        melding.textContent =
          'Nog niet — de gouden letters staan goed, kijk nog eens naar de rode.';
        return;
      }

      clearTimeout(hintTimer);
      toonOpgelost(schuivenWortel);
      ontgrendel('oudheid');
      geefStempel('oudheid');
      toonBio(unlockWortel, true);
    });
}

function toonOpgelost(wortel) {
  wortel.innerHTML = `
    <p class="puzzel__succes">
      <span class="puzzel__antwoord" aria-hidden="true">H·I·S·T·O·R·I·A</span>
      ${SUCCES}
    </p>
    <p class="eyebrow">Stempel gezet ✓</p>
  `;
}

function toonBio(wortel, vers = false) {
  wortel.innerHTML = `<div class="dokument dokument--onthuld">${BIO}</div>`;
  if (vers) wortel.querySelector('.dokument').focus?.();
}
