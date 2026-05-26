import type { Property } from "@/types";
import { formatManEn, formatRatio } from "@/lib";

interface LoanTabProps {
  property: Property;
}

function FitBadge({ level }: { level: "高" | "中" | "低" }) {
  const colors = {
    高: "bg-green-100 text-green-700 border-green-200",
    中: "bg-yellow-100 text-yellow-700 border-yellow-200",
    低: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${colors[level]}`}>
      {level}
    </span>
  );
}

export function LoanTab({ property }: LoanTabProps) {
  const loan = property.loan;

  if (!loan) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        積算タブで計算を実行すると融資評価が表示されます
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 融資キーメトリクス */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-3">融資評価サマリー</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 mb-1">積算比率</div>
            <div className={`text-lg font-bold ${loan.sekisanRatio <= 1 ? "text-green-700" : "text-red-600"}`}>
              {formatRatio(loan.sekisanRatio)}
            </div>
            <div className="text-gray-400 text-2xs">{loan.sekisanRatio <= 1 ? "積算内" : "積算オーバー"}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 mb-1">土地値割合</div>
            <div className="text-lg font-bold text-gray-800">{formatRatio(loan.landValueRatio)}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 mb-1">融資想定額</div>
            <div className="text-sm font-bold text-blue-700">{formatManEn(loan.estimatedLoanAmount)}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 mb-1">担保余力</div>
            <div className={`text-sm font-bold ${loan.collateralCapacity > 0 ? "text-green-700" : "text-red-600"}`}>
              {loan.collateralCapacity >= 0 ? "+" : ""}{formatManEn(Math.abs(loan.collateralCapacity))}
            </div>
          </div>
        </div>
      </div>

      {/* ローン可能性 */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-2">ローン可能性</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span>フルローン可能性</span>
            <FitBadge level={loan.fullLoanPossibility} />
          </div>
          <div className="flex justify-between items-center">
            <span>オーバーローン可能性</span>
            <FitBadge level={loan.overLoanPossibility} />
          </div>
        </div>
      </div>

      {/* 金融機関適性 */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-2">金融機関適性（概算）</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">地方銀行</div>
              <div className="text-gray-400 text-2xs">積算重視・収益物件</div>
            </div>
            <FitBadge level={loan.localBankFit} />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">信用金庫</div>
              <div className="text-gray-400 text-2xs">エリア密着・小規模</div>
            </div>
            <FitBadge level={loan.creditUnionFit} />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">ノンバンク</div>
              <div className="text-gray-400 text-2xs">築古・再建築不可対応</div>
            </div>
            <FitBadge level={loan.nonBankFit} />
          </div>
        </div>
        <p className="text-2xs text-gray-400 mt-2">
          ※ 概算判定。実際の融資可否は金融機関の審査基準によります
        </p>
      </div>

      {/* ノート */}
      {loan.notes.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-2">融資判断メモ</h3>
          <ul className="space-y-1">
            {loan.notes.map((note, i) => (
              <li key={i} className="text-xs text-gray-600">{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
