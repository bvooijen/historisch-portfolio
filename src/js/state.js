/**
 * Voortgang in localStorage (contentplan §5):
 *   reis.stempels — array van station-ids
 *   reis.unlocks  — object { stationId: true }
 * Geen backend, geen cookies, geen analytics.
 */

const STEMPELS = 'reis.stempels';
const UNLOCKS = 'reis.unlocks';

function lees(sleutel, terugval) {
  try {
    const ruw = localStorage.getItem(sleutel);
    return ruw ? JSON.parse(ruw) : terugval;
  } catch {
    return terugval;
  }
}

function schrijf(sleutel, waarde) {
  try {
    localStorage.setItem(sleutel, JSON.stringify(waarde));
  } catch {
    /* privémodus zonder opslag: de reis werkt, alleen zonder geheugen */
  }
}

export function getStempels() {
  const waarde = lees(STEMPELS, []);
  return Array.isArray(waarde) ? waarde : [];
}

export function heeftStempel(stationId) {
  return getStempels().includes(stationId);
}

export function geefStempel(stationId) {
  const stempels = getStempels();
  if (stempels.includes(stationId)) return stempels;
  stempels.push(stationId);
  schrijf(STEMPELS, stempels);
  document.dispatchEvent(
    new CustomEvent('reis:stempel', { detail: { stationId, stempels } })
  );
  return stempels;
}

export function getUnlocks() {
  const waarde = lees(UNLOCKS, {});
  return waarde && typeof waarde === 'object' ? waarde : {};
}

export function isOntgrendeld(stationId) {
  return Boolean(getUnlocks()[stationId]);
}

export function ontgrendel(stationId) {
  const unlocks = getUnlocks();
  if (unlocks[stationId]) return unlocks;
  unlocks[stationId] = true;
  schrijf(UNLOCKS, unlocks);
  document.dispatchEvent(
    new CustomEvent('reis:unlock', { detail: { stationId, unlocks } })
  );
  return unlocks;
}
