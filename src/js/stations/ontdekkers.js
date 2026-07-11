import { geefStempel, isOntgrendeld, ontgrendel } from '../state.js';

/**
 * Station 2 · De Tijd van Ontdekkers — EraGuessr (contentplan §3).
 * Eén kaart, raad het jaartal op de slider. Marge ±25 jaar = raak.
 * Fout raden bestaat niet: elke misser geeft een warmer/kouder-aanwijzing.
 */

const JAAR = 1660;
const MARGE = 25;

const BRONVERMELDING =
  'Het Castello Plan — "Afbeeldinge van de Stadt Amsterdam in Nieuw Neederlandt", 1660. Publiek domein, via Wikimedia Commons.';

const SUCCES = (gok) => `
  <span class="puzzel__antwoord" aria-hidden="true">Nieuw-Amsterdam · 1660</span>
  ${
    Math.abs(gok - JAAR) === 0
      ? 'In de roos.'
      : `Je gokte ${gok} — dichtbij genoeg.`
  }
  Dit is het <strong>Castello Plan van Nieuw-Amsterdam, 1660</strong>: Amsterdam
  en Amerika op één kaart. Vier jaar later namen de Engelsen de stad over en
  heette ze New York. Precies de oversteek die ik studeerde.
`;

const RODE_DRAAD = `
  <p class="eyebrow">Ontgrendeld · Van Amsterdam naar Amerika</p>
  <p>De rode draad van mijn studie: bachelor geschiedenis aan de UvA
  (2003–2010), major American Studies, minor English Proficiency. Amerikaanse
  geschiedenis bestuderen in het Engels — die combinatie kwam terug in mijn
  master (station 4) en staat nu dagelijks voor de klas in mijn TTO-lessen.
  De oversteek van 2003 is nooit meer teruggedraaid.</p>
`;

export function initOntdekkers() {
  const schuifblok = document.querySelector('[data-ontdekkers-schuif]');
  const unlockWortel = document.querySelector('[data-unlock-ontdekkers]');
  const bron = document.querySelector('[data-ontdekkers-bron]');
  if (!schuifblok || !unlockWortel || !bron) return;

  if (isOntgrendeld('ontdekkers')) {
    toonOpgelost(schuifblok, bron, JAAR);
    toonRodeDraad(unlockWortel);
    return;
  }

  unlockWortel.innerHTML = `
    <p class="ontgrendeling__slot">
      <span aria-hidden="true">▢</span> vergrendeld — raad het jaartal voor de rode draad
    </p>
  `;

  const invoer = schuifblok.querySelector('[data-ontdekkers-invoer]');
  const uitlezing = schuifblok.querySelector('[data-ontdekkers-jaar]');
  const melding = schuifblok.querySelector('[data-ontdekkers-melding]');
  const gokKnop = schuifblok.querySelector('[data-ontdekkers-gok]');

  const toonJaar = () => {
    uitlezing.textContent = invoer.value;
    const deel = (invoer.value - invoer.min) / (invoer.max - invoer.min);
    uitlezing.style.setProperty('--positie', deel);
  };
  invoer.addEventListener('input', toonJaar);
  toonJaar();

  let pogingen = 0;
  gokKnop.addEventListener('click', () => {
    const gok = Number(invoer.value);
    const afstand = Math.abs(gok - JAAR);

    if (afstand <= MARGE) {
      toonOpgelost(schuifblok, bron, gok);
      ontgrendel('ontdekkers');
      geefStempel('ontdekkers');
      toonRodeDraad(unlockWortel, true);
      return;
    }

    pogingen += 1;
    const richting = gok < JAAR ? 'later' : 'eerder';
    const heet = afstand <= 60 ? 'Warm.' : afstand <= 120 ? 'Lauw.' : 'Koud.';
    melding.textContent =
      pogingen < 3
        ? `${heet} ${afstand} jaar ernaast — zoek het ${richting}.`
        : `${afstand} jaar ernaast, zoek het ${richting}. Tip: let op de gevels — en op wie er wél al woont, maar nog geen Engels spreekt.`;
  });
}

function toonOpgelost(schuifblok, bron, gok) {
  schuifblok.innerHTML = `
    <p class="puzzel__succes">${SUCCES(gok)}</p>
    <p class="eyebrow">Stempel gezet ✓</p>
  `;
  bron.textContent = BRONVERMELDING;
}

function toonRodeDraad(wortel, vers = false) {
  wortel.innerHTML = `<div class="dokument ${vers ? 'dokument--onthuld' : ''}">${RODE_DRAAD}</div>`;
}
