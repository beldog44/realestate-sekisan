import { describe, it, expect } from "vitest";
import { calcAirbnbScore } from "@/lib/airbnb";

describe("calcAirbnbScore", () => {
  it("商業地域・駅近・観光エリアは高スコア", () => {
    const result = calcAirbnbScore({
      zoning: "商業地域",
      walkMinutes: 3,
      address: "大阪市中央区",
    });
    expect(result.totalScore).toBeGreaterThan(70);
    expect(result.legalType).not.toBe("困難");
  });

  it("第一種低層は困難判定", () => {
    const result = calcAirbnbScore({
      zoning: "第一種低層住居専用地域",
      walkMinutes: 15,
    });
    expect(result.legalType).toBe("困難");
    expect(result.zoningScore).toBeLessThan(10);
  });

  it("大田区は特区民泊", () => {
    const result = calcAirbnbScore({
      zoning: "商業地域",
      walkMinutes: 5,
      address: "東京都大田区",
    });
    expect(result.legalType).toBe("特区民泊");
  });
});
