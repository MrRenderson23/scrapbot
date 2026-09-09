/**
 * @typedef {{ name: string, icon: string, rarity: 'gewöhnlich' | 'selten' | 'episch' }} MaterialInfo
 */

// ALLE MÖGLICHEN BAUTEILE / RESSOURCEN
/** @type {Record<string, MaterialInfo>} */
export const MATERIALS = {
  // Elektronik-Bauteile
  scrap: { name: 'Altmetall', icon: '📦', rarity: 'gewöhnlich' },
  copper: { name: 'Kupfer', icon: '🟠', rarity: 'gewöhnlich' },
  aluminum: { name: 'Aluminium', icon: '⚪', rarity: 'gewöhnlich' },
  transistors: { name: 'Transistoren', icon: '🔌', rarity: 'selten' },
  chips: { name: 'Mikrochips', icon: '🟨', rarity: 'episch' },
  resistors: { name: 'Widerstände', icon: '🌀', rarity: 'gewöhnlich' },
  diodes: { name: 'Dioden', icon: '🔻', rarity: 'selten' },

  // Mechanische / Auto-Bauteile
  screws: { name: 'Schrauben & Muttern', icon: '🔩', rarity: 'gewöhnlich' },
  springs: { name: 'Stahlfedern', icon: '🌀', rarity: 'selten' },
  leather: { name: 'Leder', icon: '🛋️', rarity: 'selten' },
  plastic: { name: 'Plastik', icon: '🧪', rarity: 'gewöhnlich' },
  glass: { name: 'Glas', icon: '🪟', rarity: 'gewöhnlich' }
};

// ROBOTER UPGRADES
export const ROBOT_UPGRADES = [
  {
    id: 'laser_cutter',
    name: 'Plasmabrenner',
    icon: '🔥',
    category: 'Arm-Werkzeug',
    description: 'Verringert die Zerlegezeit aller Objekte pro Ausbaustufe um weitere 15%.',
    levels: [
      {
        id: 'laser_cutter_mk1',
        name: 'Plasmabrenner Mk.1',
        speedMultiplier: 0.85,
        costs: [
          { id: 'copper', amount: 10 },
          { id: 'screws', amount: 15 },
          { id: 'transistors', amount: 5 }
        ]
      },
      {
        id: 'laser_cutter_mk2',
        name: 'Plasmabrenner Mk.2',
        speedMultiplier: 0.70,
        costs: [
          { id: 'copper', amount: 20 },
          { id: 'screws', amount: 30 },
          { id: 'transistors', amount: 10 }
        ]
      },
      {
        id: 'laser_cutter_mk3',
        name: 'Plasmabrenner Mk.3',
        speedMultiplier: 0.55,
        costs: [
          { id: 'copper', amount: 40 },
          { id: 'screws', amount: 55 },
          { id: 'transistors', amount: 20 }
        ]
      }
    ]
  },
  {
    id: 'radar_eyes',
    name: 'Infrarot-Radar',
    icon: '👁️',
    category: 'Sensoren',
    description: 'Erhöht die Chance, seltene Funde beim Suchen zu entdecken.',
    costs: [
      { id: 'chips', amount: 3 },
      { id: 'diodes', amount: 8 },
      { id: 'glass', amount: 5 }
    ]
  },
  {
    id: 'diamond_blade',
    name: 'Diamant-Trennscheibe',
    icon: '⚙️',
    category: 'Arm-Werkzeug',
    description: 'Ermöglicht das mühelose Zerlegen schwerer Materialien.',
    costs: [
      { id: 'aluminum', amount: 12 },
      { id: 'springs', amount: 10 },
      { id: 'screws', amount: 20 }
    ]
  },
  {
    id: 'solar_battery',
    name: 'Kern-Kondensator',
    icon: '🔋',
    category: 'Energie',
    description: 'Erhöht die maximale Energie des Scrapbots auf 150.',
    costs: [
      { id: 'copper', amount: 20 },
      { id: 'plastic', amount: 10 },
      { id: 'diodes', amount: 10 }
    ]
  }
];

