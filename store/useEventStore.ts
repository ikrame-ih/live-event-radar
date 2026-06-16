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
  selectIncident: (id) => set({ selectedIncidentId: id, activeIncidentId: id }),
  syncIncidents: (incidents) => set({ incidents }),
}));
