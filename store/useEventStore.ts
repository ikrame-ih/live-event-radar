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

function nextSelection(
  state: EventState,
  id: string | null
): Pick<EventState, "selectedIncidentId" | "activeIncidentId"> {
  if (id === null || state.selectedIncidentId === id) {
    return { selectedIncidentId: null, activeIncidentId: null };
  }
  return { selectedIncidentId: id, activeIncidentId: id };
}

function syncSelection(
  state: EventState,
  incidents: Incident[]
): Partial<EventState> {
  const selectionStillValid =
    state.selectedIncidentId !== null &&
    incidents.some((incident) => incident.id === state.selectedIncidentId);

  if (selectionStillValid) {
    return { incidents };
  }

  return {
    incidents,
    selectedIncidentId: null,
    activeIncidentId: null,
  };
}

export const useEventStore = create<EventState>((set) => ({
  incidents: [],
  activeIncidentId: null,
  selectedIncidentId: null,
  setActiveIncident: (id) => set({ activeIncidentId: id }),
  selectIncident: (id) => set((state) => nextSelection(state, id)),
  syncIncidents: (incidents) => set((state) => syncSelection(state, incidents)),
}));
