const SENTIMENT_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  positive: { emoji: "😊", label: "Positivo", color: "text-green-600" },
  neutral: { emoji: "😐", label: "Neutro", color: "text-text-tertiary" },
  negative: { emoji: "😟", label: "Negativo", color: "text-red-600" },
};

interface SentimentIndicatorProps {
  sentiment?: string | null;
  showLabel?: boolean;
}

export function SentimentIndicator({
  sentiment,
  showLabel = false,
}: SentimentIndicatorProps) {
  const config = SENTIMENT_CONFIG[sentiment ?? "neutral"] ?? {
    emoji: "😐",
    label: "Neutro",
    color: "text-text-tertiary",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.color}`}
      title={config.label}
    >
      <span>{config.emoji}</span>
      {showLabel && <span className="text-xs">{config.label}</span>}
    </span>
  );
}
