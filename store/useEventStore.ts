import { create } from "zustand";

export type IncidentSeverity = "critical" | "warning" | "resolved";

export type Incident = {
  id: string;
  title: string;
  zone: string;
  severity: IncidentSeverity;
  timestamp: number;
  x: number;
  y: number;
  description: string;
  metric: string;
};

type EventState = {
  incidents: Incident[];
  activeIncidentId: string | null;
  selectedIncidentId: string | null;
  setActiveIncident: (id: string | null) => void;
  selectIncident: (id: string | null) => void;
  syncIncidents: (incidents: Incident[]) => void;
};

export const useEventStore = create<EventState>((set) => ({
  incidents: [],
  activeIncidentId: null,
  selectedIncidentId: null,
  setActiveIncident: (id) => set({ activeIncidentId: id }),
  selectIncident: (id) =>
    set((state) => {
      if (id === null) {
        return { selectedIncidentId: null, activeIncidentId: null };
      }
      if (state.selectedIncidentId === id) {
        return { selectedIncidentId: null, activeIncidentId: null };
      }
      return { selectedIncidentId: id, activeIncidentId: id };
    }),
  syncIncidents: (incidents) =>
    set((state) => {
      const selectionStillValid =
        state.selectedIncidentId !== null &&
        incidents.some((i) => i.id === state.selectedIncidentId);
      return {
        incidents,
        ...(selectionStillValid
          ? {}
          : { selectedIncidentId: null, activeIncidentId: null }),
      };
    }),
}));
