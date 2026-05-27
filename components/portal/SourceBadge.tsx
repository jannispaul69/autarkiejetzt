interface Props {
  source: string | null | undefined;
}

const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  autarkiejetzt: {
    label: "Hauptseite",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  jetzt: {
    label: "Schnell",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  "solar-check": {
    label: "Solar-Check",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "meta-lead-ad": {
    label: "Meta Lead Ad",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

export default function SourceBadge({ source }: Props) {
  const cfg = source ? SOURCE_CONFIG[source] : null;

  if (!cfg) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
        Unbekannt
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
