import { dossier, stations } from '../content.js';
import { getStempels } from './state.js';

/**
 * Het reisdossier — signature-element (§2): een dossier onderin beeld dat per
 * station een stempel krijgt. De zes-stempels-beloning (certificaat) komt bij
 * station 6.
 */
export function initDossier() {
  const wortel = document.querySelector('[data-dossier]');
  if (!wortel) return;

  wortel.innerHTML = `
    <button class="dossier__knop" type="button" aria-expanded="false"
            aria-controls="dossier-paneel">
      <span class="eyebrow">${dossier.titel}</span>
      <span class="dossier__telling" data-dossier-telling></span>
    </button>
    <div class="dossier__paneel" id="dossier-paneel" hidden>
      <p class="dossier__uitleg">${dossier.uitleg}</p>
      <ol class="dossier__stempels" data-dossier-stempels></ol>
    </div>
  `;

  const knop = wortel.querySelector('.dossier__knop');
  const paneel = wortel.querySelector('.dossier__paneel');

  knop.addEventListener('click', () => {
    const open = knop.getAttribute('aria-expanded') === 'true';
    knop.setAttribute('aria-expanded', String(!open));
    paneel.hidden = open;
  });

  render(wortel);
  document.addEventListener('reis:stempel', () => render(wortel));
}

function render(wortel) {
  const stempels = getStempels();
  const telling = wortel.querySelector('[data-dossier-telling]');
  const lijst = wortel.querySelector('[data-dossier-stempels]');
  const vol = stempels.length === stations.length;

  telling.textContent =
    stempels.length === 0
      ? dossier.leegLabel
      : `${stempels.length} van ${stations.length}`;

  lijst.innerHTML = stations
    .map((station) => {
      const geraakt = stempels.includes(station.id);
      return `
        <li class="dossier__slot ${geraakt ? 'dossier__slot--geraakt' : ''}">
          <span class="dossier__stempel" aria-hidden="true">
            ${geraakt ? station.stempel : ''}
          </span>
          <span class="visueel-verborgen">
            Station ${station.nummer}, ${station.tijdvak}:
            ${geraakt ? 'stempel behaald' : 'nog geen stempel'}
          </span>
        </li>
      `;
    })
    .join('');

  /* zes stempels: het dossier klapt open tot een certificaat (§2, station 6) */
  const paneel = wortel.querySelector('.dossier__paneel');
  let certKnop = paneel.querySelector('[data-certificaat-open]');
  if (vol && !certKnop) {
    certKnop = document.createElement('button');
    certKnop.type = 'button';
    certKnop.className = 'knop knop--rood dossier__certificaatknop';
    certKnop.setAttribute('data-certificaat-open', '');
    certKnop.textContent = 'Open het certificaat';
    certKnop.addEventListener('click', openCertificaat);
    paneel.append(certKnop);
  }
}

/* ---------- het historisch certificaat van volharding ---------- */

function openCertificaat() {
  let dialoog = document.querySelector('[data-certificaat]');
  if (!dialoog) {
    dialoog = bouwCertificaat();
    document.body.append(dialoog);
  }
  dialoog.showModal();
}

function bouwCertificaat() {
  const dialoog = document.createElement('dialog');
  dialoog.className = 'certificaat';
  dialoog.setAttribute('data-certificaat', '');
  dialoog.setAttribute('aria-label', 'Historisch certificaat van volharding');
  dialoog.innerHTML = `
    <div class="certificaat__blad">
      <p class="eyebrow">Reisdossier · volbracht</p>
      <p class="certificaat__titel">Historisch Certificaat<br>van Volharding</p>
      <p class="certificaat__tekst">Hierbij wordt verklaard dat de houder van dit
      dossier alle zes stations van <em>De Reis van de Historicus</em> heeft
      doorlopen — daarbij één Grieks woord ontcijferend, één kaart daterend,
      één telegram decoderend, één president doorziend, twee demo's doorstaand
      en de toekomst eigenhandig bestempelend.</p>
      <ol class="certificaat__stempels" aria-hidden="true">
        ${stations
          .map((station) => `<li class="certificaat__stempel">${station.stempel}</li>`)
          .join('')}
      </ol>
      <p class="certificaat__plaats">Opgemaakt te Rotterdam · benvanooijen.nl</p>
      <p class="certificaat__handtekening">B. van Ooijen<span>eerstegraads docent geschiedenis</span></p>
      <p class="certificaat__voetnoot">Aan dit certificaat kunnen geen rechten worden ontleend. Wel een gesprek.</p>
      <div class="certificaat__acties geen-print">
        <button class="knop knop--rood" type="button" data-certificaat-print>Print het certificaat</button>
        <button class="knop knop--omtrek" type="button" data-certificaat-sluit>Sluit</button>
      </div>
    </div>
  `;
  dialoog
    .querySelector('[data-certificaat-print]')
    .addEventListener('click', () => window.print());
  dialoog
    .querySelector('[data-certificaat-sluit]')
    .addEventListener('click', () => dialoog.close());
  return dialoog;
}
