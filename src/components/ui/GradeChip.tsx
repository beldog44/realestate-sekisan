import type { ScoreCard } from "@/types";
import { getGradeColor } from "@/lib";

interface GradeChipProps {
  grade: ScoreCard["grade"];
  score?: number;
  size?: "sm" | "lg";
}

export function GradeChip({ grade, score, size = "sm" }: GradeChipProps) {
  const colorClass = getGradeColor(grade);
  const sizeClass = size === "lg" ? "text-3xl w-16 h-16" : "text-lg w-10 h-10";
  return (
    <div className={`inline-flex flex-col items-center justify-center rounded-lg font-bold ${sizeClass} ${colorClass}`}>
      <span>{grade}</span>
      {score !== undefined && (
        <span className="text-xs font-normal">{score}</span>
      )}
    </div>
  );
}
