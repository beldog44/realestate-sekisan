import type { ScoreCard, SekisanResult, AirbnbScore, LoanAssessment, ExitStrategy, RawProperty } from "@/types";

interface ScoringInput {
  price: number;
  sekisan: SekisanResult;
  airbnb: AirbnbScore;
  loan: LoanAssessment;
  exit: ExitStrategy;
  raw: Partial<RawProperty>;
}

export function calcScoreCard(input: ScoringInput): ScoreCard {
  const { price, sekisan, airbnb, loan, exit, raw } = input;

  // 積算スコア (0-100)
  const sekisanScore = Math.round(
    Math.max(0, Math.min(100, (1 - (sekisan.priceToSekisanRatio - 0.5)) * 100))
  );

  // 融資スコア (0-100)
  const loanScore = Math.round(
    (loan.fullLoanPossibility === "高" ? 40 : loan.fullLoanPossibility === "中" ? 25 : 10) +
    (loan.localBankFit === "高" ? 30 : loan.localBankFit === "中" ? 20 : 10) +
    (loan.landValueRatio >= 0.5 ? 30 : loan.landValueRatio >= 0.3 ? 20 : 10)
  );

  // 民泊スコア (0-100)
  const airbnbScoreVal = Math.round(Math.min(100, (airbnb.totalScore / 114) * 100));

  // 出口スコア (0-100)
  const exitScore = exit.totalScore;

  // 収益性スコア (0-100)
  const grossYield = raw.grossYield ?? (raw.assumedRent && price > 0 ? (raw.assumedRent * 12) / price : 0);
  const profitabilityScore = Math.round(
    Math.min(100, (grossYield / 0.12) * 100)
  );

  // リスクスコア (0-100, 高いほど低リスク)
  const riskScore = Math.round(
    (raw.canRebuild !== false ? 30 : 10) +
    ((raw.walkMinutes ?? 20) <= 10 ? 25 : 10) +
    (sekisan.priceToSekisanRatio <= 1.0 ? 25 : 10) +
    (sekisan.landValueRatio >= 0.4 ? 20 : 10)
  );

  const totalScore = Math.round(
    sekisanScore * 0.25 +
    loanScore * 0.20 +
    airbnbScoreVal * 0.15 +
    exitScore * 0.15 +
    profitabilityScore * 0.15 +
    riskScore * 0.10
  );

  const grade: ScoreCard["grade"] =
    totalScore >= 80 ? "S" :
    totalScore >= 65 ? "A" :
    totalScore >= 50 ? "B" :
    totalScore >= 35 ? "C" : "D";

  return {
    sekisanScore: Math.min(100, Math.max(0, sekisanScore)),
    loanScore: Math.min(100, Math.max(0, loanScore)),
    airbnbScore: Math.min(100, Math.max(0, airbnbScoreVal)),
    exitScore: Math.min(100, Math.max(0, exitScore)),
    profitabilityScore: Math.min(100, Math.max(0, profitabilityScore)),
    riskScore: Math.min(100, Math.max(0, riskScore)),
    totalScore: Math.min(100, Math.max(0, totalScore)),
    grade,
  };
}

export function getGradeColor(grade: ScoreCard["grade"]): string {
  return {
    S: "text-purple-600 bg-purple-50",
    A: "text-green-600 bg-green-50",
    B: "text-blue-600 bg-blue-50",
    C: "text-yellow-600 bg-yellow-50",
    D: "text-red-600 bg-red-50",
  }[grade];
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 55) return "text-yellow-600";
  if (score >= 35) return "text-orange-600";
  return "text-red-600";
}
