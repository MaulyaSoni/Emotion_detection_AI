interface ConfidenceMeterProps {
  confidence: number
  status: "confident" | "low"
}

export function ConfidenceMeter({ confidence, status }: ConfidenceMeterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Confidence Level</span>
        <span className={`font-mono font-bold ${status === "confident" ? "text-accent" : "text-chart-5"}`}>
          {confidence.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            status === "confident"
              ? "bg-gradient-to-r from-accent to-primary"
              : "bg-gradient-to-r from-chart-5 to-chart-4"
          }`}
          style={{ width: `${confidence}%` }}
        />
        {/* Animated glow effect */}
        <div
          className={`absolute top-0 h-full w-8 rounded-full blur-sm transition-all duration-1000 ${
            status === "confident" ? "bg-accent/50" : "bg-chart-5/50"
          }`}
          style={{ left: `calc(${confidence}% - 1rem)` }}
        />
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
          status === "confident" ? "bg-accent/10 text-accent" : "bg-chart-5/10 text-chart-5"
        }`}
      >
        <div className={`h-2 w-2 rounded-full pulse-glow ${status === "confident" ? "bg-accent" : "bg-chart-5"}`} />
        {status === "confident" ? "Model confident in prediction" : "Low confidence – ambiguous emotion"}
      </div>
    </div>
  )
}
