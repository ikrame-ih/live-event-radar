/**
 * Tiny optional live feed for local demos.
 *
 *   npm i -D ws
 *   node server/mock-ws-server.mjs
 *
 * Then in .env.local:
 *   NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8787
 *   NEXT_PUBLIC_SIMULATOR_ONLY=false
 */
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const ZONES = ["South Gate", "Sampling Court", "Main Stage Walkway"];
const ITEMS = ["Soda", "Cap", "Sample bag"];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function stockEvent() {
  const spike = Math.random() < 0.3;
  return {
    zone: pick(ZONES),
    item: pick(ITEMS),
    quantity: spike
      ? -(3 + Math.floor(Math.random() * 3))
      : -(1 + Math.floor(Math.random() * 2)),
    timestamp: Date.now(),
  };
}

const { WebSocketServer } = await import("ws").catch(() => {
  console.error("Missing dependency. Run: npm i -D ws");
  process.exit(1);
});

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("LiveEvent Radar mock WebSocket — connect with ws://host:port\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  const tick = setInterval(() => {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(stockEvent()));
    }
  }, 2000);

  socket.on("close", () => clearInterval(tick));
});

server.listen(PORT, () => {
  console.log(`Mock stock WebSocket on ws://127.0.0.1:${PORT}`);
});
