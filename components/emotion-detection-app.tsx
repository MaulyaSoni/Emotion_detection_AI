"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InputTabs } from "@/components/input-tabs"
import { ResultsPanel } from "@/components/results-panel"
import { AnimatedBackground } from "@/components/animated-background"
import { ClientOnly } from "@/components/client-only"
import type { EmotionResult } from "@/lib/emotion-types"

export function EmotionDetectionApp() {
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([])

  const handleEmotionDetected = (result: EmotionResult) => {
    setEmotionResult(result)
    setEmotionHistory((prev) => {
      const newHistory = [...prev, result]
      return newHistory.slice(-20)
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden perspective-container">
      <AnimatedBackground />
      <div className="scanline" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2 stagger-children">
            <ClientOnly>
              <InputTabs
                onEmotionDetected={handleEmotionDetected}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            </ClientOnly>
            <ClientOnly>
              <ResultsPanel result={emotionResult} isAnalyzing={isAnalyzing} emotionHistory={emotionHistory} />
            </ClientOnly>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
