export function createInventory<T extends { id: string }>(items: T[], initialId?: string) {
  return Object.fromEntries(items.map(item => [item.id, item.id === initialId ? 1 : 0]));
}

export function addToInventory(inventory: Record<string, number>, itemId: string, amount: number = 1) {
  inventory[itemId] = (inventory[itemId] || 0) + amount;
}

export function removeFromInventory(inventory: Record<string, number>, itemId: string, amount: number = 1) {
  const available = inventory[itemId] || 0;
  const actualAmount = Math.min(Math.max(0, amount), available);
  inventory[itemId] = available - actualAmount;
  return actualAmount;
}
