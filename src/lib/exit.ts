import type { ExitStrategy, SekisanResult, RawProperty, AirbnbScore } from "@/types";

interface ExitInput {
  price: number;
  sekisan: SekisanResult;
  raw: Partial<RawProperty>;
  airbnb?: AirbnbScore;
}

export function calcExitStrategy(input: ExitInput): ExitStrategy {
  const notes: string[] = [];
  const { price, sekisan, raw, airbnb } = input;

  const landValueRatio = sekisan.landValueRatio;
  const sekisanRatio = sekisan.totalSekisan > 0 ? price / sekisan.totalSekisan : 999;
  const currentYear = new Date().getFullYear();
  const elapsedYears = raw.builtYear ? currentYear - raw.builtYear : 0;

  // 実需出口スコア
  const endUserExitScore =
    (raw.canRebuild === false ? 30 : 60) +
    (elapsedYears > 30 ? -20 : 0) +
    (landValueRatio >= 0.5 ? 20 : 0);

  // 投資家出口スコア
  const investorExitScore =
    (sekisanRatio <= 1.0 ? 40 : 20) +
    (raw.grossYield && raw.grossYield >= 0.08 ? 40 : 20);

  // 民泊出口スコア（airbnbスコアと連動）
  const airbnbExitScore = airbnb
    ? Math.round((airbnb.totalScore / 114) * 100)
    : 30;

  // 更地出口スコア
  const landOnlyExitScore =
    (raw.canRebuild !== false ? 60 : 20) +
    (landValueRatio >= 0.7 ? 30 : 10);

  // 建替え余地スコア
  const redevelopmentScore =
    (raw.canRebuild !== false ? 50 : 10) +
    ((raw.floorAreaRatio ?? 200) >= 200 ? 30 : 15);

  // 土地値依存度（0-100）
  const landValueDependency = Math.round(landValueRatio * 100);

  // 流動性スコア
  const liquidityScore =
    (raw.nearestStation ? (raw.walkMinutes ?? 20) <= 10 ? 60 : 40 : 30) +
    (landValueRatio >= 0.5 ? 20 : 10) +
    (sekisanRatio <= 1.0 ? 20 : 10);

  const totalScore = Math.round(
    (endUserExitScore + investorExitScore + landOnlyExitScore + redevelopmentScore + liquidityScore) / 5
  );

  const scores = [
    { name: "実需出口", score: endUserExitScore },
    { name: "投資家出口", score: investorExitScore },
    { name: "民泊出口", score: airbnbExitScore },
    { name: "更地出口", score: landOnlyExitScore },
    { name: "建替え出口", score: redevelopmentScore },
  ];
  const bestExit = scores.reduce((a, b) => (a.score > b.score ? a : b));
  const recommendedExit = bestExit.name;

  if (landValueRatio >= 0.7) notes.push("✅ 土地値比率高い：出口強い");
  if (raw.canRebuild === false) notes.push("⚠️ 再建築不可：実需・建替え出口困難");
  if (sekisanRatio <= 0.8) notes.push("✅ 割安取得：投資家出口しやすい");
  if (elapsedYears > 40) notes.push("ℹ️ 築古：更地・建替えが主な出口");
  if (airbnb && airbnb.totalScore >= 70) notes.push("✅ 民泊適性高：民泊出口も有力");

  return {
    endUserExitScore: Math.min(100, Math.max(0, endUserExitScore)),
    investorExitScore: Math.min(100, Math.max(0, investorExitScore)),
    airbnbExitScore: Math.min(100, Math.max(0, airbnbExitScore)),
    landOnlyExitScore: Math.min(100, Math.max(0, landOnlyExitScore)),
    redevelopmentScore: Math.min(100, Math.max(0, redevelopmentScore)),
    landValueDependency,
    liquidityScore: Math.min(100, Math.max(0, liquidityScore)),
    totalScore: Math.min(100, Math.max(0, totalScore)),
    recommendedExit,
    notes,
  };
}
