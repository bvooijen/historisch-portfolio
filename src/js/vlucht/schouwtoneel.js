import * as THREE from 'three';
import { PORTALEN, bemonsterCamera, finaleVoortgang } from './reiskaart.js';

/**
 * Het schouwtoneel: een museumgalerij in Oxbridge/British Museum-sfeer.
 * Walnoten lambrisering, donkergroene wanden, een loper van diep groen,
 * stofdeeltjes in warm lamplicht. De reis begint voor een grote walnoten
 * dubbeldeur die vanzelf openzwaait; aan het einde van de zaal hangt het
 * heliocentrische Cellarius-blad, waar de blik landt op de áárde.
 */

const GOUD = new THREE.Color('#e8b84b');
const ACHTERGROND = '#120d08'; /* warm museumdonker */
const WALNOOT = '#432e1b';
const WALNOOT_DONKER = '#241609';
const GROEN = '#1d3b2f'; /* museumwand-groen */
const GROEN_DONKER = '#122619';
const WARMLICHT = '#ffd9a0';

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
  scene.fog = new THREE.Fog(new THREE.Color(ACHTERGROND), 26, 110);

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

  /* -- stof in het lamplicht -- */
  const stofLagen = [
    maakStof(500, 0.14, 0.3),
    maakStof(260, 0.3, 0.14),
  ];
  stofLagen.forEach((laag) => scene.add(laag));

  /* -- de schilderijen -- */
  const texturen = new THREE.TextureLoader();
  const portaalObjecten = new Map();
  for (const portaal of PORTALEN) {
    const groep = maakSchilderij(portaal, texturen);
    portaalObjecten.set(portaal.id, groep);
    scene.add(groep);
  }

  /* -- finale: warme gloed op de aarde in het Cellarius-blad -- */
  const cellarius = portaalObjecten.get('cellarius');
  const kaartHoogte =
    PORTALEN.at(-1).breedte * PORTALEN.at(-1).verhouding;
  const gloed = maakGloed(WARMLICHT);
  gloed.position.copy(cellarius.position);
  gloed.position.x += AARDE_OFFSET.x * PORTALEN.at(-1).breedte;
  gloed.position.y += AARDE_OFFSET.y * kaartHoogte;
  gloed.position.z += 0.5;
  gloed.scale.setScalar(9);
  scene.add(gloed);

  /* typewriter-labels pas tekenen als het font geladen is */
  if (document.fonts?.load) {
    document.fonts.load('600 42px "Special Elite"').then(() => {
      for (const portaal of PORTALEN) {
        if (!portaal.label) continue;
        hangLabel(portaalObjecten.get(portaal.id), portaal);
      }
    });
  }

  /* -- per-frame besturing -- */
  const startTijd = performance.now();
  const doelPos = new THREE.Vector3();
  const doelKijk = new THREE.Vector3();
  const gladPos = new THREE.Vector3(0, 0.3, 11);
  const gladKijk = new THREE.Vector3(0, 0.4, -16);
  const muis = { x: 0, y: 0 };

  window.addEventListener('pointermove', (e) => {
    muis.x = (e.clientX / window.innerWidth) * 2 - 1;
    muis.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let eersteFrame = true;

  function bijwerken(p, snelheid, dt) {
    const fov = bemonsterCamera(p, doelPos, doelKijk);

    /* bij herladen midden in de reis: direct op positie, niet aan komen glijden */
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
    scene.fog.far = 110 + finale * 200; /* de zaal licht op naar het einde */

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
    /* elke plank een eigen toon */
    ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.12})`;
    ctx.fillRect(x0, 0, plankBreedte, 512);
    /* nerf: wiebelende lengtestrepen */
    for (let n = 0; n < 22; n++) {
      ctx.strokeStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '120,80,40'},${
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
    /* plankvoeg */
    ctx.strokeStyle = donker;
    ctx.lineWidth = 2;
    ctx.strokeRect(x0 + 0.5, -2, plankBreedte - 1, 516);
  }

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.wrapS = textuur.wrapT = THREE.RepeatWrapping;
  textuur.colorSpace = THREE.SRGBColorSpace;
  return textuur;
}

function groenTextuur() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const verloop = ctx.createLinearGradient(0, 256, 0, 0);
  verloop.addColorStop(0, GROEN);
  verloop.addColorStop(1, GROEN_DONKER);
  ctx.fillStyle = verloop;
  ctx.fillRect(0, 0, 64, 256);
  const textuur = new THREE.CanvasTexture(canvas);
  textuur.wrapS = THREE.RepeatWrapping;
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

  /* vloer: brede walnoten planken */
  const vloerTextuur = houtTextuur(WALNOOT, WALNOOT_DONKER, 6);
  vloerTextuur.repeat.set(7, 60);
  const vloer = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_BREED * 2, lengte),
    new THREE.MeshBasicMaterial({ map: vloerTextuur, fog: true })
  );
  vloer.rotation.x = -Math.PI / 2;
  vloer.position.set(0, VLOER_Y, middenZ);
  zaal.add(vloer);

  /* de loper: diep groen met gouden bies, hij wijst de weg */
  const loper = new THREE.Mesh(
    new THREE.PlaneGeometry(6, lengte),
    new THREE.MeshBasicMaterial({ color: GROEN_DONKER, fog: true })
  );
  loper.rotation.x = -Math.PI / 2;
  loper.position.set(0, VLOER_Y + 0.02, middenZ);
  zaal.add(loper);
  for (const kant of [-1, 1]) {
    const bies = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, lengte),
      new THREE.MeshBasicMaterial({ color: GOUD, transparent: true, opacity: 0.5, fog: true })
    );
    bies.rotation.x = -Math.PI / 2;
    bies.position.set(kant * 3.2, VLOER_Y + 0.03, middenZ);
    zaal.add(bies);
  }

  /* wanden: walnoten lambrisering onder, museumgroen boven, gouden lijst */
  const lambriseringTextuur = houtTextuur();
  lambriseringTextuur.repeat.set(26, 1);
  const groeneWand = groenTextuur();
  groeneWand.repeat.set(26, 1);

  for (const kant of [-1, 1]) {
    const lambrisering = new THREE.Mesh(
      new THREE.PlaneGeometry(lengte, 5),
      new THREE.MeshBasicMaterial({ map: lambriseringTextuur, fog: true })
    );
    lambrisering.rotation.y = kant * (Math.PI / 2) * -1;
    lambrisering.position.set(kant * HALF_BREED, VLOER_Y + 2.5, middenZ);
    zaal.add(lambrisering);

    const wand = new THREE.Mesh(
      new THREE.PlaneGeometry(lengte, PLAFOND_Y - (VLOER_Y + 5)),
      new THREE.MeshBasicMaterial({ map: groeneWand, fog: true })
    );
    wand.rotation.y = kant * (Math.PI / 2) * -1;
    wand.position.set(
      kant * HALF_BREED,
      (PLAFOND_Y + VLOER_Y + 5) / 2,
      middenZ
    );
    zaal.add(wand);

    /* gouden sierlijst op de overgang */
    const lijst = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, lengte),
      new THREE.MeshBasicMaterial({ color: GOUD, transparent: true, opacity: 0.55, fog: true })
    );
    lijst.position.set(kant * (HALF_BREED - 0.06), VLOER_Y + 5, middenZ);
    zaal.add(lijst);

    /* warme wandlampjes, om de zoveel meter */
    for (let z = -12; z > ZAAL_EIND + 8; z -= 42) {
      const schijnsel = maakGloed(WARMLICHT);
      schijnsel.material.opacity = 0.12;
      schijnsel.position.set(kant * (HALF_BREED - 0.6), 5, z);
      schijnsel.scale.setScalar(10);
      zaal.add(schijnsel);
    }
  }

  /* plafond: donker met walnoten balken */
  const plafond = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_BREED * 2, lengte),
    new THREE.MeshBasicMaterial({ color: '#0d0906', fog: true })
  );
  plafond.rotation.x = Math.PI / 2;
  plafond.position.set(0, PLAFOND_Y, middenZ);
  zaal.add(plafond);

  const balkMateriaal = new THREE.MeshBasicMaterial({ color: WALNOOT_DONKER, fog: true });
  for (let z = -8; z > ZAAL_EIND + 8; z -= 24) {
    const balk = new THREE.Mesh(
      new THREE.BoxGeometry(HALF_BREED * 2, 0.9, 0.9),
      balkMateriaal
    );
    balk.position.set(0, PLAFOND_Y - 0.45, z);
    zaal.add(balk);
  }

  /* eindwand achter het Cellarius-blad */
  const eindwand = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_BREED * 2, PLAFOND_Y - VLOER_Y),
    new THREE.MeshBasicMaterial({ map: groenTextuur(), fog: true })
  );
  eindwand.position.set(0, (PLAFOND_Y + VLOER_Y) / 2, ZAAL_EIND);
  zaal.add(eindwand);

  /* entreewand met de walnoten dubbeldeur */
  const deuren = bouwEntree(zaal);

  scene.add(zaal);
  return deuren;
}

function bouwEntree(zaal) {
  const wandMateriaal = new THREE.MeshBasicMaterial({
    map: houtTextuur(WALNOOT, WALNOOT_DONKER, 10),
    fog: true,
  });
  const OPENING_HALF = 6;
  const OPENING_HOOG = 6; /* bovenkant opening op y = 6 */

  /* wandsegmenten links, rechts en boven de deuropening */
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

  /* gouden plaquette boven de deur */
  const plaquette = maakPlaquette('DE REIS VAN DE HISTORICUS');
  plaquette.position.set(0, OPENING_HOOG + 1.4, ZAAL_BEGIN - 0.45);
  zaal.add(plaquette);

  /* de dubbeldeur zelf: twee walnoten panelen aan scharniergroepen */
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

    /* verdiepte paneelvakken: twee per deurblad */
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

    /* gouden deurknop bij de middennaad */
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
/* Stof, schilderijen, gloed, labels                                   */
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

  /* walnoten achterpaneel als passe-partout */
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

  /* dubbele gouden lijst */
  for (const [extra, dekking] of [
    [rand, 0.9],
    [rand - 0.22, 0.5],
  ]) {
    const lijst = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(breedte + extra, hoogte + extra)),
      new THREE.LineBasicMaterial({ color: GOUD, transparent: true, opacity: dekking })
    );
    lijst.position.z = 0.02;
    groep.add(lijst);
  }

  /* picture-light: warme schijn van boven op het doek */
  const lamp = maakGloed(WARMLICHT);
  lamp.material.opacity = 0.3;
  lamp.position.set(0, hoogte / 2 + 0.4, 0.8);
  lamp.scale.set(breedte * 1.15, breedte * 0.8, 1);
  groep.add(lamp);

  groep.position.set(...portaal.positie);
  groep.userData.basisY = portaal.positie[1];
  return groep;
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
  canvas.width = 1024;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 42px "Special Elite"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8b84b';
  ctx.letterSpacing = '10px';
  ctx.fillText(portaal.label.toUpperCase(), 512, 52);

  const textuur = new THREE.CanvasTexture(canvas);
  textuur.colorSpace = THREE.SRGBColorSpace;
  const hoogte = portaal.breedte * portaal.verhouding;
  const labelBreedte = Math.min(portaal.breedte * 1.25, 12);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(labelBreedte, labelBreedte * (96 / 1024)),
    new THREE.MeshBasicMaterial({
      map: textuur,
      transparent: true,
      opacity: 0.95,
      fog: true,
    })
  );
  /* museumbordje onder het doek; bij het grote eindblad erboven */
  label.position.y =
    portaal.id === 'cellarius' ? hoogte / 2 + 1.1 : -(hoogte / 2) - 0.95;
  groep.add(label);
}
