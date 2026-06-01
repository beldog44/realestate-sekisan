import type { Property } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { formatManEn } from "@/lib";

interface AirbnbTabProps {
  property: Property;
}

const LEGAL_TYPE_COLORS = {
  旅館業: "bg-green-100 text-green-700",
  特区民泊: "bg-blue-100 text-blue-700",
  民泊新法: "bg-yellow-100 text-yellow-700",
  困難: "bg-red-100 text-red-700",
};

export function AirbnbTab({ property }: AirbnbTabProps) {
  const ab = property.airbnb;
  const r = property.raw;

  if (!ab) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        積算タブで計算を実行すると民泊評価が表示されます
      </div>
    );
  }

  // 民泊収入試算（スコアに応じて動的計算）
  const estimatedNightlyRate =
    ab.legalType === "旅館業" ? 15000 :
    ab.locationScore >= 20 ? 12000 :
    ab.touristRouteScore >= 12 ? 10000 : 7000;

  const occupancyRate =
    ab.legalType === "特区民泊" ? 0.75 :
    ab.legalType === "旅館業" ? 0.70 : 0.55;

  const estimatedMonthlyRevenue = estimatedNightlyRate * 30 * occupancyRate;
  const monthlyRent = r.assumedRent ?? 0;
  const airbnbPremium = monthlyRent > 0 ? estimatedMonthlyRevenue / monthlyRent : 0;

  return (
    <div className="space-y-4">
      {/* 総合民泊スコア */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-700">民泊転用適性スコア</h3>
          <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${LEGAL_TYPE_COLORS[ab.legalType]}`}>
            {ab.legalType}
          </div>
        </div>
        <div className="text-2xl font-bold text-center text-gray-800 mb-3">
          {ab.totalScore}<span className="text-sm font-normal text-gray-400">/114</span>
        </div>
        <div className="space-y-2">
          <ScoreBar label="用途地域" score={ab.zoningScore} max={25} />
          <ScoreBar label="立地" score={ab.locationScore} max={25} />
          <ScoreBar label="観光地性" score={ab.touristRouteScore} max={15} />
          <ScoreBar label="インバウンド" score={ab.inboundDemandScore} max={15} />
          <ScoreBar label="ホテル単価" score={ab.hotelPriceScore} max={10} />
          <ScoreBar label="運営効率" score={ab.operationalScore} max={8} />
          <ScoreBar label="法的形態" score={ab.legalTypeScore} max={20} />
        </div>
      </div>

      {/* 収入試算 */}
      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
        <h3 className="text-xs font-bold text-yellow-700 mb-2">民泊収入試算（参考）</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-500">想定宿泊単価</div>
            <div className="font-bold">{estimatedNightlyRate.toLocaleString()}円/泊</div>
          </div>
          <div>
            <div className="text-gray-500">稼働率</div>
            <div className="font-bold">{(occupancyRate * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-gray-500">想定月収</div>
            <div className="font-bold text-green-700">{formatManEn(estimatedMonthlyRevenue)}</div>
          </div>
          {monthlyRent > 0 && (
            <div>
              <div className="text-gray-500">長期賃料比</div>
              <div className={`font-bold ${airbnbPremium >= 1.3 ? "text-green-700" : "text-orange-600"}`}>
                {airbnbPremium.toFixed(1)}倍
              </div>
            </div>
          )}
        </div>
        <p className="text-2xs text-gray-400 mt-2">
          ※ 試算値。実際の収入は立地・管理形態・規制により大きく異なります
        </p>
      </div>

      {/* 注意事項 */}
      {ab.notes.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-2">判定メモ</h3>
          <ul className="space-y-1">
            {ab.notes.map((note, i) => (
              <li key={i} className="text-xs text-gray-600">{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 民泊法制度解説 */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <h3 className="text-xs font-bold text-gray-600 mb-2">民泊制度サマリー</h3>
        <div className="space-y-1 text-xs text-gray-500">
          <div>🏠 <strong>民泊新法</strong>: 年間180日制限、全国対応</div>
          <div>🏙️ <strong>特区民泊</strong>: 大田区・大阪市等、2泊3日以上</div>
          <div>🏨 <strong>旅館業法</strong>: 日数制限なし、許可取得要</div>
        </div>
      </div>
    </div>
  );
}
