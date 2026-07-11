import {
  geefStempel,
  getUnlocks,
  heeftStempel,
  isOntgrendeld,
  ontgrendel,
} from '../state.js';

/**
 * Station 5 · De Revolutie in de Klas — het zwaartepunt (§3).
 * Geen aparte puzzel: demo 1 (bronnenoefening) en demo 2 (gameshow)
 * afronden geeft samen de stempel.
 */

/* ---------- demo 1: de bronnenoefening ---------- */

const BRONVRAGEN = [
  {
    dimensie: 'Motief',
    vraag: 'Waarom liet de Amerikaanse overheid deze affiche maken?',
    opties: [
      {
        tekst:
          'Om Europeanen te overtuigen dat samenwerking onder het Marshallplan welvaart brengt.',
        goed: true,
        feedback:
          'Ja. De affiche komt uit de ERP-postercampagne van 1950: Amerikaans geld, Europese kunstenaars (Spreekmeester was Nederlander), één boodschap — samen opbouwen, en het communisme de wind uit de zeilen nemen.',
      },
      {
        tekst:
          'Om Amerikaanse kiezers te laten zien waar hun belastinggeld naartoe ging.',
        goed: false,
        feedback:
          'Begrijpelijke gok, maar kijk naar taal en verspreiding: de campagne draaide in Europa, niet in de VS. Het publiek bepaalt mee wat het motief is.',
      },
      {
        tekst:
          'Om met een herkenbaar Hollands beeld het toerisme naar Europa te bevorderen.',
        goed: false,
        feedback:
          'De molen is beeldspraak: de wieken zijn Europese vlaggen die alleen sámen draaien. Wie propaganda letterlijk leest, mist het motief — een klassieke valkuil.',
      },
    ],
  },
  {
    dimensie: 'Betrouwbaarheid',
    vraag:
      'Een leerling schrijft: "Deze poster bewijst dat Europeanen blij waren met het Marshallplan." Wat is het beste commentaar?',
    opties: [
      {
        tekst:
          'Klopt — de poster toont Europese vlaggen die samen draaien, dus Europeanen steunden het plan.',
        goed: false,
        feedback:
          'De poster toont wat de maker wílde dat Europeanen voelden — geen meting van wat ze werkelijk vonden.',
      },
      {
        tekst:
          'Dat bewijst de poster niet: hij laat zien welk beeld de afzender wilde verspreiden, niet hoe het werd ontvangen.',
        goed: true,
        feedback:
          'Precies. Voor de ontvangst heb je ander materiaal nodig: opiniepeilingen, kranten, verkiezingsuitslagen. Afzender en doel eerst — dan pas conclusies.',
      },
      {
        tekst: 'De poster is onbetrouwbaar, want propaganda liegt altijd.',
        goed: false,
        feedback:
          'Te kort door de bocht: propaganda is juist zéér betrouwbaar — over de bedoelingen van de afzender.',
      },
    ],
  },
  {
    dimensie: 'Representativiteit',
    vraag:
      'Is deze ene affiche representatief voor hoe het Westen de Koude Oorlog visueel voerde?',
    opties: [
      {
        tekst: 'Ja — zo hoopvol zag vrijwel alle westerse propaganda eruit.',
        goed: false,
        feedback:
          'Eén bron kan nooit het hele beeld dragen. Er bestond ook hardere campagnetaal, vol dreiging en schuilkelders.',
      },
      {
        tekst:
          'Nee — hij toont één register (hoop, samenwerking) uit een breder repertoire dat ook op angst speelde.',
        goed: true,
        feedback:
          'Juist. Leg deze poster naast een civil defense-affiche vol schuilkelders: zelfde conflict, totaal andere toon. Representativiteit toets je door bronnen naast elkaar te leggen.',
      },
      {
        tekst: 'Nee — affiches speelden geen rol van betekenis in de Koude Oorlog.',
        goed: false,
        feedback:
          'Onderschat het beeldfront niet: beide blokken investeerden zwaar in visuele overtuiging, van posters tot filmjournaals.',
      },
    ],
  },
];

/* ---------- demo 2: de flitsronde ---------- */

const FLITSVRAGEN = [
  {
    vraag: '1961 — welke stad wordt in één nacht doormidden gebouwd?',
    opties: ['Wenen', 'Berlijn', 'Praag'],
    goed: 1,
  },
  {
    vraag: '1957 — hoe heet het eerste object dat de mensheid in een baan om de aarde brengt?',
    opties: ['Spoetnik', 'Apollo', 'Vostok'],
    goed: 0,
  },
  {
    vraag: '1962 — waar staan de Sovjet-raketten die de wereld dertien dagen de adem benemen?',
    opties: ['Turkije', 'Vietnam', 'Cuba'],
    goed: 2,
  },
];

const SECONDEN_PER_VRAAG = 15;

