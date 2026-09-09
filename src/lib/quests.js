// HAUPTQUARTIER-AUFTRÄGE
export const QUESTS = [
  {
    id: 'quest_first_steps',
    title: 'Erste Schritte',
    description: 'Sammle etwas Altmetall und Kupfer, um die Basis auszurüsten.',
    rewards: { scrap: 10, copper: 5 },
    requirements: [
      { type: 'material', id: 'scrap', amount: 5, label: '5x Altmetall im Inventar' },
      { type: 'material', id: 'copper', amount: 3, label: '3x Kupfer im Inventar' }
    ]
  },
  {
    id: 'quest_electronics_expert',
    title: 'Elektronik-Spezialist',
    description: 'Zerlege kleine Elektronikgeräte für fortschrittliche Bauteile.',
    rewards: { transistors: 5, chips: 2 },
    requirements: [
      { type: 'material', id: 'resistors', amount: 8, label: '8x Widerstände besitzen' },
      { type: 'material', id: 'diodes', amount: 6, label: '6x Dioden besitzen' }
    ]
  },
  {
    id: 'quest_upgrade_robot',
    title: 'Aufrüstung',
    description: 'Statte deinen ScrapBot mit seinem ersten Upgrade aus.',
    rewards: { aluminum: 10, screws: 15 },
    requirements: [
      { type: 'upgrade', count: 1, label: 'Mindestens 1 Roboter-Upgrade besitzen' }
    ]
  },
  {
    id: 'quest_heavy_metal',
    title: 'Schwermetall',
    description: 'Beschaffe genug Stahlfedern und Schrauben für größere Bauprojekte.',
    rewards: { glass: 10, leather: 5 },
    requirements: [
      { type: 'material', id: 'screws', amount: 20, label: '20x Schrauben & Muttern besitzen' },
      { type: 'material', id: 'springs', amount: 10, label: '10x Stahlfedern besitzen' }
    ]
  },
  {
    id: 'quest_scrap_sorter',
    title: 'Schrottsortierer',
    description: 'Sortiere genug Altmetall und Aluminium für die nächsten Bauprojekte.',
    rewards: { screws: 20, plastic: 15 },
    requirements: [
      { type: 'material', id: 'scrap', amount: 40, label: '40x Altmetall im Inventar' },
      { type: 'material', id: 'aluminum', amount: 20, label: '20x Aluminium im Inventar' }
    ]
  },
  {
    id: 'quest_copper_network',
    title: 'Kupfernetz',
    description: 'Sammle Kupfer und Transistoren für eine stabile Energie- und Signalversorgung.',
    rewards: { chips: 4, diodes: 8 },
    requirements: [
      { type: 'material', id: 'copper', amount: 40, label: '40x Kupfer im Inventar' },
      { type: 'material', id: 'transistors', amount: 15, label: '15x Transistoren im Inventar' }
    ]
  },
  {
    id: 'quest_vehicle_recovery',
    title: 'Fahrzeug-Bergung',
    description: 'Verwerte schwere Funde und sichere die verwertbaren Fahrzeugteile.',
    rewards: { springs: 15, leather: 8 },
    requirements: [
      { type: 'material', id: 'glass', amount: 20, label: '20x Glas im Inventar' },
      { type: 'material', id: 'plastic', amount: 20, label: '20x Plastik im Inventar' },
      { type: 'material', id: 'leather', amount: 10, label: '10x Leder im Inventar' }
    ]
  },
  {
    id: 'quest_robot_engineer',
    title: 'Roboter-Ingenieur',
    description: 'Installiere mehrere Verbesserungen und bringe deinen ScrapBot auf den neuesten Stand.',
    rewards: { aluminum: 25, copper: 20 },
    requirements: [
      { type: 'upgrade', count: 2, label: 'Mindestens 2 Roboter-Upgrades besitzen' }
    ]
  },
  {
    id: 'quest_base_expansion',
    title: 'Basis-Ausbau',
    description: 'Baue die Infrastruktur des Hauptquartiers Schritt für Schritt aus.',
    rewards: { scrap: 50, screws: 30 },
    requirements: [
      { type: 'base_upgrade', count: 3, label: 'Mindestens 3 Basis-Upgrades besitzen' }
    ]
  },
  {
    id: 'quest_energy_mastery',
    title: 'Energie-Meisterschaft',
    description: 'Verbessere Ladestation und Solaranlage für eine zuverlässige Energieversorgung.',
    rewards: { copper: 35, diodes: 15, glass: 15 },
    requirements: [
      { type: 'base_upgrade', count: 6, label: 'Mindestens 6 Basis-Ausbaustufen besitzen' }
    ]
  },
  {
    id: 'quest_precision_parts',
    title: 'Präzisionsbauteile',
    description: 'Beschaffe seltene Elektronik für die nächste Generation des ScrapBots.',
    rewards: { chips: 12, transistors: 20, diodes: 25 },
    requirements: [
      { type: 'material', id: 'chips', amount: 10, label: '10x Mikrochips im Inventar' },
      { type: 'material', id: 'transistors', amount: 25, label: '25x Transistoren im Inventar' },
      { type: 'material', id: 'diodes', amount: 30, label: '30x Dioden im Inventar' }
    ]
  },
  {
    id: 'quest_reinforced_frame',
    title: 'Verstärkter Rahmen',
    description: 'Sammle genügend Metallteile, um die Basis gegen schwere Belastungen zu sichern.',
    rewards: { scrap: 100, aluminum: 50, screws: 50 },
    requirements: [
      { type: 'material', id: 'scrap', amount: 100, label: '100x Altmetall im Inventar' },
      { type: 'material', id: 'aluminum', amount: 45, label: '45x Aluminium im Inventar' },
      { type: 'material', id: 'screws', amount: 60, label: '60x Schrauben & Muttern im Inventar' }
    ]
  },
  {
    id: 'quest_automated_logistics',
    title: 'Automatisierte Logistik',
    description: 'Baue mehrere autonome Systeme aus und überlasse der Basis mehr Arbeit.',
    rewards: { copper: 60, plastic: 40, glass: 30 },
    requirements: [
      { type: 'base_upgrade', count: 9, label: 'Mindestens 9 Basis-Ausbaustufen besitzen' },
      { type: 'upgrade', count: 3, label: 'Mindestens 3 Roboter-Upgrades besitzen' }
    ]
  },
  {
    id: 'quest_master_scrapper',
    title: 'Meister des Schrotts',
    description: 'Fülle das Lager mit einer ausgewogenen Auswahl wertvoller Materialien.',
    rewards: { leather: 25, springs: 35, plastic: 35 },
    requirements: [
      { type: 'material', id: 'copper', amount: 75, label: '75x Kupfer im Inventar' },
      { type: 'material', id: 'springs', amount: 35, label: '35x Stahlfedern im Inventar' },
      { type: 'material', id: 'leather', amount: 25, label: '25x Leder im Inventar' },
      { type: 'material', id: 'glass', amount: 40, label: '40x Glas im Inventar' }
    ]
  },
  {
    id: 'quest_robot_perfection',
    title: 'Roboter-Perfektion',
    description: 'Installiere fast alle verfügbaren Roboter-Upgrades und schöpfe sein Potenzial aus.',
    rewards: { chips: 20, aluminum: 60, copper: 50 },
    requirements: [
      { type: 'upgrade', count: 4, label: 'Alle 4 Roboter-Upgrades besitzen' }
    ]
  },
  {
    id: 'quest_hq_command_center',
    title: 'Kommandozentrale',
    description: 'Schließe den großen Ausbau des Hauptquartiers ab und mache es zum Zentrum des Schrottplatzes.',
    rewards: { scrap: 150, screws: 75, diodes: 40, chips: 25 },
    requirements: [
      { type: 'base_upgrade', count: 12, label: 'Mindestens 12 Basis-Ausbaustufen besitzen' },
      { type: 'upgrade', count: 4, label: 'Alle 4 Roboter-Upgrades besitzen' }
    ]
  }
];
