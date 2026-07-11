import { geefStempel, isOntgrendeld, ontgrendel } from '../state.js';

/**
 * Station 4 · De Master — mini-bronnenoefening in BLAV-stijl (§3).
 * Eén vraag over de Nixon-bron, drie opties, uitleg per optie.
 * Voorproefje op de volwaardige oefening in station 5.
 */

const VRAAG = 'Wat betekent de afzender voor de betrouwbaarheid van deze bron?';

const OPTIES = [
  {
    letter: 'A',
    tekst:
      'Nixon beschrijft de vervuiling van lucht, water en land — dit is dus betrouwbaar bewijs dat het Amerikaanse milieu er in 1970 slecht aan toe was.',
    goed: false,
    uitleg:
      'Kijk nog eens naar wie er spreekt. De vervuiling was reëel, maar dát weet je uit andere bronnen. Dit fragment bewijst vooral wat Nixon over de vervuiling wílde zeggen — en aan wie.',
  },
  {
    letter: 'B',
    tekst:
      'De afzender is een president die zijn eigen plan verkoopt: een uitstekende bron voor Nixons motieven en retoriek, maar geen neutraal bewijs over de toestand van het milieu.',
    goed: true,
    uitleg:
      'Precies. Betrouwbaarheid hangt af van je vraag. Voor "wat wilde Nixon bereiken?" is deze bron goud waard; voor "hoe vervuild was Amerika?" heb je metingen en ander materiaal nodig. Afzender, doel en publiek wegen altijd mee.',
  },
  {
    letter: 'C',
    tekst:
      'Een politicus met een agenda is per definitie onbetrouwbaar — voor historici is deze bron onbruikbaar.',
    goed: false,
    uitleg:
      'Te streng. Er bestaat geen onbruikbare bron, alleen een verkeerde vraag aan een bron. Juist die agenda maakt dit fragment waardevol: hij tóónt de politieke berekening.',
  },
];

const THESIS = `
  <p class="eyebrow">Ontgrendeld · De thesis in 300 woorden</p>
  <p>In 1970 richtte Richard Nixon — Republikein, geen aantoonbaar groen hart —
  de Environmental Protection Agency op, tot vandaag een van de machtigste
  milieuagentschappen ter wereld. Mijn thesis onderzocht die paradox.</p>
  <p>Het antwoord ligt niet in idealen, maar in politieke logica. Eind jaren
  zestig maakten zichtbare rampen — de olieramp bij Santa Barbara (1969), de
  brandende Cuyahoga-rivier — het milieu tot hoofdstroomthema; op de eerste
  Earth Day (april 1970) demonstreerden twintig miljoen Amerikanen. In de
  Senaat profileerde Edmund Muskie, Nixons waarschijnlijkste rivaal voor 1972,
  zich als milieukampioen. Nixon zag geen natuur; hij zag een flank die gedekt
  moest worden. Reorganization Plan No. 3 — formeel een bestuurlijke
  herschikking, geen wet — bundelde vijftien versnipperde diensten tot één
  agentschap. In december 1970 ging de EPA van start.</p>
  <p>De verrassing zit in wat er daarna gebeurde: het instituut ontgroeide zijn
  motief. De EPA kreeg tanden die haar oprichter nooit bedoeld had —
  luchtnormen, waternormen, handhaving — en overleefde elke president die er
  spijt van kreeg, Nixon incluis.</p>
  <p><strong>Wat ik eraan overhield als docent:</strong> oorzaak en intentie
  zijn niet hetzelfde. Instellingen kunnen duurzamer zijn dan de bedoelingen
  waaruit ze ontstonden. Wie leerlingen leert om naast "wie had er baat bij?"
  ook "wat bleef er staan?" te vragen, leert ze historisch redeneren.</p>
`;

export function initMaster() {
  const vraagWortel = document.querySelector('[data-master-vraag]');
  const unlockWortel = document.querySelector('[data-unlock-master]');
  if (!vraagWortel || !unlockWortel) return;

  if (isOntgrendeld('master')) {
    toonOpgelost(vraagWortel);
    toonThesis(unlockWortel);
    return;
  }

  unlockWortel.innerHTML = `
    <p class="ontgrendeling__slot">
      <span aria-hidden="true">▢</span> vergrendeld — beantwoord de bronvraag voor de thesis-samenvatting
    </p>
  `;

  vraagWortel.innerHTML = `
    <p class="puzzel__vraag">${VRAAG}</p>
    <ul class="opties" role="list">
      ${OPTIES.map(
        (optie, i) => `
        <li>
          <button class="optie" type="button" data-optie="${i}" aria-expanded="false">
            <span class="optie__letter" aria-hidden="true">${optie.letter}</span>
            <span class="optie__tekst">${optie.tekst}</span>
          </button>
          <p class="optie__uitleg" data-uitleg="${i}" hidden>${optie.uitleg}</p>
        </li>
      `
      ).join('')}
    </ul>
  `;

  vraagWortel.addEventListener('click', (e) => {
    const knop = e.target.closest('[data-optie]');
    if (!knop) return;
    const i = Number(knop.dataset.optie);
    const optie = OPTIES[i];
    const uitleg = vraagWortel.querySelector(`[data-uitleg="${i}"]`);

    uitleg.hidden = false;
    knop.setAttribute('aria-expanded', 'true');
    knop.classList.add(optie.goed ? 'optie--goed' : 'optie--fout');

    if (!optie.goed) return;

    /* goed antwoord: andere opties bevriezen, stempel en ontgrendeling */
    vraagWortel
      .querySelectorAll('[data-optie]')
      .forEach((andere) => (andere.disabled = true));
    ontgrendel('master');
    geefStempel('master');
    const succes = document.createElement('p');
    succes.className = 'eyebrow';
    succes.textContent = 'Stempel gezet ✓';
    vraagWortel.append(succes);
    toonThesis(unlockWortel, true);
  });
}

function toonOpgelost(wortel) {
  const goede = OPTIES.find((optie) => optie.goed);
  wortel.innerHTML = `
    <p class="puzzel__vraag">${VRAAG}</p>
    <p class="puzzel__succes"><strong>${goede.letter}.</strong> ${goede.tekst}</p>
    <p class="puzzel__melding">${goede.uitleg}</p>
    <p class="eyebrow">Stempel gezet ✓</p>
  `;
}

function toonThesis(wortel, vers = false) {
  wortel.innerHTML = `<div class="dokument ${vers ? 'dokument--onthuld' : ''}">${THESIS}</div>`;
}