// BASIS-AUSBAU
export const BASE_UPGRADES = [
  {
    id: 'charger_station',
    name: 'Schnellladestation',
    icon: '⚡',
    description: 'Baue die Ladestation in drei Stufen aus: Mk.1 lädt 10⚡, Mk.2 lädt 25⚡ und Mk.3 lädt 50⚡ pro Ladevorgang.',
    levels: [
      {
        id: 'charger_mk1',
        name: 'Schnellladestation Mk.1',
        chargeAmount: 10,
        costs: [
          { id: 'copper', amount: 15 },
          { id: 'screws', amount: 10 },
          { id: 'resistors', amount: 8 }
        ]
      },
      {
        id: 'charger_mk2',
        name: 'Schnellladestation Mk.2',
        chargeAmount: 25,
        costs: [
          { id: 'copper', amount: 30 },
          { id: 'screws', amount: 25 },
          { id: 'resistors', amount: 15 }
        ]
      },
      {
        id: 'charger_mk3',
        name: 'Schnellladestation Mk.3',
        chargeAmount: 50,
        costs: [
          { id: 'copper', amount: 60 },
          { id: 'screws', amount: 45 },
          { id: 'resistors', amount: 25 }
        ]
      }
    ]
  },
  {
    id: 'repair_bench_station',
    name: 'Auto-Zerlegekran',
    icon: '🏗️',
    description: 'Zerlegt automatisch Elektrogeräte oder Fahrzeuge. Höhere Stufen arbeiten schneller.',
    levels: [
      {
        id: 'repair_bench_mk1',
        name: 'Auto-Zerlegekran Mk.1',
        dismantleIntervalMs: 60000,
        costs: [
          { id: 'scrap', amount: 30 },
          { id: 'screws', amount: 25 },
          { id: 'springs', amount: 12 }
        ]
      },
      {
        id: 'repair_bench_mk2',
        name: 'Auto-Zerlegekran Mk.2',
        dismantleIntervalMs: 30000,
        costs: [
          { id: 'scrap', amount: 60 },
          { id: 'screws', amount: 45 },
          { id: 'springs', amount: 25 }
        ]
      },
      {
        id: 'repair_bench_mk3',
        name: 'Auto-Zerlegekran Mk.3',
        dismantleIntervalMs: 20000,
        costs: [
          { id: 'scrap', amount: 120 },
          { id: 'screws', amount: 80 },
          { id: 'springs', amount: 45 }
        ]
      }
    ]
  },
  {
    id: 'solar_station',
    name: 'Dach-Solaranlage',
    icon: '☀️',
    description: 'Baue die Solaranlage in drei Stufen aus: Mk.1 erzeugt 1⚡ alle 3 Sekunden, Mk.2 3⚡ alle 5 Sekunden und Mk.3 10⚡ pro Ausführung.',
    levels: [
      {
        id: 'solar_mk1',
        name: 'Dach-Solaranlage Mk.1',
        energyAmount: 1,
        intervalMs: 3000,
        costs: [
          { id: 'glass', amount: 15 },
          { id: 'diodes', amount: 12 },
          { id: 'copper', amount: 20 }
        ]
      },
      {
        id: 'solar_mk2',
        name: 'Dach-Solaranlage Mk.2',
        energyAmount: 3,
        intervalMs: 5000,
        costs: [
          { id: 'glass', amount: 30 },
          { id: 'diodes', amount: 25 },
          { id: 'copper', amount: 35 }
        ]
      },
      {
        id: 'solar_mk3',
        name: 'Dach-Solaranlage Mk.3',
        energyAmount: 10,
        intervalMs: 5000,
        costs: [
          { id: 'glass', amount: 60 },
          { id: 'diodes', amount: 45 },
          { id: 'copper', amount: 70 }
        ]
      }
    ]
  },
  {
    id: 'scout_drone_station',
    name: 'Sammel-Drohne',
    icon: '🛸',
    description: 'Verbessere die Drohne für schnellere Suchflüge und einen geringeren Energieverbrauch.',
    levels: [
      {
        id: 'scout_drone_mk1',
        name: 'Sammel-Drohne Mk.1',
        searchIntervalMs: 30000,
        energyCost: 10,
        costs: [
          { id: 'chips', amount: 8 },
          { id: 'diodes', amount: 15 },
          { id: 'aluminum', amount: 20 },
          { id: 'plastic', amount: 15 }
        ]
      },
      {
        id: 'scout_drone_mk2',
        name: 'Sammel-Drohne Mk.2',
        searchIntervalMs: 20000,
        energyCost: 8,
        costs: [
          { id: 'chips', amount: 16 },
          { id: 'diodes', amount: 25 },
          { id: 'aluminum', amount: 35 },
          { id: 'plastic', amount: 25 }
        ]
      },
      {
        id: 'scout_drone_mk3',
        name: 'Sammel-Drohne Mk.3',
        searchIntervalMs: 10000,
        energyCost: 5,
        costs: [
          { id: 'chips', amount: 30 },
          { id: 'diodes', amount: 45 },
          { id: 'aluminum', amount: 60 },
          { id: 'plastic', amount: 40 }
        ]
      }
    ]
  }
];

