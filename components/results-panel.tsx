"use client"

import { EmotionBadge } from "@/components/emotion-badge"
import { ConfidenceMeter } from "@/components/confidence-meter"
import { EmotionChart } from "@/components/emotion-chart"
import { EmotionTimeline } from "@/components/emotion-timeline"
import { Brain, BarChart3, Clock, Waves } from "lucide-react"
import type { EmotionResult } from "@/lib/emotion-types"

interface ResultsPanelProps {
  result: EmotionResult | null
  isAnalyzing: boolean
  emotionHistory: EmotionResult[]
}

export function ResultsPanel({ result, isAnalyzing, emotionHistory }: ResultsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 neon-glow-cyan card-3d neon-glow-cyan-hover transition-all duration-500">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent pulse-glow" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Analysis Result</span>
          <div className="ml-auto flex items-center gap-1">
            <Waves className="h-4 w-4 text-accent/50 animate-pulse" />
          </div>
        </div>

        {!result && !isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative float-animation">
              <div className="absolute inset-0 rounded-full bg-muted/30 blur-2xl scale-150" />
              <Brain className="relative mb-4 h-20 w-20 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground">Select an input mode and provide data to analyze</p>
            <div className="mt-4 flex gap-2">
              {["Text", "Image", "Webcam"].map((mode) => (
                <span
                  key={mode}
                  className="px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground border border-border/30"
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse scale-150" />
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl animate-ping scale-100" />
              <Brain className="relative h-20 w-20 text-primary animate-pulse" />
            </div>
            <p className="mt-6 text-primary font-medium text-lg">Processing Neural Analysis...</p>
            <p className="mt-2 text-sm text-muted-foreground">Detecting emotional patterns</p>
            <div className="mt-4 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          result && (
            <div className="space-y-6 animate-slide-up">
              <EmotionBadge emotion={result.primaryEmotion} />
              <ConfidenceMeter confidence={result.confidence} status={result.confidence >= 70 ? "confident" : "low"} />
            </div>
          )
        )}
      </div>

      {result && (
        <div className="glass rounded-2xl p-6 card-3d hover:neon-glow-purple transition-all duration-500 animate-slide-up">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Emotion Distribution
            </span>
          </div>
          <EmotionChart distribution={result.distribution} />
        </div>
      )}

      {emotionHistory.length > 1 && (
        <div className="glass rounded-2xl p-6 card-3d hover:neon-glow-cyan transition-all duration-500 animate-slide-up">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Emotion Timeline</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-accent/20 text-xs text-accent font-mono">
              {emotionHistory.length} readings
            </span>
          </div>
          <EmotionTimeline history={emotionHistory} />
        </div>
      )}
    </div>
  )
}
