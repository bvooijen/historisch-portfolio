import { landing } from '../content.js';

/**
 * De EraGuessr-opening (§2): één historisch beeld, één klik op de tijdlijn.
 * Fout raden bestaat niet — elke gok start de reis met een knipoog.
 */
export function initLanding() {
  const sectie = document.querySelector('[data-landing]');
  if (!sectie) return;

  const schuif = sectie.querySelector('[data-landing-schuif]');
  const uitlezing = sectie.querySelector('[data-landing-jaar]');
  const gokKnop = sectie.querySelector('[data-landing-gok]');
  const reactie = sectie.querySelector('[data-landing-reactie]');

  const toonJaar = () => {
    uitlezing.textContent = schuif.value;
    const bereik = schuif.max - schuif.min;
    const deel = (schuif.value - schuif.min) / bereik;
    uitlezing.style.setProperty('--positie', deel);
  };
  schuif.addEventListener('input', toonJaar);
  toonJaar();

  let geraden = false;
  const raad = () => {
    if (geraden) return;
    geraden = true;

    const gok = Number(schuif.value);
    const { jaar } = landing.beeld;
    const afstand = Math.abs(gok - jaar);
    const tekst = (afstand <= 25 ? landing.reactieRaak : landing.reactieBijna)
      .replaceAll('{gok}', String(gok))
      .replaceAll('{jaar}', String(jaar));

    reactie.innerHTML = `
      <p class="landing__uitslag">
        <span class="eyebrow">${afstand <= 25 ? 'Raak' : `${afstand} jaar ernaast`}</span>
        ${tekst} <em>${landing.reactieStaart}</em>
      </p>
      <p class="landing__acties">
        <a class="knop knop--rood" href="#station-oudheid" data-landing-start>
          ${landing.startKnop} <span aria-hidden="true">→</span>
        </a>
      </p>
    `;
    sectie.classList.add('landing--geraden');
    document.body.classList.add('reis-begonnen');
    reactie.querySelector('[data-landing-start]').focus();
  };

  /* één klik op de tijdlijn volstaat; toetsenbord kiest eerst en bevestigt dan */
  schuif.addEventListener('pointerup', raad);
  schuif.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') raad();
  });
  gokKnop.addEventListener('click', raad);
}
