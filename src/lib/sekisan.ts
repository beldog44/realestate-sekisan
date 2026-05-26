import type {
  SekisanInput,
  SekisanResult,
  LandValuation,
  BuildingValuation,
  BuildingStructure,
} from "@/types";
import {
  BUILDING_UNIT_PRICES,
  USEFUL_LIFE,
  MIN_RESIDUAL_RATIO,
  DEPTH_CORRECTION,
  FRONTAGE_NARROWNESS,
  FLAG_POLE_FACTOR,
  NON_REBUILD_FACTOR,
  SETBACK_FACTOR,
} from "@/constants";

export function getDepthCorrectionFactor(
  landArea: number,
  frontageWidth: number
): number {
  if (frontageWidth <= 0) return 1.0;
  const depth = landArea / frontageWidth;
  const entry = DEPTH_CORRECTION.find((e) => depth <= e.maxDepth);
  return entry?.factor ?? 0.85;
}

export function getFrontageNarrownessFactor(frontageWidth: number): number {
  const entry = [...FRONTAGE_NARROWNESS]
    .reverse()
    .find((e) => frontageWidth >= e.minFrontage);
  return entry?.factor ?? 0.90;
}

export function getElapsedYears(
  builtYear: number,
  builtMonth = 1,
  baseYear = new Date().getFullYear(),
  baseMonth = new Date().getMonth() + 1
): number {
  const months = (baseYear - builtYear) * 12 + (baseMonth - builtMonth);
  return Math.max(0, months / 12);
}

export function calcResidualRatio(
  elapsedYears: number,
  usefulLife: number
): number {
  const ratio = 1 - elapsedYears / usefulLife;
  return Math.max(MIN_RESIDUAL_RATIO, ratio);
}

export function calcLandValuation(params: {
  linePrice: number;
  landArea: number;
  frontageWidth?: number;
  roadContact?: string;
  canRebuild?: boolean;
  setback?: boolean;
  isLeasehold?: boolean;
  leaseholdRatio?: number;
}): LandValuation {
  const {
    linePrice,
    landArea,
    frontageWidth = 6,
    roadContact = "1面",
    canRebuild = true,
    setback = false,
    isLeasehold = false,
    leaseholdRatio = 0.6,
  } = params;

  const depthCorrectionFactor = getDepthCorrectionFactor(landArea, frontageWidth);
  const frontageNarrownessFactor = getFrontageNarrownessFactor(frontageWidth);
  const irregularShapeFactor = 1.0;

  const flagPoleFactor = roadContact === "なし（旗竿）" ? FLAG_POLE_FACTOR : 1.0;
  const roadContactFactor = roadContact === "2面以上" ? 1.03 : 1.0;
  const nonRebuildFactor = canRebuild ? 1.0 : NON_REBUILD_FACTOR;
  const setbackFactor = setback ? SETBACK_FACTOR : 1.0;
  const leaseholdFactor = isLeasehold ? leaseholdRatio : 1.0;

  const totalFactor =
    depthCorrectionFactor *
    frontageNarrownessFactor *
    irregularShapeFactor *
    flagPoleFactor *
    roadContactFactor *
    nonRebuildFactor *
    setbackFactor *
    leaseholdFactor;

  const totalLandValue = linePrice * landArea * totalFactor;

  return {
    linePrice,
    landArea,
    depthCorrectionFactor,
    frontageNarrownessFactor,
    irregularShapeFactor,
    flagPoleFactor,
    roadContactFactor,
    nonRebuildFactor,
    setbackFactor,
    leaseholdRatio: isLeasehold ? leaseholdRatio : 1.0,
    liquidityFactor: 1.0,
    totalLandValue,
  };
}

export function calcBuildingValuation(params: {
  structure: BuildingStructure;
  buildingArea: number;
  builtYear: number;
  builtMonth?: number;
  customUnitPrice?: number;
}): BuildingValuation {
  const { structure, buildingArea, builtYear, builtMonth = 1, customUnitPrice } =
    params;

  const unitPrice = customUnitPrice ?? BUILDING_UNIT_PRICES[structure];
  const usefulLife = USEFUL_LIFE[structure];
  const elapsedYears = getElapsedYears(builtYear, builtMonth);
  const residualYearsRatio = calcResidualRatio(elapsedYears, usefulLife);

  const ancientBuildingFactor = elapsedYears > usefulLife * 1.5 ? 0.5 : 1.0;

  const totalBuildingValue =
    unitPrice * buildingArea * residualYearsRatio * ancientBuildingFactor;

  return {
    unitPrice,
    buildingArea,
    usefulLife,
    elapsedYears,
    residualYearsRatio,
    ancientBuildingFactor,
    totalBuildingValue,
  };
}

export function calcSekisan(input: SekisanInput): SekisanResult {
  const land = calcLandValuation({
    linePrice: input.linePrice,
    landArea: input.landArea,
    frontageWidth: input.frontRoadWidth,
    roadContact: input.roadContact,
    canRebuild: input.canRebuild,
    setback: input.setback,
    isLeasehold: input.isLeasehold,
    leaseholdRatio: input.leaseholdRatio,
  });

  const building = calcBuildingValuation({
    structure: input.structure,
    buildingArea: input.buildingArea,
    builtYear: input.builtYear,
    builtMonth: input.builtMonth,
  });

  const totalSekisan = land.totalLandValue + building.totalBuildingValue;
  const priceToSekisanRatio = input.price > 0 ? input.price / totalSekisan : 0;
  const landValueRatio =
    totalSekisan > 0 ? land.totalLandValue / totalSekisan : 0;

  return {
    land,
    building,
    totalSekisan,
    priceToSekisanRatio,
    landValueRatio,
    calculatedAt: new Date().toISOString(),
  };
}

export function formatManEn(value: number): string {
  const man = Math.round(value / 10000);
  if (man >= 10000) {
    return `${(man / 10000).toFixed(2)}億円`;
  }
  return `${man.toLocaleString()}万円`;
}

export function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}
