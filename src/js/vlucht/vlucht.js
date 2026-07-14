import { PAGINAS, SECTIES, paneelZicht, sectieAnker, sectieBij } from './reiskaart.js';
import { bouwSchouwtoneel } from './schouwtoneel.js';

/**
 * De vlucht door de tijd — regie.
 *
 * Op capabele desktops wordt de verticale reis een scroll-gedreven vlucht:
 * een 3D-archiefruimte achter de pagina, de stations als zwevende panelen.
 * Telefoons, reduced-motion en apparaten zonder WebGL2 behouden de
 * klassieke verticale reis — zelfde inhoud, zelfde puzzels.
 */

export function initVlucht() {
  const canvas = document.createElement('canvas');
  canvas.className = 'vlucht-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  let toneel;
  try {
    toneel = bouwSchouwtoneel(canvas);
  } catch {
    canvas.remove();
    return false; /* WebGL weigerde alsnog: klassieke reis */
  }

  document.body.classList.add('vlucht-actief'); /* idempotent met main.js */

  /* startbaan: onzichtbare hoogte die de scroll-lengte van de reis bepaalt */
  const baan = document.createElement('div');
  baan.className = 'vlucht-baan';
  baan.style.height = `${PAGINAS * 100}vh`;
  baan.setAttribute('aria-hidden', 'true');
  document.body.append(baan);

  /* panelen verzamelen en kant-klassen geven */
  const panelen = new Map();
  for (const sectie of SECTIES) {
    const el =
      sectie.id === 'landing'
        ? document.querySelector('[data-landing]')
        : document.getElementById(`station-${sectie.id}`);
    if (!el) continue;
    el.classList.add('vlucht-paneel', `vlucht-paneel--${sectie.kant}`);
    panelen.set(sectie.id, el);
  }

  /* scrollstand → voortgang, elke frame */
  const stand = { p: 0, snelheid: 0 };
  let vorigeP = 0;
  let vorigeTijd = performance.now();
  let vorigeSectie = null;

  const haltes = [...document.querySelectorAll('.tijdlijn__halte')];

  function lus(nu) {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    const dt = Math.max(1, nu - vorigeTijd) / 1000;

    const momentaan = (p - vorigeP) / dt;
    stand.snelheid += (momentaan - stand.snelheid) * Math.min(1, dt * 8);
    stand.p = p;
    vorigeP = p;
    vorigeTijd = nu;

    toneel.bijwerken(p, stand.snelheid, dt);

    /* panelen laten ademen met de voortgang */
    for (const [id, el] of panelen) {
      const zicht = paneelZicht(p, id);
      el.style.opacity = zicht.toFixed(3);
      el.style.transform = `translateY(${((1 - zicht) * 1.2).toFixed(2)}rem)`;
      const actief = zicht > 0.45;
      el.classList.toggle('vlucht-paneel--actief', actief);
      if (actief) el.removeAttribute('inert');
      else el.setAttribute('inert', '');
    }

    /* tijdlijn-stip volgt de vlucht */
    const sectie = sectieBij(p);
    if (sectie !== vorigeSectie) {
      vorigeSectie = sectie;
      haltes.forEach((halte) =>
        halte.classList.toggle(
          'tijdlijn__halte--actief',
          halte.dataset.station === sectie
        )
      );
    }

    requestAnimationFrame(lus);
  }
  requestAnimationFrame(lus);

  /* navigatie: tijdlijn- en ankerklikken vliegen naar de sectie */
  document.addEventListener(
    'click',
    (e) => {
      const anker = e.target.closest('a[href^="#station-"], a[href="#hoofdinhoud"]');
      if (!anker) return;
      const id = anker.getAttribute('href').replace('#station-', '').replace('#hoofdinhoud', 'landing');
      e.preventDefault();
      vliegNaar(id);
    },
    true
  );

  function vliegNaar(id) {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: sectieAnker(id) * max, behavior: 'smooth' });
  }

  /* diepe link (#station-x) bij binnenkomst */
  const hash = location.hash.replace('#station-', '');
  if (hash && SECTIES.some((s) => s.id === hash)) {
    requestAnimationFrame(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: sectieAnker(hash) * max, behavior: 'instant' });
    });
  }

  return true;
}
