"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, Zap } from "lucide-react"
import { analyzeText } from "@/lib/emotion-api"
import type { EmotionResult } from "@/lib/emotion-types"

interface TextAnalysisProps {
  onEmotionDetected: (result: EmotionResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
}

export function TextAnalysis({ onEmotionDetected, isAnalyzing, setIsAnalyzing }: TextAnalysisProps) {
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeText(text)
      onEmotionDetected(result)
    } catch (err) {
      setError("Analysis failed. Please try again.")
      console.error("Text analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Textarea
          placeholder="Type a sentence to analyze emotion..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="relative min-h-[160px] resize-none bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground input-glow focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground flex items-center gap-2">
          <Zap className={`h-3 w-3 ${text.length > 0 ? "text-accent animate-pulse" : ""}`} />
          <span className={text.length > 100 ? "text-accent" : ""}>{text.length}</span> characters
        </div>
      </div>

      {error && <p className="text-sm text-destructive animate-slide-up">{error}</p>}

      <Button
        onClick={handleAnalyze}
        disabled={!text.trim() || isAnalyzing}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-3d neon-glow-purple ripple-effect transition-all duration-300 h-12 text-base font-semibold"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing Neural Patterns...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze Emotion
          </>
        )}
      </Button>

      <div className="rounded-xl bg-secondary/30 p-4 border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 cursor-default">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enter any text to detect emotional sentiment. The AI analyzes linguistic patterns, word choices, and
          contextual cues to determine the underlying emotion.
        </p>
      </div>
    </div>
  )
}