const SECTIE_KAART = `
  <p class="eyebrow">Ontgrendeld · Wat ik een sectie breng</p>
  <ol class="sectie-lijst">
    <li><strong>Samenwerken, voorop.</strong> Materiaal ontwikkel ik het liefst
    ín samenspraak: voortbouwen op wat er ligt, delen wat werkt, samen naar één
    doorlopende leerlijn.</li>
    <li><strong>Complete lessenseries voor de bovenbouw</strong> — van Koude
    Oorlog (3 havo TTO) tot HC-examentraining (6 vwo), inclusief toetsen.</li>
    <li><strong>TTO-ervaring op mavo, havo en vwo,</strong> inclusief
    examenklassen; Bricks, Feniks en Forum als basis, eigen materiaal als
    verdieping.</li>
    <li><strong>Digitale didactiek die het vak dient:</strong> escape rooms,
    gameshows, dashboards — middel, geen doel.</li>
    <li><strong>Bredere schoolbijdrage:</strong> mentor, internationale
    excursies klas 4, en een schaaktoernooi voor alle leerjaren.</li>
  </ol>
`;

export function initKlas() {
  const bronWortel = document.querySelector('[data-demo-bron-vragen]');
  const showWortel = document.querySelector('[data-demo-gameshow-speelveld]');
  const voortgang = document.querySelector('[data-klas-voortgang]');
  const unlockWortel = document.querySelector('[data-unlock-klas]');
  if (!bronWortel || !showWortel || !voortgang || !unlockWortel) return;

  initBronnenoefening(bronWortel);
  initGameshow(showWortel);
  renderVoortgang(voortgang, unlockWortel);
}

function demoKlaar(welke) {
  ontgrendel(welke);
  const unlocks = getUnlocks();
  if (unlocks['klas-demo1'] && unlocks['klas-demo2'] && !heeftStempel('klas')) {
    ontgrendel('klas');
    geefStempel('klas');
  }
  renderVoortgang(
    document.querySelector('[data-klas-voortgang]'),
    document.querySelector('[data-unlock-klas]'),
    true
  );
}

function renderVoortgang(voortgang, unlockWortel, vers = false) {
  const unlocks = getUnlocks();
  const klaar = ['klas-demo1', 'klas-demo2'].filter((k) => unlocks[k]).length;

  if (unlocks.klas) {
    voortgang.textContent = 'beide demo’s afgerond — stempel gezet ✓';
    unlockWortel.innerHTML = `<div class="dokument ${vers ? 'dokument--onthuld' : ''}">${SECTIE_KAART}</div>`;
    return;
  }
  voortgang.textContent =
    klaar === 0
      ? 'rond beide demo’s af voor de stempel van dit station'
      : `demo ${klaar} van 2 afgerond — nog één voor de stempel`;
  unlockWortel.innerHTML = `
    <p class="ontgrendeling__slot">
      <span aria-hidden="true">▢</span> vergrendeld — rond beide demo's af voor "wat ik een sectie breng"
    </p>
  `;
}

/* ---------- demo 1 ---------- */

function initBronnenoefening(wortel) {
  if (isOntgrendeld('klas-demo1')) {
    wortel.innerHTML = `
      <p class="puzzel__succes">Oefening afgerond: motief, betrouwbaarheid en representativiteit — de drie vragen die leerlingen bij mij aan élke bron leren stellen.</p>
      <p class="eyebrow">Demo 1 afgerond ✓</p>
    `;
    return;
  }

  let huidige = 0;
  let beantwoord = false;

  const render = () => {
    const v = BRONVRAGEN[huidige];
    beantwoord = false;
    wortel.innerHTML = `
      <p class="demo-bron__stap eyebrow">Vraag ${huidige + 1} van ${BRONVRAGEN.length} — ${v.dimensie}</p>
      <p class="puzzel__vraag">${v.vraag}</p>
      <ul class="opties" role="list">
        ${v.opties
          .map(
            (optie, i) => `
          <li>
            <button class="optie" type="button" data-optie="${i}" aria-expanded="false">
              <span class="optie__letter" aria-hidden="true">${'ABC'[i]}</span>
              <span class="optie__tekst">${optie.tekst}</span>
            </button>
            <p class="optie__uitleg" data-uitleg="${i}" hidden>${optie.feedback}</p>
          </li>
        `
          )
          .join('')}
      </ul>
      <p class="puzzel__melding" data-verder aria-live="polite"></p>
    `;
  };

  wortel.addEventListener('click', (e) => {
    const knop = e.target.closest('[data-optie]');
    if (knop) {
      const v = BRONVRAGEN[huidige];
      const i = Number(knop.dataset.optie);
      const optie = v.opties[i];
      wortel.querySelector(`[data-uitleg="${i}"]`).hidden = false;
      knop.setAttribute('aria-expanded', 'true');
      knop.classList.add(optie.goed ? 'optie--goed' : 'optie--fout');
      if (optie.goed && !beantwoord) {
        beantwoord = true;
        wortel
          .querySelectorAll('[data-optie]')
          .forEach((andere) => (andere.disabled = true));
        const verder = wortel.querySelector('[data-verder]');
        verder.innerHTML =
          huidige + 1 < BRONVRAGEN.length
            ? `<button class="knop knop--rood" type="button" data-volgende>Volgende vraag →</button>`
            : `<button class="knop knop--rood" type="button" data-afronden>Rond de oefening af</button>`;
      }
      return;
    }
    if (e.target.closest('[data-volgende]')) {
      huidige += 1;
      render();
    }
    if (e.target.closest('[data-afronden]')) {
      wortel.innerHTML = `
        <p class="puzzel__succes">Drie vragen, drie denkstappen: <strong>motief, betrouwbaarheid, representativiteit</strong>. Dit is hoe leerlingen bij mij bronnen leren lezen — met feedback op elk antwoord, ook het goede.</p>
        <p class="eyebrow">Demo 1 afgerond ✓</p>
      `;
      demoKlaar('klas-demo1');
    }
  });

  render();
}

