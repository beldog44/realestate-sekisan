import { getScoreColor } from "@/lib";

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
  compact?: boolean;
}

export function ScoreBar({ label, score, max = 100, compact = false }: ScoreBarProps) {
  const pct = Math.round((score / max) * 100);
  const colorClass = getScoreColor(pct);
  const bgClass =
    pct >= 75 ? "bg-green-500" :
    pct >= 55 ? "bg-yellow-500" :
    pct >= 35 ? "bg-orange-500" : "bg-red-500";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${bgClass}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs font-bold w-8 text-right ${colorClass}`}>{score}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold ${colorClass}`}>{score}<span className="text-xs font-normal text-gray-400">/{max}</span></span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${bgClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
