/// <reference lib="webworker" />

export type InMsg = { type: "ECHO"; text: string };
export type OutMsg = { type: "ECHO"; text: string };

// Placeholder — proves postMessage before heavier math moves here.
self.onmessage = (ev: MessageEvent<InMsg>) => {
  if (ev.data.type === "ECHO") {
    const out: OutMsg = { type: "ECHO", text: ev.data.text };
    postMessage(out);
  }
};
