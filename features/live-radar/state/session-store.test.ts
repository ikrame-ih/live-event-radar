import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStore } from "./session-store";

describe("useSessionStore", () => {
  beforeEach(() => {
    useSessionStore.setState({
      startedAt: 1_000,
      endedAt: null,
      selectedZone: null,
    });
  });

  it("ends and freezes the session clock", () => {
    useSessionStore.getState().endSession(2_000);
    expect(useSessionStore.getState().endedAt).toBe(2_000);
  });

  it("resumes a frozen session", () => {
    useSessionStore.getState().endSession(2_000);
    useSessionStore.getState().resumeSession();
    expect(useSessionStore.getState().endedAt).toBeNull();
  });

  it("starts a new session window", () => {
    useSessionStore.getState().endSession(2_000);
    useSessionStore.getState().selectZone("South Gate");
    useSessionStore.getState().newSession(5_000);
    const state = useSessionStore.getState();
    expect(state.startedAt).toBe(5_000);
    expect(state.endedAt).toBeNull();
    expect(state.selectedZone).toBeNull();
  });

  it("toggles zone selection", () => {
    useSessionStore.getState().selectZone("South Gate");
    expect(useSessionStore.getState().selectedZone).toBe("South Gate");
    useSessionStore.getState().selectZone("South Gate");
    expect(useSessionStore.getState().selectedZone).toBeNull();
  });
});
