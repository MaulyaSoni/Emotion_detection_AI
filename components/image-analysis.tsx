"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, X, ImageIcon, Scan } from "lucide-react"
import { analyzeImage } from "@/lib/emotion-api"
import type { EmotionResult } from "@/lib/emotion-types"

interface ImageAnalysisProps {
  onEmotionDetected: (result: EmotionResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
}

export function ImageAnalysis({ onEmotionDetected, isAnalyzing, setIsAnalyzing }: ImageAnalysisProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleAnalyze = async () => {
    if (!imageBase64 || isAnalyzing) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeImage(imageBase64)
      onEmotionDetected(result)
    } catch (err) {
      setError("Image analysis failed. Please try again.")
      console.error("Image analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setImageBase64(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {!imageUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-500 upload-zone-hover group ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border/50 bg-input/30 hover:border-primary/50 hover:bg-input/50"
          }`}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className={`relative mb-3 ${isDragging ? "animate-bounce" : "group-hover:float-animation"}`}>
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Upload
              className={`relative h-12 w-12 transition-all duration-300 ${isDragging ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"}`}
            />
          </div>
          <p className="relative text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Drop an image here or click to upload
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground/70">Supports JPG, PNG, WebP</p>

          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg group-hover:border-primary/60 transition-colors" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg group-hover:border-primary/60 transition-colors" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg group-hover:border-primary/60 transition-colors" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg group-hover:border-primary/60 transition-colors" />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl bg-secondary/30 group">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Uploaded face"
            className="h-[200px] w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Scan className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-xs text-accent font-mono">READY</span>
          </div>

          <button
            onClick={clearImage}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-2 text-foreground transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground hover:scale-110 hover:rotate-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive animate-slide-up">{error}</p>}

      <Button
        onClick={handleAnalyze}
        disabled={!imageBase64 || isAnalyzing}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-3d neon-glow-purple ripple-effect transition-all duration-300 h-12 text-base font-semibold"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Scanning Facial Features...
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-5 w-5" />
            Analyze Image
          </>
        )}
      </Button>

      <div className="rounded-xl bg-secondary/30 p-4 border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 cursor-default">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Upload a clear face image for best results. The AI detects facial landmarks and analyzes micro-expressions to
          determine emotional state.
        </p>
      </div>
    </div>
  )
}
