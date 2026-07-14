/**
 * Mag dit apparaat vliegen? Alleen capabele desktops krijgen de 3D-vlucht;
 * telefoons, reduced-motion en apparaten zonder WebGL2 behouden de
 * klassieke verticale reis. Dit bestand is bewust three-vrij, zodat de
 * zware vlucht-chunk alleen laadt als het antwoord ja is.
 */
export function magVliegen() {
  const beweging = matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const fijnePointer = matchMedia('(pointer: fine)').matches;
  const breed = window.innerWidth >= 1024;
  if (!beweging || !fijnePointer || !breed) return false;

  try {
    const test = document.createElement('canvas');
    return Boolean(test.getContext('webgl2'));
  } catch {
    return false;
  }
}
