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
