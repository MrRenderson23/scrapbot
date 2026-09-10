// GEFUNDENE FAHRZEUGE
export const VEHICLES = [
  {
    id: 'old_car',
    name: 'Rostiger Kleinwagen',
    icon: '🚗',
    findChance: 0.40,
    dismantleTimeSec: 40,
    sellValue: 90,
    yields: [
      { id: 'scrap', amount: 4 },
      { id: 'screws', amount: 6 },
      { id: 'glass', amount: 2 },
      { id: 'plastic', amount: 3 },
      { id: 'gears', amount: 2 },
      { id: 'cables', amount: 2 }
    ]
  },
  {
    id: 'kombi',
    name: 'Familien-Kombi',
    icon: '🚙',
    findChance: 0.30,
    dismantleTimeSec: 75,
    sellValue: 170,
    yields: [
      { id: 'scrap', amount: 6 },
      { id: 'screws', amount: 10 },
      { id: 'springs', amount: 4 },
      { id: 'glass', amount: 4 },
      { id: 'leather', amount: 2 },
      { id: 'motor', amount: 1 },
      { id: 'textiles', amount: 3 },
      { id: 'gearboxes', amount: 1 }
    ]
  },
  {
    id: 'sports_car',
    name: 'Ausgebrannter Sportwagen',
    icon: '🏎️',
    findChance: 0.20,
    dismantleTimeSec: 120,
    sellValue: 260,
    yields: [
      { id: 'aluminum', amount: 8 },
      { id: 'leather', amount: 6 },
      { id: 'plastic', amount: 5 },
      { id: 'screws', amount: 12 },
      { id: 'motor', amount: 1 },
      { id: 'carbon_fiber', amount: 2 },
      { id: 'gearboxes', amount: 1 }
    ]
  },
  {
    id: 'truck',
    name: 'Alter LKW-Schrott',
    icon: '🚛',
    findChance: 0.10,
    dismantleTimeSec: 180,
    sellValue: 420,
    yields: [
      { id: 'scrap', amount: 15 },
      { id: 'springs', amount: 8 },
      { id: 'screws', amount: 20 },
      { id: 'glass', amount: 6 },
      { id: 'motor', amount: 2 },
      { id: 'gears', amount: 5 },
      { id: 'gearboxes', amount: 2 },
      { id: 'carbon_fiber', amount: 1 }
    ]
  },
  {
    id: 'ebike',
    name: 'Altes E-Bike',
    icon: '🚛',
    findChance: 0.10,
    dismantleTimeSec: 120,
    sellValue: 420,
    yields: [
      { id: 'scrap', amount: 15 },
      { id: 'springs', amount: 8 },
      { id: 'screws', amount: 20 },
      { id: 'glass', amount: 6 },
      { id: 'motor', amount: 1 },
      { id: 'cables', amount: 3 },
      { id: 'batteries_material', amount: 2 },
      { id: 'carbon_fiber', amount: 1 }
    ]
  }
];
