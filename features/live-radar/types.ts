// Shape of one row coming from the mock timer or the WebSocket.
export type StockEvent = {
  zone: string; // stand / area on the venue map
  item: string; // product or giveaway name
  quantity: number; // negative when stock goes down
  timestamp: number; // Unix time in milliseconds
};

// Example JSON over the wire:
// { "zone": "South Gate", "item": "Soda", "quantity": -1, "timestamp": 1715954400000 }