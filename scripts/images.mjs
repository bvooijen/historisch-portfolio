/**
 * Beeldpipeline (contentplan §4):
 *  - downloadt publiek-domein-beelden (origineel naar assets/sources/, niet in git)
 *  - optimaliseert: max 1600 px breed, WebP
 *  - past de uniforme duotoon-behandeling toe: schaduwen naar inkt-marine,
 *    hooglichten naar perkament, zodat zes eeuwen beeld één geheel vormen
 *  - elke bron hieronder hoort 1-op-1 bij een regel in /colofon
 *
 * Draaien: npm run images
 */
import { mkdir, access, copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const wortel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BRONMAP = resolve(wortel, 'assets/sources');
const DOELMAP = resolve(wortel, 'public/img');

const UA =
  'benvanooijen-portfolio/1.0 (benvanooijen1984@gmail.com; eenmalige download publiek-domein-beelden)';

/* duotoon-eindpunten */
const SCHADUW = '#141830'; /* inkt met een vleug marine */
const HOOGLICHT = '#e9dfc8'; /* perkament, iets gedempt */

const BEELDEN = [
  {
    id: 'landing-vroom-1599',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/De_terugkomst_in_Amsterdam_van_de_tweede_expeditie_naar_Oost-Indi%C3%AB%2C_Hendrik_Cornelisz_Vroom%2C_1599%2C_Rijksmuseum_SK-A-2858.jpg',
    duotoon: true,
    maxBreedte: 1600,
    extraBreedtes: [800, 1200], /* srcset-varianten voor mobiel (LCP) */
    bron: 'Hendrick Cornelisz. Vroom, "De terugkomst in Amsterdam van de tweede expeditie naar Oost-Indië, 19 juli 1599" (1599). Rijksmuseum, SK-A-2858 — publiek domein.',
  },
  {
    id: 'station-oudheid-amfora',
    url: 'https://images.metmuseum.org/CRDImages/gr/original/DP-16774-001.jpg',
    duotoon: true,
    maxBreedte: 1200,
    bron: 'Berlin Painter, terracotta amfora met zanger en kithara (ca. 490 v.Chr.). The Metropolitan Museum of Art, 56.171.38, Fletcher Fund 1956 — Open Access (CC0).',
  },
  {
    id: 'station-ontdekkers-castello',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Stad_Amsterdam_in_Nieuw_Nederland_%28City_Amsterdam_in_New_Netherland%29_Castello_Plan_1660.jpg',
    duotoon: true,
    maxBreedte: 1600,
    bron: 'Castello Plan: "Afbeeldinge van de Stadt Amsterdam in Nieuw Neederlandt" (Nieuw-Amsterdam, 1660; zeventiende-eeuwse kopie, Villa Castello) — publiek domein, via Wikimedia Commons.',
  },
  {
    id: 'station-netwerk-telegraaf',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Barclay_telegraph_instruments._Showing_instruments_on_stand_with_women_operators._One_handling_the_receiving_tape_LCCN2013647215.jpg',
    duotoon: true,
    maxBreedte: 1536,
    bron: '"Barclay telegraph instruments, with women operators" (1908). Library of Congress, LCCN 2013647215 — publiek domein.',
  },
  {
    id: 'station-master-smog',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/THE_GEORGE_WASHINGTON_BRIDGE_IN_HEAVY_SMOG._VIEW_TOWARD_THE_NEW_JERSEY_SIDE_OF_THE_HUDSON_RIVER_-_NARA_-_548335.jpg',
    duotoon: true,
    maxBreedte: 1600,
    bron: 'Chester Higgins, "The George Washington Bridge in heavy smog" (1973), Documerica-fotoproject van de EPA. US National Archives, 548335 — publiek domein (US government work).',
  },
  {
    id: 'station-toekomst-cellarius',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Cellarius_Harmonia_Macrocosmica_-_Planisphaerium_Copernicanum.jpg',
    duotoon: true,
    maxBreedte: 1600,
    bron: 'Andreas Cellarius, "Planisphaerium Copernicanum", uit Harmonia Macrocosmica (1660) — publiek domein, via Wikimedia Commons.',
  },
  {
    /* bron in demo 1 — géén duotoon: dit is lesmateriaal, de kleuren dragen betekenis */
    id: 'station-klas-marshallposter',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Marshall_Plan_poster.JPG',
    duotoon: false,
    maxBreedte: 714,
    bron: 'E. Spreekmeester, "Whatever the weather, we only reach welfare together" (1950), affiche voor de Marshallplan-postercampagne van de ECA. US National Archives (RG 286) — publiek domein (US government work), via Wikimedia Commons.',
  },
];

/**
 * Salon-wanden: klein publiek-domein-werk per tijdvak, als decor in gouden
 * lijsten tussen de stations. Uniform duotoon, max 800 px. Het manifest
 * (public/img/salon/manifest.json) vertelt de 3D-zaal wat er hangt.
 */
const SALON = [
  {
    id: 'salon-exekias',
    url: 'https://images.metmuseum.org/CRDImages/gr/original/DP218568.jpg',
    bron: 'Exekias, terracotta hals-amfora met deksel (ca. 540 v.Chr.). The Met, 17.230.14a,b — Open Access (CC0).',
  },
  {
    id: 'salon-panathenaeen',
    url: 'https://images.metmuseum.org/CRDImages/gr/original/DP245711.jpg',
    bron: 'Euphiletos Painter, Panathenaeïsche prijsamfora (ca. 530 v.Chr.). The Met, 14.130.12 — Open Access (CC0).',
  },
  {
    id: 'salon-eertvelt',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Andries_van_Eertvelt_-_The_Return_to_Amsterdam_of_the_Second_Expedition_to_the_East_Indies_on_19th_July_1599.jpg',
    bron: 'Andries van Eertvelt, "The Return to Amsterdam of the Second Expedition to the East Indies" (ca. 1610–1620) — publiek domein, via Wikimedia Commons.',
  },
  {
    id: 'salon-castello-redraft',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Redraft_of_the_Castello_Plan_New_Amsterdam_in_1660_by_John_Wolcott_Adams.jpg',
    bron: 'John Wolcott Adams & I.N. Phelps Stokes, "Redraft of the Castello Plan, New Amsterdam in 1660" (1916) — publiek domein, via Wikimedia Commons.',
  },
  {
    id: 'salon-barclay-stempel',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Barclay_telegraph_instrument._Stamping_machine_with_woman_operator_LCCN2013647214.jpg',
    bron: '"Barclay telegraph instrument, stamping machine with woman operator" (1908). Library of Congress, LCCN 2013647214 — publiek domein.',
  },
  {
    id: 'salon-telefoniste',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/The_First_Chinese_telephone_operator_in_Chinatown%2C_San_Francisco_LCCN92504608.jpg',
    bron: '"The first Chinese telephone operator in Chinatown, San Francisco" (ca. 1901). Library of Congress, LCCN 92504608 — publiek domein.',
  },
  {
    id: 'salon-manhattan-smog',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/SKYSCRAPERS_OF_MANHATTAN_VEILED_IN_SMOG_-_NARA_-_548360.jpg',
    bron: 'Chester Higgins, "Skyscrapers of Manhattan veiled in smog" (1973), Documerica/EPA. US National Archives, 548360 — publiek domein.',
  },
  {
    id: 'salon-staten-island',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/STATEN_ISLAND_FERRY_WITH_SMOG-OBSCURED_SKYLINE_OF_LOWER_MANHATTAN_IN_BACKGROUND._ON_THE_RIGHT_ARE_THE_TWIN_TOWERS_OF..._-_NARA_-_549900.jpg',
    bron: 'Wil Blanche, "Staten Island Ferry with smog-obscured skyline of Lower Manhattan" (1973), Documerica/EPA. US National Archives, 549900 — publiek domein.',
  },
  {
    id: 'salon-ptolemaeus',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Cellarius_Harmonia_Macrocosmica_-_Planisphaerium_Ptolemaicum.jpg',
    bron: 'Andreas Cellarius, "Planisphaerium Ptolemaicum", uit Harmonia Macrocosmica (1660) — publiek domein, via Wikimedia Commons.',
  },
  {
    id: 'salon-brahe',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Cellarius_Harmonia_Macrocosmica_-_Planisphaerium_Braheum.jpg',
    bron: 'Andreas Cellarius, "Planisphaerium Braheum", uit Harmonia Macrocosmica (1660) — publiek domein, via Wikimedia Commons.',
  },
];

/* Eigen screenshots (assets/): resize + WebP, geen duotoon, geen download */
const SCHERMEN = [
  { id: 'scherm-escaperoom', lokaal: 'Schermafbeelding 2026-07-09 210431.png' },
  { id: 'scherm-revealtabel', lokaal: 'Schermafbeelding 2026-05-28 115104.png' },
  { id: 'scherm-coldcase', lokaal: 'Schermafbeelding 2026-07-09 212020.png' },
];

async function bestaat(pad) {
  try {
    await access(pad);
    return true;
  } catch {
    return false;
  }
}

async function download(url, doel) {
  if (await bestaat(doel)) return;
  console.log(`  ↓ downloaden: ${url}`);
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Download mislukt (${res.status}): ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await sharp(buffer).toFile(doel); /* valideert meteen dat het beeld leesbaar is */
}

/**
 * Duotoon: grijswaarden → screen met schaduwkleur (zwart → inkt-marine)
 * → multiply met hooglichtkleur (wit → perkament). Multiply als laatste
 * houdt de hooglichten warm.
 */
async function duotoon(invoer) {
  const grijs = await sharp(invoer).grayscale().normalise().toBuffer();
  const { width, height } = await sharp(grijs).metadata();
  const vlak = (kleur) => ({
    input: { create: { width, height, channels: 3, background: kleur } },
  });
  return sharp(grijs)
    .composite([
      { ...vlak(SCHADUW), blend: 'screen' },
      { ...vlak(HOOGLICHT), blend: 'multiply' },
    ])
    .toBuffer();
}

async function verwerk(beeld) {
  console.log(`• ${beeld.id}`);
  const origineel = resolve(BRONMAP, `${beeld.id}-origineel.png`);
  await download(beeld.url, origineel);

  let buffer = await sharp(origineel)
    .resize({ width: beeld.maxBreedte, withoutEnlargement: true })
    .toBuffer();
  if (beeld.duotoon) buffer = await duotoon(buffer);

  const doel = resolve(DOELMAP, `${beeld.id}.webp`);
  await sharp(buffer).webp({ quality: 78 }).toFile(doel);
  console.log(`  ✓ ${doel}`);

  for (const breedte of beeld.extraBreedtes ?? []) {
    const variant = resolve(DOELMAP, `${beeld.id}-${breedte}.webp`);
    await sharp(buffer)
      .resize({ width: breedte })
      .webp({ quality: 78 })
      .toFile(variant);
    console.log(`  ✓ ${variant}`);
  }
}

async function avatar() {
  /* profielfoto is 200×200 — alleen als kleine avatar gebruiken (§4) */
  const doel = resolve(DOELMAP, 'avatar-ben.jpg');
  await sharp(resolve(wortel, 'assets/ben.foto.jpg'))
    .resize(144, 144, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toFile(doel);
  console.log(`  ✓ ${doel}`);
}

async function cv() {
  const doel = resolve(wortel, 'public/cv-ben-van-ooijen.pdf');
  if (await bestaat(doel)) return;
  await copyFile(
    resolve(wortel, 'assets/Ben van Ooijen - curriculum vitae.pdf'),
    doel
  );
  console.log(`  ✓ ${doel}`);
}

async function ogBeeld() {
  /* social share-beeld: 1200×630-uitsnede van het landingsbeeld */
  const doel = resolve(DOELMAP, 'og-ben-van-ooijen.jpg');
  const bron = resolve(BRONMAP, 'landing-vroom-1599-origineel.png');
  let buffer = await sharp(bron)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .toBuffer();
  buffer = await duotoon(buffer);
  await sharp(buffer).jpeg({ quality: 82 }).toFile(doel);
  console.log(`  ✓ ${doel}`);
}

async function salon() {
  const map = resolve(DOELMAP, 'salon');
  await mkdir(map, { recursive: true });
  const manifest = [];

  for (const stuk of SALON) {
    const origineel = resolve(BRONMAP, `${stuk.id}-origineel.png`);
    await download(stuk.url, origineel);

    let buffer = await sharp(origineel)
      .resize({ width: 800, withoutEnlargement: true })
      .toBuffer();
    buffer = await duotoon(buffer);
    const doel = resolve(map, `${stuk.id}.webp`);
    await sharp(buffer).webp({ quality: 74 }).toFile(doel);

    const { width, height } = await sharp(doel).metadata();
    manifest.push({
      bestand: `/img/salon/${stuk.id}.webp`,
      verhouding: +(height / width).toFixed(4),
      bron: stuk.bron,
    });
    console.log(`  ✓ salon: ${stuk.id}`);
  }

  await writeFile(
    resolve(map, 'manifest.json'),
    JSON.stringify(manifest, null, 1)
  );
  console.log(`  ✓ salon/manifest.json (${manifest.length} stukken)`);
}

async function schermen() {
  for (const scherm of SCHERMEN) {
    const doel = resolve(DOELMAP, `${scherm.id}.webp`);
    await sharp(resolve(wortel, 'assets', scherm.lokaal))
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(doel);
    console.log(`  ✓ ${doel}`);
  }
}

await mkdir(BRONMAP, { recursive: true });
await mkdir(DOELMAP, { recursive: true });
for (const beeld of BEELDEN) await verwerk(beeld);
await avatar();
await cv();
await schermen();
await ogBeeld();
await salon();
console.log('Klaar.');
