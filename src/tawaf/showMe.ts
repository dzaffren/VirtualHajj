// Show me how plays istilam on the pilgrim (D49): the right hand rises, holds, and falls.

// A CSS cubic-bezier easing, solved for the time by halving.
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, u: number) =>
    3 * a * u * (1 - u) ** 2 + 3 * b * u ** 2 * (1 - u) + u ** 3;
  return (x: number) => {
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

// The motion tokens: ease-settle, ease-leave and dur-step.
const settle = bezier(0.22, 1, 0.36, 1);
const leave = bezier(0.55, 0, 1, 0.45);
const rise = 0.48;
const hold = 1;
const reducedHold = 1.5;

export function showMeLength(reduced: boolean) {
  return reduced ? reducedHold : rise + hold + rise;
}

// The raise, 0 to 1, t seconds in. With reduced motion, the hand cuts to raised and back.
export function raiseAt(t: number, reduced: boolean) {
  if (reduced) return t < reducedHold ? 1 : 0;
  if (t < rise) return settle(t / rise);
  if (t < rise + hold) return 1;
  return 1 - leave(Math.min(1, (t - rise - hold) / rise));
}
