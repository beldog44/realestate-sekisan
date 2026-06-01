import { describe, it, expect } from "vitest";
import { calcScoreCard, getGradeColor, getScoreColor } from "@/lib/scoring";
import { calcSekisan } from "@/lib/sekisan";
import { calcAirbnbScore } from "@/lib/airbnb";
import { calcLoanAssessment } from "@/lib/loan";
import { calcExitStrategy } from "@/lib/exit";

function makeAllScores(overrides: { price?: number; linePrice?: number } = {}) {
  const price = overrides.price ?? 10_000_000;
  const linePrice = overrides.linePrice ?? 150_000;
  const raw = {
    grossYield: 0.08,
    canRebuild: true,
    walkMinutes: 10,
    nearestStation: "渋谷駅",
  };
  const sekisan = calcSekisan({
    price,
    landArea: 80,
    buildingArea: 100,
    structure: "木造",
    builtYear: new Date().getFullYear() - 15,
    linePrice,
  });
  const airbnb = calcAirbnbScore({ zoning: "商業地域", walkMinutes: 10 });
  const loan = calcLoanAssessment({ price, sekisan });
  const exit = calcExitStrategy({ price, sekisan, raw, airbnb });

  return { price, sekisan, airbnb, loan, exit, raw };
}

describe("calcScoreCard", () => {
  it("全スコアが0-100の範囲", () => {
    const inputs = makeAllScores();
    const result = calcScoreCard(inputs);

    expect(result.sekisanScore).toBeGreaterThanOrEqual(0);
    expect(result.sekisanScore).toBeLessThanOrEqual(100);
    expect(result.loanScore).toBeGreaterThanOrEqual(0);
    expect(result.loanScore).toBeLessThanOrEqual(100);
    expect(result.airbnbScore).toBeGreaterThanOrEqual(0);
    expect(result.airbnbScore).toBeLessThanOrEqual(100);
    expect(result.exitScore).toBeGreaterThanOrEqual(0);
    expect(result.exitScore).toBeLessThanOrEqual(100);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  it("gradeはS/A/B/C/Dのいずれか", () => {
    const inputs = makeAllScores();
    const result = calcScoreCard(inputs);
    expect(["S", "A", "B", "C", "D"]).toContain(result.grade);
  });

  it("積算割れ物件は高スコア", () => {
    // price << sekisan → 積算スコア高い
    const inputs = makeAllScores({ price: 5_000_000, linePrice: 300_000 });
    const result = calcScoreCard(inputs);
    expect(result.sekisanScore).toBeGreaterThan(50);
  });

  it("totalScore 80以上はSグレード", () => {
    const inputs = makeAllScores({ price: 3_000_000, linePrice: 500_000 });
    const result = calcScoreCard(inputs);
    if (result.totalScore >= 80) {
      expect(result.grade).toBe("S");
    } else {
      expect(result.grade).not.toBe("S");
    }
  });
});

describe("getGradeColor", () => {
  it("Sグレードは紫", () => {
    expect(getGradeColor("S")).toContain("purple");
  });
  it("Dグレードは赤", () => {
    expect(getGradeColor("D")).toContain("red");
  });
});

describe("getScoreColor", () => {
  it("75以上は緑", () => {
    expect(getScoreColor(80)).toContain("green");
  });
  it("35未満は赤", () => {
    expect(getScoreColor(20)).toContain("red");
  });
});
