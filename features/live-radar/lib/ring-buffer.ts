/**
 * Fixed-capacity circular buffer.
 *
 * Why not `[...events, next].slice(...)` on every append?
 * At the 10k cap that copies a lot for little gain. The ring keeps append /
 * drop-oldest O(1). `toArray()` is still O(n) when React needs a snapshot —
 * paid once per publish, not twice per event.
 */
export class RingBuffer<T> {
  private readonly slots: (T | undefined)[];
  private head = 0;
  private size = 0;

  constructor(readonly capacity: number) {
    if (capacity < 1) {
      throw new Error("RingBuffer capacity must be >= 1");
    }
    this.slots = new Array<T | undefined>(capacity);
  }

  get length(): number {
    return this.size;
  }

  push(item: T): void {
    const index = (this.head + this.size) % this.capacity;
    if (this.size < this.capacity) {
      this.slots[index] = item;
      this.size += 1;
      return;
    }
    // Cap reached: overwrite the oldest slot and advance the head.
    this.slots[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
  }

  pushMany(items: readonly T[]): void {
    for (const item of items) {
      this.push(item);
    }
  }

  clear(): void {
    this.head = 0;
    this.size = 0;
    this.slots.fill(undefined);
  }

  /**
   * Materialize chronological contents (oldest → newest).
   * Callers that need stable React deps should treat this as a new array each time.
   */
  toArray(): T[] {
    const out = new Array<T>(this.size);
    for (let i = 0; i < this.size; i++) {
      out[i] = this.slots[(this.head + i) % this.capacity] as T;
    }
    return out;
  }
}
