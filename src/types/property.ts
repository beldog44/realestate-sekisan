import { z } from "zod";

export const BuildingStructureSchema = z.enum([
  "木造",
  "軽量鉄骨",
  "重量鉄骨",
  "RC",
  "SRC",
  "その他",
]);
export type BuildingStructure = z.infer<typeof BuildingStructureSchema>;

export const ZoningSchema = z.enum([
  "第一種低層住居専用地域",
  "第二種低層住居専用地域",
  "第一種中高層住居専用地域",
  "第二種中高層住居専用地域",
  "第一種住居地域",
  "第二種住居地域",
  "準住居地域",
  "田園住居地域",
  "近隣商業地域",
  "商業地域",
  "準工業地域",
  "工業地域",
  "工業専用地域",
  "市街化調整区域",
  "不明",
]);
export type Zoning = z.infer<typeof ZoningSchema>;

export const PropertyStatusSchema = z.enum([
  "買付候補",
  "詳細確認",
  "保留",
  "除外",
  "未設定",
]);
export type PropertyStatus = z.infer<typeof PropertyStatusSchema>;

export const PropertySourceSchema = z.enum([
  "rakumachi",
  "kenbiya",
  "suumo",
  "athome",
  "homes",
  "manual",
  "generic",
]);
export type PropertySource = z.infer<typeof PropertySourceSchema>;

export const RoadContactSchema = z.enum([
  "2面以上",
  "1面",
  "なし（旗竿）",
  "不明",
]);
export type RoadContact = z.infer<typeof RoadContactSchema>;

export const RawPropertySchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  address: z.string().optional(),
  landArea: z.number().optional(),
  buildingArea: z.number().optional(),
  floorPlan: z.string().optional(),
  structure: BuildingStructureSchema.optional(),
  builtYear: z.number().optional(),
  builtMonth: z.number().optional(),
  zoning: ZoningSchema.optional(),
  buildingCoverageRatio: z.number().optional(),
  floorAreaRatio: z.number().optional(),
  roadContact: RoadContactSchema.optional(),
  frontRoadWidth: z.number().optional(),
  canRebuild: z.boolean().optional(),
  setback: z.boolean().optional(),
  nearestStation: z.string().optional(),
  walkMinutes: z.number().optional(),
  assumedRent: z.number().optional(),
  grossYield: z.number().optional(),
  detailUrl: z.string().optional(),
  currentUrl: z.string(),
  source: PropertySourceSchema,
  fetchedAt: z.string(),
});
export type RawProperty = z.infer<typeof RawPropertySchema>;

export interface LandValuation {
  linePrice: number;
  landArea: number;
  depthCorrectionFactor: number;
  frontageNarrownessFactor: number;
  irregularShapeFactor: number;
  flagPoleFactor: number;
  roadContactFactor: number;
  nonRebuildFactor: number;
  setbackFactor: number;
  leaseholdRatio: number;
  liquidityFactor: number;
  totalLandValue: number;
}

export interface BuildingValuation {
  unitPrice: number;
  buildingArea: number;
  usefulLife: number;
  elapsedYears: number;
  residualYearsRatio: number;
  ancientBuildingFactor: number;
  totalBuildingValue: number;
}

export interface SekisanResult {
  land: LandValuation;
  building: BuildingValuation;
  totalSekisan: number;
  priceToSekisanRatio: number;
  landValueRatio: number;
  calculatedAt: string;
}

export interface AirbnbScore {
  zoningScore: number;
  locationScore: number;
  touristRouteScore: number;
  inboundDemandScore: number;
  hotelPriceScore: number;
  operationalScore: number;
  dominanceScore: number;
  legalTypeScore: number;
  noiseRiskScore: number;
  totalScore: number;
  legalType: "旅館業" | "特区民泊" | "民泊新法" | "困難";
  notes: string[];
}

export interface LoanAssessment {
  sekisanRatio: number;
  landValueRatio: number;
  estimatedLoanAmount: number;
  fullLoanPossibility: "高" | "中" | "低";
  overLoanPossibility: "高" | "中" | "低";
  collateralCapacity: number;
  localBankFit: "高" | "中" | "低";
  creditUnionFit: "高" | "中" | "低";
  nonBankFit: "高" | "中" | "低";
  notes: string[];
}

export interface ExitStrategy {
  endUserExitScore: number;
  investorExitScore: number;
  airbnbExitScore: number;
  landOnlyExitScore: number;
  redevelopmentScore: number;
  landValueDependency: number;
  liquidityScore: number;
  totalScore: number;
  recommendedExit: string;
  notes: string[];
}

export interface ScoreCard {
  sekisanScore: number;
  loanScore: number;
  airbnbScore: number;
  exitScore: number;
  profitabilityScore: number;
  riskScore: number;
  totalScore: number;
  grade: "S" | "A" | "B" | "C" | "D";
}

export interface ExternalLinks {
  rosen: string;
  googleMaps: string;
  gsi: string;
  zoning: string;
  hazardMap: string;
}

export interface Property {
  id: string;
  raw: RawProperty;
  sekisan?: SekisanResult;
  airbnb?: AirbnbScore;
  loan?: LoanAssessment;
  exit?: ExitStrategy;
  score?: ScoreCard;
  externalLinks?: ExternalLinks;
  status: PropertyStatus;
  memo: string;
  rank?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SekisanInput {
  price: number;
  landArea: number;
  buildingArea: number;
  structure: BuildingStructure;
  builtYear: number;
  builtMonth?: number;
  linePrice: number;
  zoning?: Zoning;
  roadContact?: RoadContact;
  frontRoadWidth?: number;
  canRebuild?: boolean;
  setback?: boolean;
  isLeasehold?: boolean;
  leaseholdRatio?: number;
  prefecture?: string;
}
