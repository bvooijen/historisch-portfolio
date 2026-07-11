import { geefStempel, heeftStempel, ontgrendel } from '../state.js';

/**
 * Station 6 · De Toekomst — geen puzzel (§3): de toekomst is nog niet
 * geschreven, dus de laatste stempel zet de bezoeker zelf.
 */
export function initToekomst() {
  const interactie = document.querySelector('[data-toekomst-interactie]');
  if (!interactie) return;

  if (heeftStempel('toekomst')) {
    toonGezet(interactie);
    return;
  }

  interactie.innerHTML = `
    <button class="stempelknop" type="button" data-stempel>
      <span class="stempelknop__rand">zet de laatste stempel</span>
    </button>
  `;

  interactie.querySelector('[data-stempel]').addEventListener('click', () => {
    ontgrendel('toekomst');
    geefStempel('toekomst');
    toonGezet(interactie, true);
  });
}

function toonGezet(wortel, vers = false) {
  wortel.innerHTML = `
    <p class="puzzel__succes ${vers ? 'dokument--onthuld' : ''}">
      <span class="puzzel__antwoord" aria-hidden="true">∞</span>
      Gezet. De reis is volbracht — of begint hij nu pas?
      Werp een blik op uw reisdossier, rechtsonder.
    </p>
    <p class="eyebrow">Stempel gezet ✓</p>
  `;
}
