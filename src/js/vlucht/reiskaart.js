import * as THREE from 'three';

/**
 * De reiskaart — één bron van waarheid voor de vlucht door de tijd.
 *
 * De archiefruimte strekt zich uit langs -Z. Scrollvoortgang p ∈ [0,1]
 * stuurt de camera langs een CatmullRom-pad van portaal naar portaal;
 * de DOM-panelen faden per sectiebereik in en uit.
 */

export const PAGINAS = 10; /* startbaan = PAGINAS × 100vh */

export const SECTIES = [
  { id: 'landing', bereik: [0.0, 0.08], kant: 'midden' },
  { id: 'oudheid', bereik: [0.08, 0.21], kant: 'rechts' },
  { id: 'ontdekkers', bereik: [0.21, 0.34], kant: 'links' },
  { id: 'netwerk', bereik: [0.34, 0.47], kant: 'rechts' },
  { id: 'master', bereik: [0.47, 0.6], kant: 'links' },
  { id: 'klas', bereik: [0.6, 0.78], kant: 'rechts' },
  { id: 'toekomst', bereik: [0.78, 1.0], kant: 'midden' },
];

/**
 * De portalen: zwevende duotone-documenten in de diepte.
 * `breedte` in wereld-eenheden; hoogte volgt de beeldverhouding.
 */
export const PORTALEN = [
  {
    id: 'vroom',
    src: '/img/landing-vroom-1599.webp',
    verhouding: 3530 / 7658,
    positie: [0, 0.8, -22],
    breedte: 12,
  },
  {
    id: 'oudheid',
    src: '/img/station-oudheid-amfora.webp',
    verhouding: 1500 / 1200,
    positie: [-10, 0.8, -50],
    breedte: 6,
    label: 'Station 1 — De Oudheid',
  },
  {
    id: 'ontdekkers',
    src: '/img/station-ontdekkers-castello.webp',
    verhouding: 1200 / 1600,
    positie: [10, -0.6, -90],
    breedte: 8.5,
    label: 'Station 2 — De Tijd van Ontdekkers',
  },
  {
    id: 'netwerk',
    src: '/img/station-netwerk-telegraaf.webp',
    verhouding: 1109 / 1536,
    positie: [-10, 0.8, -130],
    breedte: 8,
    label: 'Station 3 — Telegraaf en Telefoon',
  },
  {
    id: 'master',
    src: '/img/station-master-smog.webp',
    verhouding: 1082 / 1600,
    positie: [10, -0.6, -170],
    breedte: 8.5,
    label: 'Station 4 — De Tijd van Televisie en Computer',
  },
  {
    id: 'klas',
    src: '/img/scherm-escaperoom.webp',
    verhouding: 984 / 896,
    positie: [-10.5, 0.4, -210],
    breedte: 7,
    label: 'Station 5 — De Eenentwintigste Eeuw',
  },
  {
    id: 'cellarius',
    src: '/img/station-toekomst-cellarius.webp',
    verhouding: 1380 / 1600,
    positie: [0, 1, -262],
    breedte: 16,
    label: 'Station 6 — De Toekomst',
  },
];

/* Finale-ramp: 0 vóór de nadering van de sterrenkaart, 1 als we erin zijn. */
export function finaleVoortgang(p) {
  return THREE.MathUtils.smoothstep(p, 0.88, 0.995);
}

/* ------------------------------------------------------------------ */
/* Camerapad                                                           */
/* ------------------------------------------------------------------ */

