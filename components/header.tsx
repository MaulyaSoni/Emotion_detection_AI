import type React from "react"
import { Brain, Scan, Activity, Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative float-animation">
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-xl group-hover:bg-primary/50 transition-all duration-500" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl glass neon-glow-purple neon-glow-purple-hover transition-all duration-500 group-hover:scale-110">
                <Brain className="h-7 w-7 text-primary icon-spin-hover" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-shimmer flex items-center gap-2">
                Emotion Detection AI
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              </h1>
              <p className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
                Real-time human emotion analysis
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <StatusIndicator icon={<Scan className="h-4 w-4" />} label="System Active" status="online" />
            <StatusIndicator icon={<Activity className="h-4 w-4" />} label="AI Ready" status="online" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px holographic" />
    </header>
  )
}

function StatusIndicator({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode
  label: string
  status: "online" | "offline" | "processing"
}) {
  return (
    <div className="flex items-center gap-2 text-sm group cursor-default magnetic-hover hover:scale-105 transition-transform">
      <div
        className={`flex items-center gap-1.5 ${status === "online" ? "text-accent" : "text-muted-foreground"} group-hover:text-accent transition-colors`}
      >
        <span className="group-hover:animate-pulse">{icon}</span>
        <span className="hidden lg:inline">{label}</span>
      </div>
      <div
        className={`h-2 w-2 rounded-full pulse-glow ${
          status === "online" ? "bg-accent neon-glow-cyan" : status === "processing" ? "bg-primary" : "bg-muted"
        }`}
      />
    </div>
  )
}
