import { describe, expect, it, beforeEach } from "vitest";
import { useEventStore, type Incident } from "./useEventStore";

const sample: Incident = {
  id: "zone-South Gate",
  title: "Zone activity",
  zone: "South Gate",
  severity: "warning",
  timestamp: Date.now(),
  x: 0,
  y: 0,
  description: "test",
  metric: "1 evt/30s",
};

describe("useEventStore selectIncident", () => {
  beforeEach(() => {
    useEventStore.setState({
      incidents: [sample],
      activeIncidentId: null,
      selectedIncidentId: null,
    });
  });

  it("selects an incident", () => {
    useEventStore.getState().selectIncident(sample.id);
    expect(useEventStore.getState().selectedIncidentId).toBe(sample.id);
  });

  it("deselects when the same incident is clicked again", () => {
    useEventStore.getState().selectIncident(sample.id);
    useEventStore.getState().selectIncident(sample.id);
    expect(useEventStore.getState().selectedIncidentId).toBeNull();
    expect(useEventStore.getState().activeIncidentId).toBeNull();
  });

  it("clears selection when sync drops the selected incident", () => {
    useEventStore.getState().selectIncident(sample.id);
    useEventStore.getState().syncIncidents([]);
    expect(useEventStore.getState().selectedIncidentId).toBeNull();
  });
});