/* ---------- demo 2 ---------- */

function initGameshow(wortel) {
  if (isOntgrendeld('klas-demo2')) {
    wortel.innerHTML = `
      <p class="puzzel__succes">Flitsronde gespeeld. Drie vragen, een timer en een scorebord doen meer voor de aandacht dan welke aansporing ook.</p>
      <p class="eyebrow">Demo 2 afgerond ✓</p>
    `;
    return;
  }

  let huidige = 0;
  let score = 0;
  let resterend = SECONDEN_PER_VRAAG;
  let klok = null;

  const startscherm = () => {
    wortel.innerHTML = `
      <button class="knop knop--rood" type="button" data-start>▶ Start de flitsronde</button>
    `;
  };

  const stopKlok = () => {
    clearInterval(klok);
    klok = null;
  };

  const toonVraag = () => {
    const v = FLITSVRAGEN[huidige];
    resterend = SECONDEN_PER_VRAAG;
    wortel.innerHTML = `
      <div class="flits__kop">
        <span class="eyebrow">Vraag ${huidige + 1} van ${FLITSVRAGEN.length}</span>
        <span class="flits__score">score <strong data-score>${score}</strong></span>
      </div>
      <div class="flits__tijdbalk" role="timer" aria-label="Resterende tijd">
        <div class="flits__tijd" data-tijd style="--deel: 1"></div>
      </div>
      <p class="puzzel__vraag flits__vraag">${v.vraag}</p>
      <div class="flits__opties">
        ${v.opties
          .map(
            (optie, i) =>
              `<button class="optie flits__optie" type="button" data-flits="${i}">
                <span class="optie__letter" aria-hidden="true">${'ABC'[i]}</span>
                <span class="optie__tekst">${optie}</span>
              </button>`
          )
          .join('')}
      </div>
      <p class="puzzel__melding" data-flits-melding aria-live="assertive"></p>
    `;

    const tijdbalk = wortel.querySelector('[data-tijd]');
    klok = setInterval(() => {
      resterend -= 0.1;
      tijdbalk.style.setProperty('--deel', Math.max(resterend / SECONDEN_PER_VRAAG, 0));
      if (resterend <= 0) {
        stopKlok();
        beoordeel(null);
      }
    }, 100);
  };

  const beoordeel = (gekozen) => {
    stopKlok();
    const v = FLITSVRAGEN[huidige];
    const melding = wortel.querySelector('[data-flits-melding]');
    const knoppen = wortel.querySelectorAll('[data-flits]');
    knoppen.forEach((k) => (k.disabled = true));
    knoppen[v.goed]?.classList.add('optie--goed');

    if (gekozen === v.goed) {
      const bonus = Math.round(resterend) * 10;
      score += 100 + bonus;
      wortel.querySelector('[data-score]').textContent = score;
      melding.textContent = `Goed! +100, en +${bonus} snelheidsbonus.`;
    } else if (gekozen === null) {
      melding.textContent = `Tijd om! Het was ${v.opties[v.goed]}.`;
    } else {
      knoppen[gekozen].classList.add('optie--fout');
      melding.textContent = `Helaas — het was ${v.opties[v.goed]}.`;
    }

    setTimeout(() => {
      huidige += 1;
      if (huidige < FLITSVRAGEN.length) {
        toonVraag();
      } else {
        einde();
      }
    }, 1600);
  };

  const einde = () => {
    const max = FLITSVRAGEN.length * (100 + SECONDEN_PER_VRAAG * 10);
    wortel.innerHTML = `
      <p class="puzzel__succes">
        <span class="puzzel__antwoord">Eindscore: ${score} van ${max}</span>
        Zo houd ik ze wakker: drie vragen, een timer en een scorebord doen meer
        voor de aandacht dan welke aansporing ook. In de les: teams, rondes en
        een finalevraag.
      </p>
      <p class="eyebrow">Demo 2 afgerond ✓</p>
    `;
    demoKlaar('klas-demo2');
  };

  wortel.addEventListener('click', (e) => {
    if (e.target.closest('[data-start]')) {
      huidige = 0;
      score = 0;
      toonVraag();
      return;
    }
    const knop = e.target.closest('[data-flits]');
    if (knop && klok) beoordeel(Number(knop.dataset.flits));
  });

  startscherm();
}
