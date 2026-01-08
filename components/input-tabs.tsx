"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextAnalysis } from "@/components/text-analysis"
import { ImageAnalysis } from "@/components/image-analysis"
import { WebcamAnalysis } from "@/components/webcam-analysis"
import { MessageSquare, ImageIcon, Video } from "lucide-react"
import type { EmotionResult } from "@/lib/emotion-types"

interface InputTabsProps {
  onEmotionDetected: (result: EmotionResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
}

export function InputTabs({ onEmotionDetected, isAnalyzing, setIsAnalyzing }: InputTabsProps) {
  const [activeTab, setActiveTab] = useState("text")

  return (
    <div className="glass rounded-2xl p-6 neon-glow-purple card-3d neon-glow-purple-hover transition-all duration-500">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary pulse-glow" />
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Input Mode</span>
        <div className="ml-auto flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1 w-6 rounded-full bg-primary/30" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger
            value="text"
            className="flex items-center gap-2 tab-3d rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary ripple-effect"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Text</span>
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="flex items-center gap-2 tab-3d rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary ripple-effect"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Image</span>
          </TabsTrigger>
          <TabsTrigger
            value="webcam"
            className="flex items-center gap-2 tab-3d rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary ripple-effect"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Webcam</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6 animate-slide-up">
          <TextAnalysis
            onEmotionDetected={onEmotionDetected}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        </TabsContent>

        <TabsContent value="image" className="mt-6 animate-slide-up">
          <ImageAnalysis
            onEmotionDetected={onEmotionDetected}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        </TabsContent>

        <TabsContent value="webcam" className="mt-6 animate-slide-up">
          <WebcamAnalysis
            onEmotionDetected={onEmotionDetected}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
