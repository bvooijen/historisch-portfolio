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

import { initLanding } from './js/landing.js';
import { initTijdlijn } from './js/tijdlijn.js';
import { initDossier } from './js/dossier.js';
import { initOudheid } from './js/stations/oudheid.js';
import { initOntdekkers } from './js/stations/ontdekkers.js';
import { initNetwerk } from './js/stations/netwerk.js';
import { initMaster } from './js/stations/master.js';
import { initKlas } from './js/stations/klas.js';
import { initToekomst } from './js/stations/toekomst.js';

initLanding();
initTijdlijn();
initDossier();
initOudheid();
initOntdekkers();
initNetwerk();
initMaster();
initKlas();
initToekomst();
