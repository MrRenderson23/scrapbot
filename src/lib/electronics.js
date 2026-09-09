// GEFUNDENE ELEKTROGERAETE
export const ELECTRONICS = [
  {
    id: 'wecker',
    name: 'Alter Wecker',
    icon: '⏰',
    findChance: 0.35,
    dismantleTimeSec: 30,
    sellValue: 20,
    yields: [
      { id: 'scrap', amount: 1 },
      { id: 'copper', amount: 2 },
      { id: 'resistors', amount: 1 }
    ]
  },
  {
    id: 'remote',
    name: 'Fernbedienung',
    icon: '📺',
    findChance: 0.25,
    dismantleTimeSec: 10,
    sellValue: 26,
    yields: [
      { id: 'scrap', amount: 1 },
      { id: 'diodes', amount: 2 },
      { id: 'resistors', amount: 2 }
    ]
  },
  {
    id: 'power_supply',
    name: 'Netzteil',
    icon: '🔌',
    findChance: 0.20,
    dismantleTimeSec: 15,
    sellValue: 32,
    yields: [
      { id: 'copper', amount: 4 },
      { id: 'aluminum', amount: 2 },
      { id: 'transistors', amount: 2 }
    ]
  },
  {
    id: 'radio',
    name: 'Kassettenradio',
    icon: '📻',
    findChance: 0.12,
    dismantleTimeSec: 45,
    sellValue: 52,
    yields: [
      { id: 'copper', amount: 3 },
      { id: 'transistors', amount: 3 },
      { id: 'diodes', amount: 4 },
      { id: 'chips', amount: 1 }
    ]
  },
  {
    id: 'turntable',
    name: 'Plattenspieler',
    icon: '🎙️',
    findChance: 0.05,
    dismantleTimeSec: 60,
    sellValue: 68,
    yields: [
      { id: 'aluminum', amount: 4 },
      { id: 'copper', amount: 5 },
      { id: 'transistors', amount: 4 }
    ]
  },
  {
    id: 'keyboard',
    name: 'Synthesizer / Keyboard',
    icon: '🎹',
    findChance: 0.03,
    dismantleTimeSec: 90,
    sellValue: 120,
    yields: [
      { id: 'chips', amount: 4 },
      { id: 'resistors', amount: 8 },
      { id: 'diodes', amount: 6 },
      { id: 'copper', amount: 3 }
    ]
  },
  {
    id: 'TestItem',
    name: 'Tester Item',
    icon: '🎹',
    findChance: 0.99,
    dismantleTimeSec: 10,
    sellValue: 120,
    yields: [
      { id: 'chips', amount: 4 },
      { id: 'resistors', amount: 8 },
      { id: 'diodes', amount: 6 },
      { id: 'copper', amount: 3 }
    ]
  },
  {
    id: 'TestItem2',
    name: 'Tester Item 2',
    icon: '🎹',
    findChance: 0.53,
    dismantleTimeSec: 10,
    sellValue: 120,
    yields: [
      { id: 'chips', amount: 22 },
      { id: 'resistors', amount: 2 },
      { id: 'diodes', amount: 2 },
      { id: 'copper', amount: 2 }
    ]
  }
];
