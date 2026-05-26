import type { BuildingStructure } from "@/types";

export const BUILDING_UNIT_PRICES: Record<BuildingStructure, number> = {
  木造: 180000,
  軽量鉄骨: 200000,
  重量鉄骨: 230000,
  RC: 270000,
  SRC: 300000,
  その他: 180000,
};

// 単位: 円/m²
export const BUILDING_UNIT_PRICE_RANGES: Record<
  BuildingStructure,
  { min: number; max: number; default: number }
> = {
  木造: { min: 150000, max: 220000, default: 180000 },
  軽量鉄骨: { min: 170000, max: 240000, default: 200000 },
  重量鉄骨: { min: 200000, max: 270000, default: 230000 },
  RC: { min: 230000, max: 320000, default: 270000 },
  SRC: { min: 260000, max: 350000, default: 300000 },
  その他: { min: 150000, max: 220000, default: 180000 },
};
