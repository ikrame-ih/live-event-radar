/// <reference lib="webworker" />

export type InMsg = { type: "ECHO"; text: string };
export type OutMsg = { type: "ECHO"; text: string };

// Echoes messages from the main thread — proves postMessage works before heavy math later.
self.onmessage = (ev: MessageEvent<InMsg>) => {
  if (ev.data.type === "ECHO") {
    const out: OutMsg = { type: "ECHO", text: ev.data.text };
    postMessage(out);
  }
};
