export const XP_REWARDS = {
  search: 5,
  dismantle: 12,
  quest: 50,
  upgrade: 25
} as const;

export const UPGRADE_REQUIRED_LEVELS: Record<string, number> = {
  laser_cutter: 1,
  radar_eyes: 2,
  diamond_blade: 3,
  solar_battery: 4
};

export type TalentBranch = 'bergung' | 'zerlegung' | 'technik';

export type TalentDefinition = {
  id: string;
  branch: TalentBranch;
  name: string;
  description: string;
  icon: string;
  requiredLevel: number;
  requires?: string;
  maxRank: number;
};

export const TALENTS: TalentDefinition[] = [
  {
    id: 'scavenger_instinct',
    branch: 'bergung',
    name: 'Bergungsinstinkt',
    description: '+5% Fundgewicht für Geräte und Fahrzeuge pro Rang.',
    icon: '🧭',
    requiredLevel: 2,
    maxRank: 3
  },
  {
    id: 'resource_finder',
    branch: 'bergung',
    name: 'Ressourcenfinder',
    description: '+1 Rohstoff bei gefundenem Altmetall pro Rang.',
    icon: '📦',
    requiredLevel: 3,
    requires: 'scavenger_instinct',
    maxRank: 2
  },
  {
    id: 'deep_scan',
    branch: 'bergung',
    name: 'Tiefenscan',
    description: '+8% zusätzliches Fundgewicht für seltene Items.',
    icon: '📡',
    requiredLevel: 5,
    requires: 'resource_finder',
    maxRank: 1
  },
  {
    id: 'quick_disassembly',
    branch: 'zerlegung',
    name: 'Schnellzerlegung',
    description: 'Verkürzt Zerlegezeiten um 8% pro Rang.',
    icon: '⚙️',
    requiredLevel: 2,
    maxRank: 3
  },
  {
    id: 'clean_dismantling',
    branch: 'zerlegung',
    name: 'Saubere Zerlegung',
    description: '+1 Rohstoff bei jedem Zerlegevorgang pro Rang.',
    icon: '🔩',
    requiredLevel: 3,
    requires: 'quick_disassembly',
    maxRank: 2
  },
  {
    id: 'salvage_mastery',
    branch: 'zerlegung',
    name: 'Schrottmeister',
    description: '+15% XP für Zerlegen und Suchen.',
    icon: '🏆',
    requiredLevel: 5,
    requires: 'clean_dismantling',
    maxRank: 1
  },
  {
    id: 'efficient_core',
    branch: 'technik',
    name: 'Effizienter Kern',
    description: '+10 maximale Energie pro Rang.',
    icon: '🔋',
    requiredLevel: 2,
    maxRank: 3
  },
  {
    id: 'drone_protocols',
    branch: 'technik',
    name: 'Drohnenprotokolle',
    description: 'Die Sammeldrohne verbraucht 1 Energie weniger pro Rang.',
    icon: '🛸',
    requiredLevel: 3,
    requires: 'efficient_core',
    maxRank: 2
  },
  {
    id: 'market_network',
    branch: 'technik',
    name: 'Marktnetzwerk',
    description: 'Käufe kosten 5% weniger pro Rang.',
    icon: '💳',
    requiredLevel: 5,
    requires: 'drone_protocols',
    maxRank: 1
  }
];

export function getLevelForXp(xp: number) {
  let level = 1;
  let remainingXp = Math.max(0, xp);
  let requiredXp = xpForNextLevel(level);

  while (remainingXp >= requiredXp) {
    remainingXp -= requiredXp;
    level += 1;
    requiredXp = xpForNextLevel(level);
  }

  return level;
}

export function xpForNextLevel(level: number) {
  return 100 + Math.max(0, level - 1) * 50;
}

export function xpIntoCurrentLevel(xp: number) {
  let remainingXp = Math.max(0, xp);
  let level = 1;

  while (remainingXp >= xpForNextLevel(level)) {
    remainingXp -= xpForNextLevel(level);
    level += 1;
  }

  return remainingXp;
}

export function experienceForFoundItem(item: { findChance: number }) {
  if (item.findChance <= 0.05) return 20;
  if (item.findChance <= 0.12) return 14;
  return 8;
}

export function requiredUpgradeLevel(upgradeId: string) {
  return UPGRADE_REQUIRED_LEVELS[upgradeId] || 1;
}
