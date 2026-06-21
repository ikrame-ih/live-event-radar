export type StockEvent = {
  zone: string;
  item: string;
  quantity: number;
  timestamp: number;
};

// Wire format: { "zone": "South Gate", "item": "Soda", "quantity": -1, "timestamp": 1715954400000 }