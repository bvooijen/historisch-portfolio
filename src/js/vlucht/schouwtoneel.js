import * as THREE from 'three';
import { PORTALEN, bemonsterCamera, finaleVoortgang } from './reiskaart.js';

/**
 * Het schouwtoneel: de privécollectie van een hertog.
 * Bibliotheek-galerij in donker notenhout met klassieke moulures en
 * boekenkasten achter glas, cassetteplafond met messing accenten,
 * glas-in-lood ramen op een verre tuin, een Perzisch tapijt over oude
 * planken, kroonluchters en tafellampen met zijden kap — alles in warm
 * amber 'golden hour'-licht. Aan het einde het heliocentrische
 * Cellarius-blad, waar de blik landt op de aarde.
 */

const GOUD = new THREE.Color('#e8b84b');
const ACHTERGROND = '#261a10';
const WALNOOT = '#5a3d22';
const WALNOOT_DONKER = '#33200f';
const WALNOOT_LICHT = '#7a5530';
const MESSING = '#c9a24b';
const BORDEAUX = '#5c2026';
const GROEN_DONKER = '#1b3a2d';
const WARMLICHT = '#ffcf8f'; /* amber golden hour */
const DAGLICHT = '#ffe9c2';

/* zaalmaten */
const HALF_BREED = 18;
const VLOER_Y = -8;
const PLAFOND_Y = 12;
const ZAAL_BEGIN = 6;
const ZAAL_EIND = -264;

/* de aarde op het Planisphaerium Copernicanum: vrijwel recht boven het
   midden (de zon), op ±14% van de kaarthoogte — daar eindigt de reis */
export const AARDE_OFFSET = { x: 0, y: 0.141 };

