import { stations } from '../content.js';
import { getStempels } from './state.js';

/**
 * De horizontale tijdlijn — altijd zichtbaar zodra de reis begonnen is (§2).
 * Vooruit en terug reizen kan altijd; puzzels zijn optioneel.
 * Toetsenbord: pijltjes bewegen tussen stations (roving tabindex).
 */
export function initTijdlijn() {
  const nav = document.querySelector('[data-tijdlijn]');
  if (!nav) return;

  nav.innerHTML = `
    <ol class="tijdlijn__lijst">
      ${stations
        .map(
          (station, i) => `
        <li class="tijdlijn__item">
          <a class="tijdlijn__halte" href="#station-${station.id}"
             data-station="${station.id}" ${i === 0 ? '' : 'tabindex="-1"'}>
            <span class="tijdlijn__stip" aria-hidden="true"></span>
            <span class="tijdlijn__jaar">${station.tijdlijnLabel}</span>
            <span class="visueel-verborgen">
              Station ${station.nummer}: ${station.tijdvak} — ${station.titel}
            </span>
          </a>
        </li>
      `
        )
        .join('')}
    </ol>
  `;

  const haltes = [...nav.querySelectorAll('.tijdlijn__halte')];

  nav.addEventListener('keydown', (e) => {
    const index = haltes.indexOf(document.activeElement);
    if (index === -1) return;
    let doel = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') doel = index + 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') doel = index - 1;
    if (e.key === 'Home') doel = 0;
    if (e.key === 'End') doel = haltes.length - 1;
    if (doel === null || !haltes[doel]) return;
    e.preventDefault();
    haltes.forEach((h, i) => h.setAttribute('tabindex', i === doel ? '0' : '-1'));
    haltes[doel].focus();
  });

  const markeerStempels = () => {
    const stempels = getStempels();
    haltes.forEach((halte) => {
      halte.classList.toggle(
        'tijdlijn__halte--geraakt',
        stempels.includes(halte.dataset.station)
      );
    });
  };
  markeerStempels();
  document.addEventListener('reis:stempel', markeerStempels);

  /* actieve halte volgt de scroll */
  const secties = stations
    .map((s) => document.getElementById(`station-${s.id}`))
    .filter(Boolean);
  if ('IntersectionObserver' in window && secties.length) {
    const kijker = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id.replace('station-', '');
          haltes.forEach((halte) =>
            halte.classList.toggle(
              'tijdlijn__halte--actief',
              halte.dataset.station === id
            )
          );
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    secties.forEach((sectie) => kijker.observe(sectie));
  }
}
