/**
 * Deterministic pseudo-random helpers.
 *
 * Decorative elements (balloons, stars, confetti) need scattered positions,
 * but `Math.random()` produces different values on the server and the client
 * which breaks hydration. A seeded generator keeps both renders identical.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function range(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}