export function bouwSchouwtoneel(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(ACHTERGROND);
  scene.fog = new THREE.Fog(new THREE.Color(ACHTERGROND), 32, 150);

  const camera = new THREE.PerspectiveCamera(
    46,
    window.innerWidth / window.innerHeight,
    0.1,
    420
  );

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  /* -- de zaal -- */
  const deuren = bouwZaal(scene);
  if (import.meta.env?.DEV) window.__vluchtDebug = { deuren, scene };

  /* -- stof in het goudlicht -- */
  const stofLagen = [maakStof(500, 0.14, 0.3), maakStof(260, 0.3, 0.14)];
  stofLagen.forEach((laag) => scene.add(laag));

  /* -- de schilderijen -- */
  const texturen = new THREE.TextureLoader();
  const portaalObjecten = new Map();
  for (const portaal of PORTALEN) {
    const groep = maakSchilderij(portaal, texturen);
    portaalObjecten.set(portaal.id, groep);
    scene.add(groep);
  }

  /* -- salon-wanden: klein werk in messing lijsten tussen de stations -- */
  bouwSalon(scene, texturen);

  /* -- finale: warme gloed op de aarde in het Cellarius-blad -- */
  const cellarius = portaalObjecten.get('cellarius');
  const kaartHoogte = PORTALEN.at(-1).breedte * PORTALEN.at(-1).verhouding;
  const gloed = maakGloed(WARMLICHT);
  gloed.position.copy(cellarius.position);
  gloed.position.x += AARDE_OFFSET.x * PORTALEN.at(-1).breedte;
  gloed.position.y += AARDE_OFFSET.y * kaartHoogte;
  gloed.position.z += 0.5;
  gloed.scale.setScalar(7);
  scene.add(gloed);

  /* typewriter-bordjes pas tekenen als het font geladen is */
  if (document.fonts?.load) {
    document.fonts.load('600 84px "Special Elite"').then(() => {
      for (const portaal of PORTALEN) {
        if (!portaal.label) continue;
        hangLabel(portaalObjecten.get(portaal.id), portaal);
      }
    });
    /* de poortnaam in statige serif */
    document.fonts.load('600 96px "Spectral"').then(() => {
      bouwPoortTekst(scene);
    });
  }

  /* -- per-frame besturing -- */
  const startTijd = performance.now();
  const doelPos = new THREE.Vector3();
  const doelKijk = new THREE.Vector3();
  const gladPos = new THREE.Vector3(0, 0.3, 11);
  const gladKijk = new THREE.Vector3(0, 0.4, -16);
  const muis = { x: 0, y: 0 };
  let eersteFrame = true;

  window.addEventListener('pointermove', (e) => {
    muis.x = (e.clientX / window.innerWidth) * 2 - 1;
    muis.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function bijwerken(p, snelheid, dt) {
    const fov = bemonsterCamera(p, doelPos, doelKijk);

    /* bij herladen midden in de reis: direct op positie */
    if (eersteFrame) {
      eersteFrame = false;
      gladPos.copy(doelPos);
      gladKijk.copy(doelKijk);
    }

    const demp = (a, b) => THREE.MathUtils.damp(a, b, 3.2, dt);
    gladPos.x = demp(gladPos.x, doelPos.x + muis.x * 0.45);
    gladPos.y = demp(gladPos.y, doelPos.y - muis.y * 0.3);
    gladPos.z = demp(gladPos.z, doelPos.z);
    gladKijk.x = demp(gladKijk.x, doelKijk.x);
    gladKijk.y = demp(gladKijk.y, doelKijk.y);
    gladKijk.z = demp(gladKijk.z, doelKijk.z);

    camera.position.copy(gladPos);
    camera.lookAt(gladKijk);

    const vaart = Math.min(Math.abs(snelheid) * 6, 1);
    camera.fov = fov + vaart * 3;
    camera.updateProjectionMatrix();

    /* de dubbeldeur zwaait vanzelf open; snel scrollen dwingt hem ook */
    const na = (performance.now() - startTijd - 1600) / 3000;
    const tijdsHoek = zachtjes(THREE.MathUtils.clamp(na, 0, 1));
    const scrollHoek = THREE.MathUtils.smoothstep(p, 0, 0.04);
    const hoek = Math.max(tijdsHoek, scrollHoek) * THREE.MathUtils.degToRad(104);
    deuren.links.rotation.y = -hoek;
    deuren.rechts.rotation.y = hoek;

    /* stof zweeft traag door het lamplicht */
    const t = performance.now() / 1000;
    stofLagen[0].position.y = Math.sin(t * 0.16) * 0.5;
    stofLagen[1].position.y = Math.cos(t * 0.11) * 0.7;
    stofLagen[1].rotation.y = t * 0.004;

    /* finale: het licht zoekt de aarde op het heliocentrische blad */
    const finale = finaleVoortgang(p);
    const kaart = cellarius.userData.beeld;
    if (kaart) {
      kaart.material.color.lerpColors(
        new THREE.Color('#ffffff'),
        new THREE.Color('#ffe4ae'),
        finale
      );
    }
    gloed.material.opacity = 0.06 + finale * 0.85;
    scene.fog.far = 150 + finale * 200;

    renderer.render(scene, camera);
  }

  function herschaal() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  window.addEventListener('resize', herschaal);

  return { bijwerken, herschaal, renderer };
}

function zachtjes(t) {
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/* Texturen — alles procedureel, geen externe assets                   */
/* ------------------------------------------------------------------ */

function houtTextuur(basis = WALNOOT, donker = WALNOOT_DONKER, planken = 8) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = basis;
  ctx.fillRect(0, 0, 512, 512);

  const plankBreedte = 512 / planken;
  for (let plank = 0; plank < planken; plank++) {
    const x0 = plank * plankBreedte;
    ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.12})`;
    ctx.fillRect(x0, 0, plankBreedte, 512);
    for (let n = 0; n < 22; n++) {
      ctx.strokeStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '130,90,45'},${
        0.05 + Math.random() * 0.1
      })`;
      ctx.lineWidth = 0.6 + Math.random() * 1.2;
      ctx.beginPath();
      let x = x0 + Math.random() * plankBreedte;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 32) {
        x += (Math.random() - 0.5) * 6;
        ctx.lineTo(Math.max(x0 + 1, Math.min(x0 + plankBreedte - 1, x)), y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = donker;
    ctx.lineWidth = 2;
    ctx.strokeRect(x0 + 0.5, -2, plankBreedte - 1, 516);
  }

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.wrapS = textuur.wrapT = THREE.RepeatWrapping;
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

/** Volledige lambrisering: paneelvakken met moulures, twee registers. */
function paneelwandTextuur() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = WALNOOT;
  ctx.fillRect(0, 0, 512, 512);
  /* houtwaas */
  for (let n = 0; n < 90; n++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.06})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + (Math.random() - 0.5) * 24);
    ctx.stroke();
  }

  const vak = (x, y, b, h) => {
    /* verdiept veld */
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(x, y, b, h);
    ctx.fillStyle = WALNOOT_LICHT + '22';
    ctx.fillRect(x + 10, y + 10, b - 20, h - 20);
    /* moulure: licht boven/links, donker onder/rechts */
    ctx.strokeStyle = 'rgba(160,110,60,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + b, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(15,8,3,0.85)';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + b, y + h);
    ctx.lineTo(x + b, y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(201,158,63,0.28)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 8, y + 8, b - 16, h - 16);
  };

  /* twee panelen per module, groot register boven, laag register onder */
  for (const x of [24, 280]) {
    vak(x, 40, 208, 300);
    vak(x, 380, 208, 92);
  }
  /* stijlen en regels donkerder */
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(0, 0, 512, 12);
  ctx.fillRect(0, 352, 512, 16);
  ctx.fillRect(0, 484, 512, 28);
  for (const x of [0, 248, 504]) ctx.fillRect(x, 0, 8, 512);

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.wrapS = textuur.wrapT = THREE.RepeatWrapping;
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

