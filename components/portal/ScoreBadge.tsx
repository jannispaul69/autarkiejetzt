import { Badge } from "@/components/ui/badge";

interface Props {
  grade: string | null;
  score: number | null;
}

export default function ScoreBadge({ grade, score }: Props) {
  if (!grade || score === null) {
    return (
      <Badge variant="secondary" className="font-mono text-xs">
        –
      </Badge>
    );
  }

  const cfg = {
    A: "bg-green-100 text-green-800 border-green-200",
    B: "bg-amber-100 text-amber-800 border-amber-200",
    C: "bg-gray-100 text-gray-600 border-gray-200",
  }[grade] ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg}`}
    >
      {grade} · {score}
    </span>
  );
}
