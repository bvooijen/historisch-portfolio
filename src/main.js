/* fonts — self-hosted via Fontsource: geen verzoeken naar derden */
import '@fontsource/spectral/400.css';
import '@fontsource/spectral/400-italic.css';
import '@fontsource/spectral/600.css';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/700.css';
import '@fontsource/special-elite/400.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/reis.css';
import './styles/vlucht.css';

import { initLanding } from './js/landing.js';
import { initTijdlijn } from './js/tijdlijn.js';
import { initDossier } from './js/dossier.js';
import { initOudheid } from './js/stations/oudheid.js';
import { initOntdekkers } from './js/stations/ontdekkers.js';
import { initNetwerk } from './js/stations/netwerk.js';
import { initMaster } from './js/stations/master.js';
import { initKlas } from './js/stations/klas.js';
import { initToekomst } from './js/stations/toekomst.js';

/* De three.js-chunk laadt alleen op apparaten die mogen vliegen;
   modules die van de vluchtmodus moeten weten, vragen het synchroon
   aan detectie.js (geen volgorde-afhankelijkheid). */
import { magVliegen } from './js/vlucht/detectie.js';

if (magVliegen()) {
  /* class direct zetten voorkomt een flits van de klassieke layout
     terwijl de three.js-chunk nog laadt */
  document.body.classList.add('vlucht-actief');
  import('./js/vlucht/vlucht.js').then(({ initVlucht }) => {
    if (!initVlucht()) document.body.classList.remove('vlucht-actief');
  });
}

initLanding();
initTijdlijn();
initDossier();
initOudheid();
initOntdekkers();
initNetwerk();
initMaster();
initKlas();
initToekomst();