function messingTextuur() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const verloop = ctx.createLinearGradient(0, 0, 0, 64);
  verloop.addColorStop(0, '#e6c471');
  verloop.addColorStop(0.35, '#a87f2e');
  verloop.addColorStop(0.6, '#6e5220');
  verloop.addColorStop(1, '#c9a24b');
  ctx.fillStyle = verloop;
  ctx.fillRect(0, 0, 64, 64);
  for (let n = 0; n < 40; n++) {
    ctx.fillStyle = `rgba(255,240,200,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 1);
  }
  const textuur = new THREE.CanvasTexture(canvas);
  textuur.wrapS = textuur.wrapT = THREE.RepeatWrapping;
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

/** Boekruggen voor de kastvakken: rijen antieke banden. */
function boekenTextuur() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#160d06';
  ctx.fillRect(0, 0, 256, 384);

  const kleuren = ['#6b2b2b', '#3c4a3a', '#7a5530', '#27303f', '#8a6a2c', '#4a2c18', '#5c2026'];
  for (let plank = 0; plank < 3; plank++) {
    const y1 = 12 + plank * 128;
    const hoogte = 104;
    let x = 6;
    while (x < 244) {
      const b = 10 + Math.random() * 16;
      const h = hoogte - Math.random() * 18;
      ctx.fillStyle = kleuren[Math.floor(Math.random() * kleuren.length)];
      ctx.fillRect(x, y1 + (hoogte - h), Math.min(b, 244 - x), h);
      /* goudbandjes op de rug */
      if (Math.random() < 0.7) {
        ctx.fillStyle = 'rgba(201,158,63,0.8)';
        ctx.fillRect(x + 1, y1 + (hoogte - h) + 8, Math.min(b, 244 - x) - 2, 2);
        ctx.fillRect(x + 1, y1 + hoogte - 14, Math.min(b, 244 - x) - 2, 2);
      }
      x += b + 1;
    }
    /* plankdeel */
    ctx.fillStyle = WALNOOT_DONKER;
    ctx.fillRect(0, y1 + hoogte, 256, 10);
  }

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

function loperPatroon() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = BORDEAUX;
  ctx.fillRect(0, 0, 256, 384);

  /* randbanen: goud — groen met meander — goud */
  ctx.fillStyle = '#c99e3f';
  ctx.fillRect(8, 0, 5, 384);
  ctx.fillRect(243, 0, 5, 384);
  ctx.fillStyle = GROEN_DONKER;
  ctx.fillRect(17, 0, 16, 384);
  ctx.fillRect(223, 0, 16, 384);
  ctx.fillStyle = 'rgba(201,158,63,0.85)';
  for (let y = 6; y < 384; y += 24) {
    ctx.fillRect(21, y, 8, 8);
    ctx.fillRect(227, y + 12, 8, 8);
  }
  ctx.fillStyle = '#c99e3f';
  ctx.fillRect(37, 0, 3, 384);
  ctx.fillRect(216, 0, 3, 384);

  /* veld: fijn ruitraster (herati-achtig) */
  ctx.strokeStyle = 'rgba(201,158,63,0.22)';
  ctx.lineWidth = 1;
  for (let y = -32; y < 416; y += 32) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(128, y + 32);
    ctx.lineTo(216, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, y + 32);
    ctx.lineTo(128, y);
    ctx.lineTo(216, y + 32);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(27,58,45,0.85)';
  for (let y = 0; y <= 384; y += 32) {
    for (const x of [84, 172]) {
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* medaillons */
  ctx.strokeStyle = 'rgba(201, 158, 63, 0.8)';
  ctx.lineWidth = 3;
  for (const [cx, cy, r] of [
    [128, 96, 46],
    [128, 288, 46],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.62, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.62, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(230,220,200,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(201, 158, 63, 0.8)';
    ctx.lineWidth = 3;
  }
  ctx.fillStyle = 'rgba(42, 83, 65, 0.9)';
  for (const cy of [0, 192, 384]) {
    ctx.beginPath();
    ctx.arc(128, cy, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  /* slijtage */
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 384, 2, 2);
  }

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.wrapS = textuur.wrapT = THREE.RepeatWrapping;
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

/** Glas-in-lood: boograam met ruitjeslood, gouden avondlicht op een tuin. */
function raamTextuur() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.moveTo(16, 512);
  ctx.lineTo(16, 144);
  ctx.arc(128, 144, 112, Math.PI, 0);
  ctx.lineTo(240, 512);
  ctx.closePath();
  const verloop = ctx.createLinearGradient(0, 0, 0, 512);
  verloop.addColorStop(0, '#fff2d6');
  verloop.addColorStop(0.5, '#ffe3ae');
  verloop.addColorStop(0.8, '#ecd39c');
  verloop.addColorStop(1, '#c9c08a'); /* een verre tuin schemert onderin */
  ctx.fillStyle = verloop;
  ctx.fill();

  /* loodruitjes: diagonaal raster binnen de boog */
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(44,29,16,0.85)';
  ctx.lineWidth = 3;
  for (let d = -512; d < 768; d += 42) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + 512, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(d + 512, 0);
    ctx.lineTo(d, 512);
    ctx.stroke();
  }
  /* enkele ruitjes vangen net iets ander licht */
  for (let n = 0; n < 14; n++) {
    ctx.fillStyle = `rgba(255,255,235,${0.05 + Math.random() * 0.09})`;
    const x = 30 + Math.random() * 190;
    const y = 60 + Math.random() * 400;
    ctx.fillRect(x, y, 30, 30);
  }
  ctx.restore();

  /* zware stijlen */
  ctx.strokeStyle = '#2c1d10';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(16, 512);
  ctx.lineTo(16, 144);
  ctx.arc(128, 144, 112, Math.PI, 0);
  ctx.lineTo(240, 512);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 512);
  ctx.lineTo(128, 36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(16, 300);
  ctx.lineTo(240, 300);
  ctx.stroke();

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

/* ------------------------------------------------------------------ */
/* De zaal                                                             */
/* ------------------------------------------------------------------ */

function bouwZaal(scene) {
  const lengte = ZAAL_BEGIN - ZAAL_EIND;
  const middenZ = (ZAAL_BEGIN + ZAAL_EIND) / 2;
  const zaal = new THREE.Group();

  /* vloer: oude brede planken */
  const vloerTextuur = houtTextuur(WALNOOT, WALNOOT_DONKER, 6);
  vloerTextuur.repeat.set(7, 60);
  const vloer = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_BREED * 2, lengte),
    new THREE.MeshBasicMaterial({ map: vloerTextuur, fog: true })
  );
  vloer.rotation.x = -Math.PI / 2;
  vloer.position.set(0, VLOER_Y, middenZ);
  zaal.add(vloer);

  /* het Perzische tapijt */
  const loperTextuur = loperPatroon();
  loperTextuur.repeat.set(1, Math.round(lengte / 9));
  const loper = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, lengte),
    new THREE.MeshBasicMaterial({ map: loperTextuur, fog: true })
  );
  loper.rotation.x = -Math.PI / 2;
  loper.position.set(0, VLOER_Y + 0.02, middenZ);
  zaal.add(loper);

  /* wanden: volledige notenhouten lambrisering met moulures */
  const wandTextuur = paneelwandTextuur();
  wandTextuur.repeat.set(20, 1);
  for (const kant of [-1, 1]) {
    const wand = new THREE.Mesh(
      new THREE.PlaneGeometry(lengte, PLAFOND_Y - VLOER_Y),
      new THREE.MeshBasicMaterial({ map: wandTextuur, fog: true })
    );
    wand.rotation.y = kant * (Math.PI / 2) * -1;
    wand.position.set(kant * HALF_BREED, (PLAFOND_Y + VLOER_Y) / 2, middenZ);
    zaal.add(wand);

    /* messing sierlijst op ooghoogte-overgang */
    const lijst = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.16, lengte),
      new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true })
    );
    lijst.position.set(kant * (HALF_BREED - 0.05), VLOER_Y + 5, middenZ);
    zaal.add(lijst);
  }

  /* glas-in-lood met golden hour, links */
  bouwRamen(zaal);

  /* boekenkasten achter glas, rechts */
  bouwKasten(zaal);

  /* cassetteplafond met messing accenten */
  bouwPlafond(zaal, lengte, middenZ);

  /* kroonluchters en tafellampen */
  bouwVerlichting(zaal);

  /* de poort naar De Oorsprong */
  bouwPoort(zaal);

  /* eindwand achter het Cellarius-blad */
  const eindwand = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_BREED * 2, PLAFOND_Y - VLOER_Y),
    new THREE.MeshBasicMaterial({ map: paneelwandTextuur(), fog: true })
  );
  eindwand.position.set(0, (PLAFOND_Y + VLOER_Y) / 2, ZAAL_EIND);
  zaal.add(eindwand);

  /* entreewand met de walnoten dubbeldeur */
  const deuren = bouwEntree(zaal);

  scene.add(zaal);
  return deuren;
}

function bouwPlafond(zaal, lengte, middenZ) {
  const plafond = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_BREED * 2, lengte),
    new THREE.MeshBasicMaterial({ color: '#241609', fog: true })
  );
  plafond.rotation.x = Math.PI / 2;
  plafond.position.set(0, PLAFOND_Y, middenZ);
  zaal.add(plafond);

  const balkMateriaal = new THREE.MeshBasicMaterial({ color: WALNOOT_DONKER, fog: true });
  const messing = new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true });

  /* dwarsbalken om de 12, met een messing biesje aan de onderzijde */
  for (let z = -6; z > ZAAL_EIND + 6; z -= 12) {
    const balk = new THREE.Mesh(new THREE.BoxGeometry(HALF_BREED * 2, 0.7, 0.7), balkMateriaal);
    balk.position.set(0, PLAFOND_Y - 0.35, z);
    zaal.add(balk);
    const bies = new THREE.Mesh(new THREE.BoxGeometry(HALF_BREED * 2, 0.05, 0.08), messing);
    bies.position.set(0, PLAFOND_Y - 0.72, z);
    zaal.add(bies);
  }
  /* langsbalken: cassettegrid */
  for (const x of [-9, 0, 9]) {
    const balk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, lengte), balkMateriaal);
    balk.position.set(x, PLAFOND_Y - 0.3, middenZ);
    zaal.add(balk);
  }
}

function bouwRamen(zaal) {
  const textuur = raamTextuur();
  const raamMateriaal = new THREE.MeshBasicMaterial({
    map: textuur,
    transparent: true,
    fog: false, /* daglicht laat zich niet dempen door zaalmist */
  });
  const poolTextuur = maakGloed(DAGLICHT).material.map;

  for (let z = -28; z > ZAAL_EIND + 20; z -= 40) {
    const raam = new THREE.Mesh(new THREE.PlaneGeometry(5, 10), raamMateriaal);
    raam.rotation.y = Math.PI / 2;
    raam.position.set(-HALF_BREED + 0.05, 1.5, z);
    zaal.add(raam);

    const schijnsel = maakGloed(DAGLICHT);
    schijnsel.material.opacity = 0.22;
    schijnsel.position.set(-HALF_BREED + 0.8, 1.5, z);
    schijnsel.scale.setScalar(16);
    zaal.add(schijnsel);

    const plas = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 13),
      new THREE.MeshBasicMaterial({
        map: poolTextuur,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    plas.rotation.x = -Math.PI / 2;
    plas.rotation.z = 0.5;
    plas.position.set(-HALF_BREED + 6.5, VLOER_Y + 0.05, z + 1.5);
    zaal.add(plas);
  }
}

function bouwKasten(zaal) {
  const boeken = boekenTextuur();
  const messing = new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true });
  const kastMateriaal = new THREE.MeshBasicMaterial({ color: WALNOOT_DONKER, fog: true });

  for (const z of [-50, -125, -205]) {
    const groep = new THREE.Group();

    /* romp */
    const romp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 4.6), kastMateriaal);
    groep.add(romp);

    /* boekenvak */
    const vak = new THREE.Mesh(
      new THREE.PlaneGeometry(4.1, 6.2),
      new THREE.MeshBasicMaterial({ map: boeken, fog: true })
    );
    vak.rotation.y = -Math.PI / 2;
    vak.position.x = -0.26;
    groep.add(vak);

    /* glasfront: koele glans over de banden */
    const glas = new THREE.Mesh(
      new THREE.PlaneGeometry(4.1, 6.2),
      new THREE.MeshBasicMaterial({
        color: '#fff6e0',
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
      })
    );
    glas.rotation.y = -Math.PI / 2;
    glas.position.x = -0.34;
    groep.add(glas);
    const glans = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 6.2),
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glans.rotation.y = -Math.PI / 2;
    glans.position.set(-0.35, 0, -1.1);
    groep.add(glans);

    /* messing roeden over het glas */
    for (const dz of [-1.05, 1.05]) {
      const roede = new THREE.Mesh(new THREE.BoxGeometry(0.04, 6.2, 0.06), messing);
      roede.position.set(-0.36, 0, dz);
      groep.add(roede);
    }
    const middenRoede = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 4.2), messing);
    middenRoede.position.set(-0.36, 0, 0);
    groep.add(middenRoede);

    /* kroonlijstje */
    const kroon = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 5.0), kastMateriaal);
    kroon.position.y = 3.65;
    groep.add(kroon);
    const kroonBies = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 5.02), messing);
    kroonBies.position.y = 3.5;
    groep.add(kroonBies);

    groep.position.set(HALF_BREED - 0.3, VLOER_Y + 3.6, z);
    zaal.add(groep);
  }
}

function bouwVerlichting(zaal) {
  /* kroonluchters in de as van de zaal */
  for (let z = -30; z > ZAAL_EIND + 20; z -= 50) {
    const luchter = new THREE.Group();
    const messing = new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true });

    const stang = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), messing);
    stang.position.y = 1.3;
    luchter.add(stang);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 8, 24), messing);
    ring.rotation.x = Math.PI / 2;
    luchter.add(ring);
    const ringKlein = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 20), messing);
    ringKlein.rotation.x = Math.PI / 2;
    ringKlein.position.y = 0.55;
    luchter.add(ringKlein);

    /* kaarsvlammetjes rond de ring + kristal eronder */
    for (let k = 0; k < 6; k++) {
      const hoekje = (k / 6) * Math.PI * 2;
      const vlam = maakGloed('#ffdf9e');
      vlam.material.opacity = 0.5;
      vlam.position.set(Math.cos(hoekje) * 0.95, 0.28, Math.sin(hoekje) * 0.95);
      vlam.scale.setScalar(0.85);
      luchter.add(vlam);
    }
    for (let k = 0; k < 10; k++) {
      const hoekje = (k / 10) * Math.PI * 2 + 0.3;
      const kristal = maakGloed('#ffffff');
      kristal.material.opacity = 0.35;
      kristal.position.set(Math.cos(hoekje) * 0.7, -0.35, Math.sin(hoekje) * 0.7);
      kristal.scale.setScalar(0.22);
      luchter.add(kristal);
    }
    const schijn = maakGloed(WARMLICHT);
    schijn.material.opacity = 0.3;
    schijn.scale.setScalar(11);
    schijn.position.y = -0.4;
    luchter.add(schijn);

    luchter.position.set(0, PLAFOND_Y - 2.4, z);
    zaal.add(luchter);
  }

  /* antieke tafellampen met zijden kap */
  const plekken = [
    { x: -HALF_BREED + 1.4, z: -78 },
    { x: HALF_BREED - 1.4, z: -138 },
    { x: -HALF_BREED + 1.4, z: -158 },
    { x: HALF_BREED - 1.4, z: -235 },
  ];
  const tafelMateriaal = new THREE.MeshBasicMaterial({ color: WALNOOT_DONKER, fog: true });
  for (const plek of plekken) {
    const groep = new THREE.Group();
    const tafel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.0), tafelMateriaal);
    groep.add(tafel);
    for (const [dx, dz] of [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]) {
      const poot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 1.15, 6), tafelMateriaal);
      poot.position.set(dx, -0.63, dz);
      groep.add(poot);
    }
    const voet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.11, 0.55, 8),
      new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true })
    );
    voet.position.y = 0.35;
    groep.add(voet);
    const kap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.46, 0.42, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: '#f6dfae', fog: true, side: THREE.DoubleSide })
    );
    kap.position.y = 0.8;
    groep.add(kap);
    const schijn = maakGloed('#ffdf9e');
    schijn.material.opacity = 0.4;
    schijn.scale.setScalar(4.5);
    schijn.position.y = 0.75;
    groep.add(schijn);

    groep.position.set(plek.x, VLOER_Y + 1.25, plek.z);
    zaal.add(groep);
  }
}

/** De houten poort waar 'De Oorsprong' in statige letters op prijkt. */
function bouwPoort(zaal) {
  const groep = new THREE.Group();
  const hout = new THREE.MeshBasicMaterial({
    map: houtTextuur(WALNOOT, WALNOOT_DONKER, 3),
    fog: true,
  });
  const messing = new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true });

  for (const kant of [-1, 1]) {
    const pijler = new THREE.Mesh(new THREE.BoxGeometry(1.0, 13, 1.0), hout);
    pijler.position.set(kant * 5.9, VLOER_Y + 6.5, 0);
    groep.add(pijler);
    const kapiteel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.3), hout);
    kapiteel.position.set(kant * 5.9, VLOER_Y + 12.9, 0);
    groep.add(kapiteel);
  }
  const latei = new THREE.Mesh(new THREE.BoxGeometry(13.2, 2.6, 1.1), hout);
  latei.position.set(0, VLOER_Y + 14.2, 0);
  groep.add(latei);
  const kroon = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.4, 1.3), hout);
  kroon.position.set(0, VLOER_Y + 15.6, 0);
  groep.add(kroon);
  const bies = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.07, 1.14), messing);
  bies.position.set(0, VLOER_Y + 13.05, 0);
  groep.add(bies);

  groep.position.set(0, 0, -38);
  groep.name = 'poort';
  zaal.add(groep);
}

/** Tekst op de poort — apart, zodra Spectral geladen is. */
function bouwPoortTekst(scene) {
  const poort = scene.getObjectByName('poort');
  if (!poort) return;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 96px "Spectral", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  /* gegraveerd: donkere kern met een fijne gouden oplichting eronder */
  ctx.fillStyle = 'rgba(20,10,4,0.9)';
  ctx.fillText('De Oorsprong', 512, 108);
  ctx.fillStyle = 'rgba(232,184,75,0.95)';
  ctx.fillText('De Oorsprong', 512, 112);

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.colorSpace = THREE.SRGBColorSpace;
  const tekst = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9 * (224 / 1024)),
    new THREE.MeshBasicMaterial({ map: textuur, transparent: true, fog: true })
  );
  tekst.position.set(0, VLOER_Y + 14.2, 0.58);
  poort.add(tekst);
}

function bouwEntree(zaal) {
  const wandMateriaal = new THREE.MeshBasicMaterial({
    map: houtTextuur(WALNOOT, WALNOOT_DONKER, 10),
    fog: true,
  });
  const OPENING_HALF = 6;
  const OPENING_HOOG = 6;

  const links = new THREE.Mesh(
    new THREE.BoxGeometry(HALF_BREED - OPENING_HALF, PLAFOND_Y - VLOER_Y, 0.8),
    wandMateriaal
  );
  links.position.set(
    -(OPENING_HALF + (HALF_BREED - OPENING_HALF) / 2),
    (PLAFOND_Y + VLOER_Y) / 2,
    ZAAL_BEGIN
  );
  zaal.add(links);

  const rechts = links.clone();
  rechts.position.x = OPENING_HALF + (HALF_BREED - OPENING_HALF) / 2;
  zaal.add(rechts);

  const boven = new THREE.Mesh(
    new THREE.BoxGeometry(OPENING_HALF * 2, PLAFOND_Y - OPENING_HOOG, 0.8),
    wandMateriaal
  );
  boven.position.set(0, (PLAFOND_Y + OPENING_HOOG) / 2, ZAAL_BEGIN);
  zaal.add(boven);

  const plaquette = maakPlaquette('DE REIS VAN DE HISTORICUS');
  plaquette.position.set(0, OPENING_HOOG + 1.4, ZAAL_BEGIN - 0.45);
  zaal.add(plaquette);

  const deurTextuur = houtTextuur('#3c2917', '#1d1207', 3);
  const deuren = {};
  for (const kant of [-1, 1]) {
    const scharnier = new THREE.Group();
    scharnier.position.set(kant * OPENING_HALF, 0, ZAAL_BEGIN - 0.1);

    const blad = new THREE.Group();
    const paneel = new THREE.Mesh(
      new THREE.BoxGeometry(OPENING_HALF, OPENING_HOOG - VLOER_Y, 0.35),
      new THREE.MeshBasicMaterial({ map: deurTextuur, fog: true })
    );
    paneel.position.set(-kant * (OPENING_HALF / 2), (OPENING_HOOG + VLOER_Y) / 2, 0);
    blad.add(paneel);

    for (const [vy, vh] of [
      [1.9, 6.4],
      [-4.4, 5.2],
    ]) {
      const vak = new THREE.Mesh(
        new THREE.BoxGeometry(OPENING_HALF - 1.6, vh, 0.1),
        new THREE.MeshBasicMaterial({ color: '#2a1b0d', fog: true })
      );
      vak.position.set(-kant * (OPENING_HALF / 2), vy, 0.2);
      blad.add(vak);
    }

    const knop = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 12),
      new THREE.MeshBasicMaterial({ color: GOUD, fog: true })
    );
    knop.position.set(-kant * (OPENING_HALF - 0.55), -1.3, 0.26);
    blad.add(knop);

    scharnier.add(blad);
    zaal.add(scharnier);
    deuren[kant === -1 ? 'links' : 'rechts'] = scharnier;
  }
  return deuren;
}

function maakPlaquette(tekst) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2a1b0d';
  ctx.fillRect(0, 0, 1024, 128);
  ctx.strokeStyle = '#e8b84b';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 1004, 108);
  ctx.font = '600 52px "Special Elite", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8b84b';
  ctx.fillText(tekst, 512, 70);
  const textuur = new THREE.CanvasTexture(canvas);
  textuur.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(7, 0.875),
    new THREE.MeshBasicMaterial({ map: textuur, fog: true })
  );
}

/* ------------------------------------------------------------------ */
/* Stof, schilderijen, lijsten, gloed, labels, salon                   */
/* ------------------------------------------------------------------ */

let stipTextuur = null;

function maakStipTextuur() {
  if (stipTextuur) return stipTextuur;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const verloop = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  verloop.addColorStop(0, 'rgba(255,255,255,1)');
  verloop.addColorStop(0.5, 'rgba(255,255,255,0.4)');
  verloop.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = verloop;
  ctx.fillRect(0, 0, 64, 64);
  stipTextuur = new THREE.CanvasTexture(canvas);
  return stipTextuur;
}

function maakStof(aantal, grootte, dekking) {
  const posities = new Float32Array(aantal * 3);
  for (let i = 0; i < aantal; i++) {
    posities[i * 3] = (Math.random() - 0.5) * (HALF_BREED * 2 - 3);
    posities[i * 3 + 1] = VLOER_Y + 1 + Math.random() * (PLAFOND_Y - VLOER_Y - 3);
    posities[i * 3 + 2] = ZAAL_BEGIN - Math.random() * (ZAAL_BEGIN - ZAAL_EIND);
  }
  const geometrie = new THREE.BufferGeometry();
  geometrie.setAttribute('position', new THREE.BufferAttribute(posities, 3));
  const materiaal = new THREE.PointsMaterial({
    color: new THREE.Color(WARMLICHT),
    size: grootte,
    sizeAttenuation: true,
    map: maakStipTextuur(),
    transparent: true,
    opacity: dekking,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometrie, materiaal);
}

let gedeeldMessing = null;

/** Zware gebeeldhouwde messing lijst: profiel-balken + hoekblokken. */
function maakLijst(breedte, hoogte, dikte) {
  if (!gedeeldMessing) {
    gedeeldMessing = new THREE.MeshBasicMaterial({ map: messingTextuur(), fog: true });
  }
  const groep = new THREE.Group();
  const d = dikte;
  const diepte = d * 0.8;

  const balk = (b, h, x, y) => {
    const deel = new THREE.Mesh(new THREE.BoxGeometry(b, h, diepte), gedeeldMessing);
    deel.position.set(x, y, 0.04);
    groep.add(deel);
  };
  balk(breedte + 2 * d, d, 0, hoogte / 2 + d / 2);
  balk(breedte + 2 * d, d, 0, -(hoogte / 2 + d / 2));
  balk(d, hoogte, -(breedte / 2 + d / 2), 0);
  balk(d, hoogte, breedte / 2 + d / 2, 0);

  /* hoekblokken, iets prouder — het 'gebeeldhouwde' accent */
  for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    const blok = new THREE.Mesh(
      new THREE.BoxGeometry(d * 1.7, d * 1.7, diepte * 1.5),
      gedeeldMessing
    );
    blok.position.set(sx * (breedte / 2 + d / 2), sy * (hoogte / 2 + d / 2), 0.06);
    groep.add(blok);
  }

  /* fijn binnenrandje */
  const binnen = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(breedte + 0.04, hoogte + 0.04)),
    new THREE.LineBasicMaterial({ color: '#f0d492', transparent: true, opacity: 0.5 })
  );
  binnen.position.z = 0.05;
  groep.add(binnen);

  return groep;
}

function maakSchilderij(portaal, texturen) {
  const groep = new THREE.Group();
  const breedte = portaal.breedte;
  const hoogte = breedte * portaal.verhouding;

  const textuur = texturen.load(portaal.src);
  textuur.colorSpace = THREE.SRGBColorSpace;
  const beeld = new THREE.Mesh(
    new THREE.PlaneGeometry(breedte, hoogte),
    new THREE.MeshBasicMaterial({ map: textuur, fog: true })
  );
  groep.add(beeld);
  groep.userData.beeld = beeld;

  /* walnoten achterpaneel */
  const rand = 0.5;
  const paneel = new THREE.Mesh(
    new THREE.BoxGeometry(breedte + rand, hoogte + rand, 0.16),
    new THREE.MeshBasicMaterial({
      map: houtTextuur('#33220f', '#191006', 4),
      fog: true,
    })
  );
  paneel.position.z = -0.1;
  groep.add(paneel);

  /* zware messing lijst */
  const dikte = Math.min(0.36, breedte * 0.03 + 0.14);
  groep.add(maakLijst(breedte + rand * 0.4, hoogte + rand * 0.4, dikte));

  /* picture-light: messing balkje met warme schijn van boven */
  const armatuur = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, breedte * 0.45, 8),
    new THREE.MeshBasicMaterial({ color: '#c99e3f', fog: true })
  );
  armatuur.rotation.z = Math.PI / 2;
  armatuur.position.set(0, hoogte / 2 + rand / 2 + 0.28, 0.25);
  groep.add(armatuur);

  const lamp = maakGloed(WARMLICHT);
  lamp.material.opacity = 0.3;
  lamp.position.set(0, hoogte / 2 + 0.4, 0.8);
  lamp.scale.set(breedte * 1.15, breedte * 0.8, 1);
  groep.add(lamp);

  groep.position.set(...portaal.positie);
  groep.userData.basisY = portaal.positie[1];
  return groep;
}

/* vaste haken aan de wanden: rechts vrij spel, links tussen de ramen */
const SALON_HAKEN = [
  { kant: 1, z: -35 },
  { kant: 1, z: -62 },
  { kant: 1, z: -75 },
  { kant: 1, z: -110 },
  { kant: -1, z: -88 },
  { kant: 1, z: -145 },
  { kant: -1, z: -168 },
  { kant: 1, z: -190 },
  { kant: 1, z: -225 },
  { kant: -1, z: -248 },
];

async function bouwSalon(scene, texturen) {
  let manifest;
  try {
    manifest = await (await fetch('/img/salon/manifest.json')).json();
  } catch {
    return; /* geen salon-manifest: kale wanden, geen ramp */
  }

  manifest.slice(0, SALON_HAKEN.length).forEach((stuk, i) => {
    const haak = SALON_HAKEN[i];
    const breedte = Math.min(
      stuk.verhouding > 1 ? 2.3 : 3.0,
      3.8 / stuk.verhouding
    );
    const hoogte = breedte * stuk.verhouding;

    const groep = new THREE.Group();
    const textuur = texturen.load(stuk.bestand);
    textuur.colorSpace = THREE.SRGBColorSpace;
    groep.add(
      new THREE.Mesh(
        new THREE.PlaneGeometry(breedte, hoogte),
        new THREE.MeshBasicMaterial({ map: textuur, fog: true })
      )
    );

    const paneel = new THREE.Mesh(
      new THREE.BoxGeometry(breedte + 0.2, hoogte + 0.2, 0.08),
      new THREE.MeshBasicMaterial({ color: '#33220f', fog: true })
    );
    paneel.position.z = -0.06;
    groep.add(paneel);

    groep.add(maakLijst(breedte + 0.06, hoogte + 0.06, 0.15));

    groep.position.set(haak.kant * (HALF_BREED - 0.22), 1.0, haak.z);
    groep.rotation.y = -haak.kant * (Math.PI / 2);
    scene.add(groep);
  });
}

function maakGloed(kleur = '#e8b84b') {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const verloop = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  const c = new THREE.Color(kleur);
  const rgb = `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`;
  verloop.addColorStop(0, `rgba(${rgb}, 0.55)`);
  verloop.addColorStop(0.4, `rgba(${rgb}, 0.18)`);
  verloop.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = verloop;
  ctx.fillRect(0, 0, 256, 256);

  const textuur = new THREE.CanvasTexture(canvas);
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: textuur,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
}

function hangLabel(groep, portaal) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  /* museumbordje: 'STATION N' als kleine kopregel, de titel eronder */
  const [kop, titel] = portaal.label.toUpperCase().split(' — ');

  /* korps verkleinen tot de regel gegarandeerd op het bordje past */
  const passend = (tekst, korps, spatie, maxBreedte) => {
    ctx.letterSpacing = `${spatie}px`;
    ctx.font = `600 ${korps}px "Special Elite"`;
    while (korps > 40 && ctx.measureText(tekst).width > maxBreedte) {
      korps -= 2;
      ctx.font = `600 ${korps}px "Special Elite"`;
    }
  };

  if (titel) {
    ctx.fillStyle = 'rgba(232,184,75,0.72)';
    passend(kop, 52, 10, 1900);
    ctx.fillText(kop, 1024, 74);
    ctx.fillStyle = '#e8b84b';
    passend(titel, 84, 6, 1900);
    ctx.fillText(titel, 1024, 196);
  } else {
    ctx.fillStyle = '#e8b84b';
    passend(kop, 84, 6, 1900);
    ctx.fillText(kop, 1024, 144);
  }

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.colorSpace = THREE.SRGBColorSpace;
  const hoogte = portaal.breedte * portaal.verhouding;
  const labelBreedte = Math.min(Math.max(portaal.breedte * 1.3, 8), 11);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(labelBreedte, labelBreedte * (288 / 2048)),
    new THREE.MeshBasicMaterial({
      map: textuur,
      transparent: true,
      opacity: 0.95,
      fog: true,
    })
  );
  label.position.y =
    portaal.id === 'cellarius' ? hoogte / 2 + 1.4 : -(hoogte / 2) - 1.15;
  groep.add(label);
}
