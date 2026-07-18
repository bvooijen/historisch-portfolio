/* instap voor de lichte pagina's: /overzicht en /colofon */
import '@fontsource/spectral/400.css';
import '@fontsource/spectral/400-italic.css';
import '@fontsource/spectral/600.css';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/700.css';
import '@fontsource/special-elite/400.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/licht.css';

/* -- overzicht: scroll-onthulling (progressief: zonder JS blijft alles zichtbaar) -- */
const onthullers = [...document.querySelectorAll('[data-onthul]')];
const rustig = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (onthullers.length && 'IntersectionObserver' in window && !rustig) {
  const kijker = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('onthul--zichtbaar');
        kijker.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  for (const el of onthullers) {
    el.classList.add('onthul');
    kijker.observe(el);
  }
  /* wat al in beeld staat direct tonen (geen flits bij laden) */
  requestAnimationFrame(() => {
    for (const el of onthullers) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add('onthul--zichtbaar');
      }
    }
  });
}

/* -- overzicht: actieve sectie markeren in de zijnav -- */
const rail = document.querySelector('[data-rail]');
if (rail && 'IntersectionObserver' in window) {
  const koppelingen = new Map(
    [...rail.querySelectorAll('a[href^="#"]')].map((a) => [
      a.getAttribute('href').slice(1),
      a,
    ])
  );
  const secties = [...koppelingen.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const spion = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of koppelingen.values()) a.removeAttribute('aria-current');
        koppelingen.get(entry.target.id)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-35% 0px -55% 0px' }
  );
  secties.forEach((sectie) => spion.observe(sectie));
}
