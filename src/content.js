/**
 * Alle redigeerbare content van de site, los van markup (contentplan §5).
 * Feiten zijn definitief (bron: CV juli 2026); formuleringen mogen worden aangescherpt.
 */

export const site = {
  titel: 'Ben van Ooijen — docent geschiedenis',
  naam: 'Ben van Ooijen',
  functie: 'Eerstegraads docent geschiedenis',
  plaats: 'Rotterdam',
  email: 'benvanooijen1984@gmail.com',
  cvPad: '/cv-ben-van-ooijen.pdf',
};

export const landing = {
  eyebrow: 'De reis van de historicus',
  vraag: 'Waar in de tijd ben je?',
  toelichting:
    'Eén beeld, één gok. Kies een jaartal op de tijdlijn — en de reis begint.',
  overslaan: 'Sla de reis over',
  /* Het raadbeeld: Hendrick Cornelisz. Vroom, terugkomst tweede expeditie
     naar Oost-Indië, Amsterdam, 19 juli 1599 (Rijksmuseum, publiek domein). */
  beeld: {
    src: '/img/landing-vroom-1599.webp',
    alt: 'Schilderij van Hendrick Cornelisz. Vroom uit 1599: vier zeilschepen van de tweede expeditie naar Oost-Indië keren onder vol tuig terug op het IJ voor Amsterdam, omringd door sloepen vol toeschouwers.',
    jaar: 1599,
    minJaar: 1400,
    maxJaar: 2026,
  },
  /* Fout raden bestaat niet — elke klik start de reis met een knipoog. */
  reactieRaak:
    'Raak! Dit is {jaar}: de tweede schipvaart naar Oost-Indië keert vol specerijen terug in Amsterdam. Drie jaar later bundelden deze kooplieden hun kapitaal in de VOC.',
  reactieBijna:
    'Bijna! Je gokte {gok}, maar je bent in {jaar}: de tweede schipvaart naar Oost-Indië keert vol specerijen terug in Amsterdam. Drie jaar later bundelden deze kooplieden hun kapitaal in de VOC.',
  reactieStaart: 'Reis mee.',
  startKnop: 'Begin de reis',
  overzichtLink: 'Liever meteen de feiten? Naar het overzicht',
};

/**
 * De zes stations. `body` en puzzels worden per station ingevuld tijdens de
 * bouw (taken 3 t/m 8); meta staat hier al zodat tijdlijn en dossier werken.
 */
export const stations = [
  {
    id: 'oudheid',
    nummer: 1,
    tijdvak: 'De Oudheid',
    titel: 'De Oorsprong',
    periode: '1996–2002',
    tijdlijnLabel: 'Oudheid',
    stempel: 'ἱστορία',
  },
  {
    id: 'ontdekkers',
    nummer: 2,
    tijdvak: 'De Tijd van Ontdekkers',
    titel: 'Amsterdam',
    periode: '2003–2010',
    /* geen exact jaartal: het label zou puzzel 2 (raad het jaar) verklappen */
    tijdlijnLabel: '17e eeuw',
    stempel: 'VOC',
  },
  {
    id: 'netwerk',
    nummer: 3,
    tijdvak: 'De Tijd van Telegraaf en Telefoon',
    titel: 'Het Netwerk',
    periode: '2010–2018',
    tijdlijnLabel: '±1900',
    stempel: '· — ·',
  },
  {
    id: 'master',
    nummer: 4,
    tijdvak: 'De Tijd van Televisie en Computer',
    titel: 'De Master',
    periode: '2019–2020',
    tijdlijnLabel: '1970',
    stempel: 'EPA',
  },
  {
    id: 'klas',
    nummer: 5,
    tijdvak: 'De Eenentwintigste Eeuw',
    titel: 'De Revolutie in de Klas',
    periode: '2019–heden',
    tijdlijnLabel: 'Nu',
    stempel: '★',
  },
  {
    id: 'toekomst',
    nummer: 6,
    tijdvak: 'De Toekomst',
    titel: 'Visie & Contact',
    periode: '',
    tijdlijnLabel: 'Morgen',
    stempel: '∞',
  },
];

export const dossier = {
  titel: 'Reisdossier',
  uitleg:
    'Elk station heeft een kleine puzzel. Oplossen levert een stempel op — zes stempels en het dossier klapt open.',
  leegLabel: 'nog geen stempels',
};
