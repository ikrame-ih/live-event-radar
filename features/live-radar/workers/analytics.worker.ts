export type InMsg = { type: "ECHO"; text: string };
export type OutMsg = { type: "ECHO"; text: string };

type WorkerScope = {
  onmessage: ((event: MessageEvent<InMsg>) => void) | null;
  postMessage: (message: OutMsg) => void;
};

const scope = self as unknown as WorkerScope;

// Placeholder — proves worker wiring before heavier math moves here.
scope.onmessage = (event: MessageEvent<InMsg>) => {
  if (event.data.type === "ECHO") {
    scope.postMessage({ type: "ECHO", text: event.data.text }); // skipcq: JS-S1014 -- dedicated worker; Worker API has no targetOrigin
  }
};
