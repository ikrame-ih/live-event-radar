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

  it("latest returns a trailing window", () => {
    const ring = new RingBuffer<number>(5);
    ring.pushMany([1, 2, 3, 4, 5, 6]);
    expect(ring.latest(2)).toEqual([5, 6]);
  });

  it("rejects invalid capacity", () => {
    expect(() => new RingBuffer(0)).toThrow(/capacity/i);
  });
});
