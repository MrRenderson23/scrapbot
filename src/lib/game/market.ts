export const MATERIAL_SELL_VALUES: Record<string, number> = {
  scrap: 2,
  copper: 5,
  aluminum: 6,
  transistors: 10,
  chips: 18,
  resistors: 4,
  diodes: 5,
  screws: 2,
  springs: 5,
  leather: 9,
  plastic: 6,
  glass: 5,
  gears: 8,
  cables: 5,
  textiles: 7,
  motor: 20,
  batteries_material: 15,
  carbon_fiber: 24,
  lamps: 6,
  gearboxes: 22
};

export function normalizeMarketAmount(value: number | undefined, fallback: number = 1, maxValue?: number) {
  const parsed = Number.isFinite(Number(value)) ? Number(value) : fallback;
  const safeValue = Math.max(1, Math.floor(parsed));
  if (maxValue !== undefined) return Math.min(safeValue, maxValue);
  return safeValue;
}

export function marketBuyPrice(sellPrice: number) {
  return Math.ceil(sellPrice * 1.3);
}
