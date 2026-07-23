import { create } from "zustand";

type SessionState = {
  startedAt: number;
  endedAt: number | null;
  selectedZone: string | null;
  endSession: (at?: number) => void;
  resumeSession: () => void;
  newSession: (at?: number) => void;
  selectZone: (zone: string | null) => void;
};

function nextZone(
  state: SessionState,
  zone: string | null
): Pick<SessionState, "selectedZone"> {
  if (zone === null || state.selectedZone === zone) {
    return { selectedZone: null };
  }
  return { selectedZone: zone };
}

export const useSessionStore = create<SessionState>((set) => ({
  startedAt: Date.now(),
  endedAt: null,
  selectedZone: null,
  endSession: (at = Date.now()) => set({ endedAt: at }),
  resumeSession: () => set({ endedAt: null }),
  newSession: (at = Date.now()) =>
    set({ startedAt: at, endedAt: null, selectedZone: null }),
  selectZone: (zone) => set((state) => nextZone(state, zone)),
}));
