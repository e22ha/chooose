export function shuffle(items, rng = Math.random) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class Deck {
  constructor(pool, rng = Math.random) {
    if (pool.length < 3) {
      throw new Error('Deck requires at least 3 items');
    }
    this.pool = pool.slice();
    this.rng = rng;
    this.order = shuffle(this.pool, this.rng);
    this.cursor = 0;
  }

  next() {
    if (this.order.length - this.cursor < 3) {
      this.order = shuffle(this.pool, this.rng);
      this.cursor = 0;
    }
    const triple = this.order.slice(this.cursor, this.cursor + 3);
    this.cursor += 3;
    return triple;
  }
}
