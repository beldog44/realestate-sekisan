import type { BuildingStructure } from "@/types";

export const USEFUL_LIFE: Record<BuildingStructure, number> = {
  木造: 22,
  軽量鉄骨: 19,
  重量鉄骨: 34,
  RC: 47,
  SRC: 47,
  その他: 22,
};

// 軽量鉄骨は厚さによって異なる（3mm以下:19年, 3mm超:27年）
export const USEFUL_LIFE_LIGHT_STEEL = {
  thin: 19,
  thick: 27,
};

// 残存価値率下限（築古でも最低この割合は残す）
export const MIN_RESIDUAL_RATIO = 0.1;
