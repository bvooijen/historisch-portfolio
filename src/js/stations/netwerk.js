import { geefStempel, isOntgrendeld, ontgrendel } from '../state.js';

/**
 * Station 3 · Telegraaf en Telefoon — de morse-decodeeropdracht (§3).
 * Eén kort woord in morse (audio + visueel), decodeersleutel ernaast.
 * Antwoord: KEUZE — het scharnierpunt van de site.
 */

const ANTWOORD = 'KEUZE';

const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

const SUCCES = `
  <span class="puzzel__antwoord" aria-hidden="true">— · —&ensp;·&ensp;· · —&ensp;— — · ·&ensp;·</span>
  <strong>KEUZE.</strong> Dat was het bericht van begin 2019 — en het hele punt:
  niet weg van iets, maar naar iets toe.
`;

const SWITCH_VERHAAL = `
  <p class="eyebrow">Ontgrendeld · Het switch-verhaal</p>
  <p>In 2019 koos ik. Niet weg van iets, maar naar iets toe. Negen jaar schreef
  ik voor Ziggo en Tele2/T-Mobile: persberichten, woordvoeringslijnen, interne
  verhalen bij grote veranderingen. Ik leerde wat een deadline met een tekst
  doet, hoe je een ingewikkelde boodschap terugbrengt tot de kern, en hoe je
  met juristen, techneuten en bestuurders samen één verhaal maakt.</p>
  <p>Maar de verhalen die ik het liefst vertelde, waren de oude. Op verjaardagen
  legde ik vaker de Koude Oorlog uit dan een tariefwijziging. Toen ik doorkreeg
  dat uitleggen mijn vak was — alleen nog niet mijn baan — was de conclusie
  onontkoombaar. Begin 2019 zei ik de corporate wereld gedag; een half jaar
  later stond ik voor de klas. Geschiedenis, omdat daar verhalen en denken
  samenkomen. Onderwijs, omdat helder uitleggen daar elke dag publiek krijgt.
  Ik heb me geen dag vergist.</p>
`;

/* morse-timing in milliseconden */
const EENHEID = 90;

export function initNetwerk() {
  const interactie = document.querySelector('[data-netwerk-interactie]');
  const unlockWortel = document.querySelector('[data-unlock-netwerk]');
  if (!interactie || !unlockWortel) return;

  if (isOntgrendeld('netwerk')) {
    toonOpgelost(interactie);
    toonSwitchVerhaal(unlockWortel);
    return;
  }

  unlockWortel.innerHTML = `
    <p class="ontgrendeling__slot">
      <span aria-hidden="true">▢</span> vergrendeld — decodeer het bericht voor het switch-verhaal
    </p>
  `;

  const morseWoord = ANTWOORD.split('')
    .map((letter) => MORSE[letter])
    .join(' / ');

  interactie.innerHTML = `
    <div class="morse">
      <div class="morse__bericht">
        <p class="morse__tekens" aria-label="Het morsebericht, vijf letters">${ANTWOORD.split('')
          .map(
            (letter) =>
              `<span class="morse__letter" data-morse-letter>${MORSE[letter]
                .replaceAll('.', '·')
                .replaceAll('-', '—')}</span>`
          )
          .join('')}</p>
        <button class="knop knop--omtrek" type="button" data-morse-afspelen>
          ▶ Speel het bericht af
        </button>
      </div>
      <details class="morse__sleutel">
        <summary>Decodeersleutel</summary>
        <dl class="morse__alfabet">
          ${Object.entries(MORSE)
            .map(
              ([letter, code]) =>
                `<div><dt>${letter}</dt><dd>${code
                  .replaceAll('.', '·')
                  .replaceAll('-', '—')}</dd></div>`
            )
            .join('')}
        </dl>
      </details>
    </div>
    <form class="morse__antwoord" data-morse-form>
      <label class="visueel-verborgen" for="morse-invoer">Jouw decodering, vijf letters</label>
      <input class="morse__invoer" id="morse-invoer" type="text" maxlength="8"
             autocomplete="off" autocapitalize="characters" spellcheck="false"
             placeholder="_ _ _ _ _" />
      <button class="knop knop--rood" type="submit">Decodeer</button>
    </form>
    <p class="puzzel__melding" data-morse-melding aria-live="polite"></p>
  `;

  /* audio: korte sinuspiepjes via Web Audio — pas ná een klik (geen autoplay) */
  let audioContext = null;
  let bezig = false;
  const afspeelKnop = interactie.querySelector('[data-morse-afspelen]');
  const letters = interactie.querySelectorAll('[data-morse-letter]');

  afspeelKnop.addEventListener('click', async () => {
    if (bezig) return;
    bezig = true;
    afspeelKnop.disabled = true;
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    let t = audioContext.currentTime + 0.15;
    ANTWOORD.split('').forEach((letter, i) => {
      const start = t;
      for (const teken of MORSE[letter]) {
        const duur = (teken === '.' ? 1 : 3) * (EENHEID / 1000);
        const osc = audioContext.createOscillator();
        const dempen = audioContext.createGain();
        osc.frequency.value = 600;
        osc.connect(dempen).connect(audioContext.destination);
        dempen.gain.setValueAtTime(0.0001, t);
        dempen.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
        dempen.gain.setValueAtTime(0.3, t + duur - 0.012);
        dempen.gain.exponentialRampToValueAtTime(0.0001, t + duur);
        osc.start(t);
        osc.stop(t + duur);
        t += duur + EENHEID / 1000; /* pauze binnen de letter */
      }
      t += (2 * EENHEID) / 1000; /* extra pauze tussen letters */
      /* visueel meelichten per letter */
      const wacht = (start - audioContext.currentTime) * 1000;
      const lengte = (t - start) * 1000;
      setTimeout(() => letters[i]?.classList.add('morse__letter--klinkt'), wacht);
      setTimeout(() => letters[i]?.classList.remove('morse__letter--klinkt'), wacht + lengte);
    });

    const totaal = (t - audioContext.currentTime) * 1000;
    setTimeout(() => {
      bezig = false;
      afspeelKnop.disabled = false;
    }, totaal + 100);
  });

  const form = interactie.querySelector('[data-morse-form]');
  const invoer = interactie.querySelector('#morse-invoer');
  const melding = interactie.querySelector('[data-morse-melding]');
  let pogingen = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const gok = invoer.value.trim().toUpperCase();
    if (gok === ANTWOORD) {
      toonOpgelost(interactie);
      ontgrendel('netwerk');
      geefStempel('netwerk');
      toonSwitchVerhaal(unlockWortel, true);
      return;
    }
    pogingen += 1;
    const goedeLetters = gok
      .split('')
      .filter((letter, i) => letter === ANTWOORD[i]).length;
    melding.textContent =
      pogingen < 3
        ? goedeLetters > 0
          ? `Bijna: ${goedeLetters} van de 5 letters staan al goed. Luister nog eens.`
          : 'Dat is het niet — tel de tekens per letter en gebruik de sleutel.'
        : 'Tip: het woord is Nederlands, vijf letters, en het is precies wat ik begin 2019 deed.';
  });
}

function toonOpgelost(wortel) {
  wortel.innerHTML = `
    <p class="puzzel__succes">${SUCCES}</p>
    <p class="eyebrow">Stempel gezet ✓</p>
  `;
}

function toonSwitchVerhaal(wortel, vers = false) {
  wortel.innerHTML = `<div class="dokument ${vers ? 'dokument--onthuld' : ''}">${SWITCH_VERHAAL}</div>`;
}
