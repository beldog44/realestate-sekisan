import { describe, it, expect } from "vitest";
import { calcExitStrategy } from "@/lib/exit";
import { calcSekisan } from "@/lib/sekisan";
import { calcAirbnbScore } from "@/lib/airbnb";

function makeSekisan(price: number) {
  return calcSekisan({
    price,
    landArea: 100,
    buildingArea: 80,
    structure: "木造",
    builtYear: new Date().getFullYear() - 20,
    linePrice: 150_000,
  });
}

describe("calcExitStrategy", () => {
  it("airbnbスコアと民泊出口スコアが連動する", () => {
    const price = 10_000_000;
    const sekisan = makeSekisan(price);

    const highAirbnb = calcAirbnbScore({ zoning: "商業地域", walkMinutes: 3, address: "大阪市" });
    const lowAirbnb = calcAirbnbScore({ zoning: "第一種低層住居専用地域", walkMinutes: 25 });

    const exitHigh = calcExitStrategy({ price, sekisan, raw: {}, airbnb: highAirbnb });
    const exitLow = calcExitStrategy({ price, sekisan, raw: {}, airbnb: lowAirbnb });

    expect(exitHigh.airbnbExitScore).toBeGreaterThan(exitLow.airbnbExitScore);
  });

  it("airbnbなしは民泊出口スコアがデフォルト30", () => {
    const price = 10_000_000;
    const sekisan = makeSekisan(price);
    const result = calcExitStrategy({ price, sekisan, raw: {} });

    expect(result.airbnbExitScore).toBe(30);
  });

  it("再建築不可は更地・実需出口が低い", () => {
    const price = 5_000_000;
    const sekisan = makeSekisan(price);
    const resultNoRebuild = calcExitStrategy({ price, sekisan, raw: { canRebuild: false } });
    const resultRebuild = calcExitStrategy({ price, sekisan, raw: { canRebuild: true } });

    expect(resultNoRebuild.landOnlyExitScore).toBeLessThan(resultRebuild.landOnlyExitScore);
    expect(resultNoRebuild.endUserExitScore).toBeLessThan(resultRebuild.endUserExitScore);
  });

  it("totalScoreは0-100の範囲", () => {
    const price = 10_000_000;
    const sekisan = makeSekisan(price);
    const result = calcExitStrategy({ price, sekisan, raw: {} });

    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  it("recommendedExitは最高スコアの出口戦略", () => {
    const price = 8_000_000;
    const sekisan = calcSekisan({
      price,
      landArea: 150,
      buildingArea: 50,
      structure: "木造",
      builtYear: 1970,
      linePrice: 100_000,
    });
    const result = calcExitStrategy({ price, sekisan, raw: { canRebuild: true, builtYear: 1970 } });

    expect(["実需出口", "投資家出口", "民泊出口", "更地出口", "建替え出口"]).toContain(result.recommendedExit);
  });
});
