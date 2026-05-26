// 奥行価格補正テーブル（奥行距離 -> 補正率）
export const DEPTH_CORRECTION: Array<{ maxDepth: number; factor: number }> = [
  { maxDepth: 4, factor: 0.90 },
  { maxDepth: 6, factor: 0.92 },
  { maxDepth: 8, factor: 0.95 },
  { maxDepth: 10, factor: 0.97 },
  { maxDepth: 12, factor: 0.98 },
  { maxDepth: 14, factor: 0.99 },
  { maxDepth: 16, factor: 1.00 },
  { maxDepth: 20, factor: 1.00 },
  { maxDepth: 24, factor: 0.99 },
  { maxDepth: 28, factor: 0.98 },
  { maxDepth: 32, factor: 0.97 },
  { maxDepth: 36, factor: 0.96 },
  { maxDepth: 40, factor: 0.95 },
  { maxDepth: 44, factor: 0.94 },
  { maxDepth: 48, factor: 0.93 },
  { maxDepth: 52, factor: 0.92 },
  { maxDepth: 56, factor: 0.91 },
  { maxDepth: 60, factor: 0.90 },
  { maxDepth: 64, factor: 0.89 },
  { maxDepth: 68, factor: 0.88 },
  { maxDepth: 72, factor: 0.87 },
  { maxDepth: 76, factor: 0.86 },
  { maxDepth: 999, factor: 0.85 },
];

// 間口狭小補正テーブル（間口距離 -> 補正率）
export const FRONTAGE_NARROWNESS: Array<{ minFrontage: number; factor: number }> = [
  { minFrontage: 0, factor: 0.90 },
  { minFrontage: 4, factor: 0.94 },
  { minFrontage: 6, factor: 0.97 },
  { minFrontage: 8, factor: 1.00 },
];

// 不整形地補正（かげ地割合 -> 補正率）
export const IRREGULAR_SHAPE: Array<{ maxKagechi: number; factor: number }> = [
  { maxKagechi: 0.10, factor: 0.99 },
  { maxKagechi: 0.20, factor: 0.98 },
  { maxKagechi: 0.30, factor: 0.96 },
  { maxKagechi: 0.40, factor: 0.94 },
  { maxKagechi: 0.50, factor: 0.92 },
  { maxKagechi: 0.60, factor: 0.90 },
  { maxKagechi: 0.70, factor: 0.88 },
  { maxKagechi: 1.00, factor: 0.85 },
];

// 旗竿地補正
export const FLAG_POLE_FACTOR = 0.85;

// 再建築不可補正
export const NON_REBUILD_FACTOR = 0.60;

// セットバック補正（セットバック面積割合に応じて調整）
export const SETBACK_FACTOR = 0.97;

// 地方別流動性補正
export const REGIONAL_LIQUIDITY: Record<string, number> = {
  東京: 1.00,
  神奈川: 0.97,
  大阪: 0.95,
  京都: 0.93,
  愛知: 0.92,
  福岡: 0.90,
  埼玉: 0.93,
  千葉: 0.92,
  兵庫: 0.90,
  その他政令市: 0.85,
  地方中心市: 0.75,
  地方: 0.65,
};

// 空室リスク補正
export const VACANCY_RISK: Record<string, number> = {
  都心: 1.00,
  準都心: 0.95,
  郊外: 0.88,
  地方: 0.80,
};

// 民泊制限リスク補正
export const AIRBNB_RESTRICTION_RISK: Record<string, number> = {
  制限なし: 1.00,
  一部制限: 0.90,
  厳しい制限: 0.80,
  事実上不可: 0.70,
};
