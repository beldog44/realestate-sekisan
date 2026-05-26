import { describe, it, expect } from "vitest";
import {
  calcSekisan,
  calcLandValuation,
  calcBuildingValuation,
  getElapsedYears,
  calcResidualRatio,
  formatManEn,
  formatRatio,
} from "@/lib/sekisan";

describe("getElapsedYears", () => {
  it("現在より20年前で20年を返す", () => {
    const year = new Date().getFullYear() - 20;
    const elapsed = getElapsedYears(year, 1);
    expect(elapsed).toBeGreaterThan(19.5);
    expect(elapsed).toBeLessThan(21);
  });

  it("同じ年月で0を返す", () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    expect(getElapsedYears(year, month)).toBe(0);
  });
});

describe("calcResidualRatio", () => {
  it("法定耐用年数内は正常に計算", () => {
    expect(calcResidualRatio(10, 22)).toBeCloseTo(1 - 10 / 22);
  });

  it("法定耐用年数超過でも最低0.1を保証", () => {
    expect(calcResidualRatio(30, 22)).toBe(0.1);
  });

  it("築0年で残存比率1.0", () => {
    expect(calcResidualRatio(0, 22)).toBe(1.0);
  });
});

describe("calcLandValuation", () => {
  it("路線価×面積の基本計算", () => {
    const result = calcLandValuation({
      linePrice: 100000,
      landArea: 100,
      frontageWidth: 8,
    });
    expect(result.totalLandValue).toBeGreaterThan(0);
    expect(result.linePrice).toBe(100000);
    expect(result.landArea).toBe(100);
  });

  it("再建築不可で0.6補正が適用される", () => {
    const withRebuild = calcLandValuation({
      linePrice: 100000, landArea: 100, frontageWidth: 8, canRebuild: true,
    });
    const withoutRebuild = calcLandValuation({
      linePrice: 100000, landArea: 100, frontageWidth: 8, canRebuild: false,
    });
    expect(withoutRebuild.totalLandValue).toBeLessThan(withRebuild.totalLandValue);
    expect(withoutRebuild.nonRebuildFactor).toBe(0.6);
  });
});

describe("calcBuildingValuation", () => {
  it("木造20年の計算", () => {
    const result = calcBuildingValuation({
      structure: "木造",
      buildingArea: 100,
      builtYear: new Date().getFullYear() - 20,
      builtMonth: 1,
    });
    expect(result.totalBuildingValue).toBeGreaterThan(0);
    expect(result.usefulLife).toBe(22);
  });

  it("RC築0年は最大価値", () => {
    const result = calcBuildingValuation({
      structure: "RC",
      buildingArea: 100,
      builtYear: new Date().getFullYear(),
      builtMonth: new Date().getMonth() + 1,
    });
    expect(result.residualYearsRatio).toBe(1.0);
  });
});

describe("calcSekisan", () => {
  it("総積算 = 土地 + 建物", () => {
    const result = calcSekisan({
      price: 50000000,
      landArea: 100,
      buildingArea: 80,
      structure: "木造",
      builtYear: new Date().getFullYear() - 15,
      linePrice: 150000,
    });
    expect(result.totalSekisan).toBeCloseTo(
      result.land.totalLandValue + result.building.totalBuildingValue,
      -3
    );
  });

  it("価格/積算比率が正しく計算", () => {
    const result = calcSekisan({
      price: 20000000,
      landArea: 100,
      buildingArea: 80,
      structure: "木造",
      builtYear: new Date().getFullYear() - 15,
      linePrice: 100000,
    });
    const expectedRatio = 20000000 / result.totalSekisan;
    expect(result.priceToSekisanRatio).toBeCloseTo(expectedRatio, 5);
  });
});

describe("formatManEn", () => {
  it("1000万円", () => {
    expect(formatManEn(10000000)).toBe("1,000万円");
  });

  it("1億円", () => {
    expect(formatManEn(100000000)).toBe("1.00億円");
  });
});

describe("formatRatio", () => {
  it("0.85 → 85.0%", () => {
    expect(formatRatio(0.85)).toBe("85.0%");
  });
});
