import type { LoanAssessment, SekisanResult } from "@/types";

interface LoanInput {
  price: number;
  sekisan: SekisanResult;
  assumedRent?: number;
  grossYield?: number;
  prefecture?: string;
  structure?: string;
  builtYear?: number;
}

export function calcLoanAssessment(input: LoanInput): LoanAssessment {
  const notes: string[] = [];
  const { price, sekisan, assumedRent, builtYear } = input;

  const sekisanRatio = sekisan.totalSekisan > 0 ? price / sekisan.totalSekisan : 999;
  const landValueRatio = sekisan.landValueRatio;

  // 融資想定額（積算の80%が基本）
  const estimatedLoanAmount = sekisan.totalSekisan * 0.8;

  // フルローン可能性
  const fullLoanPossibility: LoanAssessment["fullLoanPossibility"] =
    sekisanRatio <= 0.8 ? "高" :
    sekisanRatio <= 1.0 ? "中" : "低";

  // オーバーローン可能性
  const overLoanPossibility: LoanAssessment["overLoanPossibility"] =
    sekisanRatio <= 0.7 ? "高" :
    sekisanRatio <= 0.9 ? "中" : "低";

  // 担保余力
  const collateralCapacity = Math.max(0, sekisan.totalSekisan * 0.8 - price);

  // 地銀適性（積算重視、地方物件）
  const localBankFit: LoanAssessment["localBankFit"] =
    sekisanRatio <= 0.9 && landValueRatio >= 0.4 ? "高" :
    sekisanRatio <= 1.1 ? "中" : "低";

  // 信金適性（エリア密着、小規模）
  const creditUnionFit: LoanAssessment["creditUnionFit"] =
    price <= 30000000 && sekisanRatio <= 1.0 ? "高" :
    sekisanRatio <= 1.2 ? "中" : "低";

  // ノンバンク適性（築古・再建築不可でも対応）
  const currentYear = new Date().getFullYear();
  const elapsedYears = builtYear ? currentYear - builtYear : 0;
  const nonBankFit: LoanAssessment["nonBankFit"] =
    elapsedYears > 30 || sekisanRatio > 1.2 ? "高" :
    sekisanRatio > 1.0 ? "中" : "低";

  if (sekisanRatio <= 0.7) notes.push("✅ 積算割れ：積算内購入で融資引きやすい");
  if (sekisanRatio > 1.2) notes.push("⚠️ 積算オーバー：融資難易度高め");
  if (landValueRatio >= 0.6) notes.push("✅ 土地値比率高い：担保評価良好");
  if (assumedRent && price > 0) {
    const grossYield = (assumedRent * 12) / price;
    if (grossYield >= 0.1) notes.push("✅ 利回り10%超：収益評価も加算可能");
  }

  return {
    sekisanRatio,
    landValueRatio,
    estimatedLoanAmount,
    fullLoanPossibility,
    overLoanPossibility,
    collateralCapacity,
    localBankFit,
    creditUnionFit,
    nonBankFit,
    notes,
  };
}
