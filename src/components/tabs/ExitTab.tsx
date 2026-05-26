import type { Property } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";

interface ExitTabProps {
  property: Property;
}

export function ExitTab({ property }: ExitTabProps) {
  const exit = property.exit;

  if (!exit) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        積算タブで計算を実行すると出口戦略評価が表示されます
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-700">出口戦略スコア</h3>
          <div className="text-sm font-bold text-gray-800">
            総合: <span className="text-blue-700">{exit.totalScore}</span>/100
          </div>
        </div>
        <div className="bg-blue-50 rounded p-2 mb-3 text-center">
          <div className="text-xs text-gray-500">推奨出口</div>
          <div className="text-sm font-bold text-blue-700">{exit.recommendedExit}</div>
        </div>
        <div className="space-y-2">
          <ScoreBar label="実需出口" score={exit.endUserExitScore} />
          <ScoreBar label="投資家出口" score={exit.investorExitScore} />
          <ScoreBar label="民泊出口" score={exit.airbnbExitScore} />
          <ScoreBar label="更地出口" score={exit.landOnlyExitScore} />
          <ScoreBar label="建替え余地" score={exit.redevelopmentScore} />
          <ScoreBar label="流動性" score={exit.liquidityScore} />
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-2">土地値依存度</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${exit.landValueDependency}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 w-12 text-right">
            {exit.landValueDependency}%
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {exit.landValueDependency >= 60 ? "土地値が高い：長期保有・更地出口に有利" :
           exit.landValueDependency >= 40 ? "土地・建物バランス型" :
           "建物依存型：築古時に価値下落リスク"}
        </p>
      </div>

      {exit.notes.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-2">出口戦略メモ</h3>
          <ul className="space-y-1">
            {exit.notes.map((note, i) => (
              <li key={i} className="text-xs text-gray-600">{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
