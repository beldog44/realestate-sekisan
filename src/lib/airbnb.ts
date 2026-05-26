import type { AirbnbScore, RawProperty } from "@/types";
import { ZONING_AIRBNB_RESTRICTION } from "@/constants";

interface AirbnbInput {
  zoning?: RawProperty["zoning"];
  walkMinutes?: number;
  prefecture?: string;
  address?: string;
  assumedRent?: number;
  floorPlan?: string;
}

export function calcAirbnbScore(input: AirbnbInput): AirbnbScore {
  const notes: string[] = [];

  // 用途地域スコア
  const zoningRestriction = input.zoning
    ? ZONING_AIRBNB_RESTRICTION[input.zoning] ?? "条件付き"
    : "条件付き";

  const zoningScore =
    zoningRestriction === "可" ? 25 :
    zoningRestriction === "条件付き" ? 15 : 5;

  if (zoningRestriction === "不可") {
    notes.push(`⚠️ ${input.zoning}では民泊は原則不可`);
  } else if (zoningRestriction === "条件付き") {
    notes.push(`ℹ️ ${input.zoning}では民泊新法（年間180日制限）の適用が主`);
  }

  // 駅距離スコア
  const walkMin = input.walkMinutes ?? 15;
  const locationScore =
    walkMin <= 5 ? 25 :
    walkMin <= 10 ? 20 :
    walkMin <= 15 ? 15 :
    walkMin <= 20 ? 10 : 5;

  if (walkMin <= 5) notes.push("✅ 駅近5分以内：民泊需要高");
  else if (walkMin > 15) notes.push("⚠️ 駅遠：稼働率に影響");

  // 観光地・インバウンド需要スコア（住所から簡易判定）
  const address = (input.address ?? "") + (input.prefecture ?? "");
  const touristKeywords = ["京都", "大阪", "浅草", "新宿", "渋谷", "名古屋", "福岡", "札幌", "那覇", "奈良", "金沢"];
  const isTouristArea = touristKeywords.some((k) => address.includes(k));
  const touristRouteScore = isTouristArea ? 15 : 8;
  const inboundDemandScore = isTouristArea ? 15 : 8;

  if (isTouristArea) notes.push("✅ 観光エリア：インバウンド需要あり");

  // ホテル単価スコア（地域から推定）
  const hotelPriceScore = isTouristArea ? 10 : 7;

  // 運営効率スコア（間取りから推定）
  const floorPlan = input.floorPlan ?? "";
  const hasMultipleRooms = /[3-9][LSKD]/.test(floorPlan) || /[3-9]R/.test(floorPlan);
  const operationalScore = hasMultipleRooms ? 5 : 8;

  if (hasMultipleRooms) notes.push("ℹ️ 部屋数が多い：清掃コスト要注意");

  const dominanceScore = 3;
  const noiseRiskScore = walkMin <= 3 ? 5 : 8;

  // 法的形態判定
  let legalType: AirbnbScore["legalType"] = "民泊新法";
  let legalTypeScore = 8;

  if (zoningRestriction === "不可") {
    legalType = "困難";
    legalTypeScore = 2;
  } else if (address.includes("大田区") || address.includes("大阪市") || address.includes("北九州")) {
    legalType = "特区民泊";
    legalTypeScore = 15;
    notes.push("✅ 特区民泊エリア：365日営業可能性あり");
  } else if (address.includes("旅館")) {
    legalType = "旅館業";
    legalTypeScore = 20;
  }

  const totalScore =
    zoningScore +
    locationScore +
    touristRouteScore +
    inboundDemandScore +
    hotelPriceScore +
    operationalScore +
    dominanceScore +
    legalTypeScore +
    noiseRiskScore;

  return {
    zoningScore,
    locationScore,
    touristRouteScore,
    inboundDemandScore,
    hotelPriceScore,
    operationalScore,
    dominanceScore,
    legalTypeScore,
    noiseRiskScore,
    totalScore,
    legalType,
    notes,
  };
}
