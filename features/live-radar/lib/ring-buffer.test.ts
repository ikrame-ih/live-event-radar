import { describe, expect, it } from "vitest";
import { RingBuffer } from "./ring-buffer";

describe("RingBuffer", () => {
  it("appends in order before capacity", () => {
    const ring = new RingBuffer<number>(3);
    ring.push(1);
    ring.push(2);
    expect(ring.toArray()).toEqual([1, 2]);
    expect(ring.length).toBe(2);
  });

  it("overwrites oldest when full (FIFO)", () => {
    const ring = new RingBuffer<number>(3);
    ring.pushMany([1, 2, 3, 4, 5]);
    expect(ring.toArray()).toEqual([3, 4, 5]);
    expect(ring.length).toBe(3);
  });

  it("clear empties the buffer", () => {
    const ring = new RingBuffer<number>(3);
    ring.pushMany([1, 2, 3]);
    ring.clear();
    expect(ring.toArray()).toEqual([]);
    expect(ring.length).toBe(0);
  });

  it("rejects invalid capacity", () => {
    expect(() => new RingBuffer(0)).toThrow(/capacity/i);
  });
});
