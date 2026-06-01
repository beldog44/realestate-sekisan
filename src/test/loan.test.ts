import { describe, it, expect } from "vitest";
import { calcLoanAssessment } from "@/lib/loan";
import { calcSekisan } from "@/lib/sekisan";

function makeSekisan(price: number, linePrice: number, landArea: number) {
  return calcSekisan({
    price,
    landArea,
    buildingArea: 80,
    structure: "木造",
    builtYear: new Date().getFullYear() - 15,
    linePrice,
  });
}

describe("calcLoanAssessment", () => {
  it("積算割れ物件は地銀・フルローン高評価", () => {
    const price = 8_000_000;
    const sekisan = makeSekisan(price, 150_000, 100);
    const result = calcLoanAssessment({ price, sekisan });

    expect(result.sekisanRatio).toBeLessThan(1.0);
    expect(result.fullLoanPossibility).toBe("高");
    expect(result.localBankFit).toBe("高");
  });

  it("積算オーバー物件はフルローン低評価", () => {
    const price = 50_000_000;
    const sekisan = makeSekisan(price, 50_000, 50);
    const result = calcLoanAssessment({ price, sekisan });

    expect(result.fullLoanPossibility).toBe("低");
  });

  it("担保余力は積算80%との差", () => {
    const price = 5_000_000;
    const sekisan = makeSekisan(price, 200_000, 100);
    const result = calcLoanAssessment({ price, sekisan });

    const expected = sekisan.totalSekisan * 0.8 - price;
    expect(result.collateralCapacity).toBeCloseTo(expected, -4);
  });

  it("融資想定額は積算の80%", () => {
    const price = 10_000_000;
    const sekisan = makeSekisan(price, 100_000, 80);
    const result = calcLoanAssessment({ price, sekisan });

    expect(result.estimatedLoanAmount).toBeCloseTo(sekisan.totalSekisan * 0.8, -4);
  });

  it("小額かつ積算割れ物件は信金適性が高い", () => {
    // 路線価高め・面積広めで積算 >> 価格 にする
    const price = 10_000_000;
    const sekisan = makeSekisan(price, 300_000, 80);
    const result = calcLoanAssessment({ price, sekisan });

    // price(1000万) << sekisan (路線価30万×80㎡ + 建物) なので積算割れ
    expect(result.sekisanRatio).toBeLessThan(1.0);
    expect(result.creditUnionFit).toBe("高");
  });
});