const CAMERA_SLEUTELS = [
  /* voor de walnoten dubbeldeur, die vanzelf openzwaait */
  { p: 0.0, pos: [0, 0.3, 11], doel: [0, 0.8, -22], fov: 46 },
  { p: 0.05, pos: [0, 0.4, 3.5], doel: [0, 0.8, -22], fov: 47 },
  { p: 0.08, pos: [2, 0.6, -6], doel: [-7, 0.8, -50], fov: 50 },
  { p: 0.15, pos: [3.2, 0.4, -32], doel: [-10, 0.8, -50], fov: 50 },
  { p: 0.21, pos: [-2, 0, -58], doel: [7, -0.6, -90], fov: 51 },
  { p: 0.28, pos: [-3.2, -0.4, -72], doel: [10, -0.6, -90], fov: 51 },
  { p: 0.34, pos: [2, 0.4, -98], doel: [-7, 0.8, -130], fov: 51 },
  { p: 0.41, pos: [3.2, 0.4, -112], doel: [-10, 0.8, -130], fov: 51 },
  { p: 0.47, pos: [-2, -0.4, -138], doel: [7, -0.6, -170], fov: 51 },
  { p: 0.54, pos: [-3.2, -0.4, -152], doel: [10, -0.6, -170], fov: 51 },
  { p: 0.6, pos: [2, 0.3, -178], doel: [-8, 0.4, -210], fov: 51 },
  { p: 0.7, pos: [3, 0, -192], doel: [-10.5, 0.4, -210], fov: 50 },
  /* de blik stijgt naar de aarde op het heliocentrische blad */
  { p: 0.78, pos: [0, 0, -222], doel: [0, 1, -262], fov: 48 },
  { p: 0.9, pos: [0, 0.7, -238], doel: [0, 2.1, -262], fov: 44 },
  { p: 1.0, pos: [0, 1.9, -252], doel: [0, 2.95, -262], fov: 38 },
];

function bouwKromme(sleutels, veld) {
  const punten = sleutels.map((s) => new THREE.Vector3(...s[veld]));
  return {
    kromme: new THREE.CatmullRomCurve3(punten, false, 'centripetal', 0.5),
    stops: sleutels.map((s) => s.p),
  };
}

const posKromme = bouwKromme(CAMERA_SLEUTELS, 'pos');
const doelKromme = bouwKromme(CAMERA_SLEUTELS, 'doel');

/* voortgang → krommeparameter u, rekening houdend met ongelijke afstanden */
function naarU(p, stops) {
  const n = stops.length;
  const klem = THREE.MathUtils.clamp(p, 0, 1);
  for (let i = 0; i < n - 1; i++) {
    if (klem <= stops[i + 1]) {
      const t = (klem - stops[i]) / (stops[i + 1] - stops[i]);
      return (i + t) / (n - 1);
    }
  }
  return 1;
}

/** Bemonster het camerapad; schrijft in uitPos/uitDoel, geeft fov terug. */
export function bemonsterCamera(p, uitPos, uitDoel) {
  posKromme.kromme.getPoint(naarU(p, posKromme.stops), uitPos);
  doelKromme.kromme.getPoint(naarU(p, doelKromme.stops), uitDoel);

  let fov = CAMERA_SLEUTELS.at(-1).fov;
  for (let i = 0; i < CAMERA_SLEUTELS.length - 1; i++) {
    const [a, b] = [CAMERA_SLEUTELS[i], CAMERA_SLEUTELS[i + 1]];
    if (p <= b.p) {
      const t = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
      fov = THREE.MathUtils.lerp(a.fov, b.fov, t);
      break;
    }
  }
  return fov;
}

/* ------------------------------------------------------------------ */
/* Sectiehulpen                                                        */
/* ------------------------------------------------------------------ */

export function sectieBij(p) {
  for (const sectie of SECTIES) {
    if (p <= sectie.bereik[1]) return sectie.id;
  }
  return 'toekomst';
}

/**
 * Zichtbaarheid van een paneel bij voortgang p: 0..1 met in- en uitfade
 * aan de randen van het bereik. De landing fadet alleen úít.
 */
export function paneelZicht(p, id) {
  const sectie = SECTIES.find((s) => s.id === id);
  const [a, b] = sectie.bereik;
  const marge = 0.022;
  const inFade =
    id === 'landing' ? 1 : THREE.MathUtils.smoothstep(p, a, a + marge);
  const uitFade =
    id === 'toekomst' ? 1 : 1 - THREE.MathUtils.smoothstep(p, b - marge, b);
  return inFade * uitFade;
}

/** Scroll-anker (voortgang) voor navigatie naar een sectie. */
export function sectieAnker(id) {
  const sectie = SECTIES.find((s) => s.id === id);
  if (!sectie) return 0;
  if (id === 'landing') return 0;
  if (id === 'toekomst') return sectie.bereik[0] + 0.05;
  const [a, b] = sectie.bereik;
  return a + (b - a) * 0.5;
}
