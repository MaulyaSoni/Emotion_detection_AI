"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Camera, CameraOff, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { analyzeFrame, checkBackendHealth } from "@/lib/emotion-api"
import { ML_CONFIG } from "@/lib/config"
import type { EmotionResult } from "@/lib/emotion-types"

interface WebcamAnalysisProps {
  onEmotionDetected: (result: EmotionResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
}

export function WebcamAnalysis({ onEmotionDetected, setIsAnalyzing }: WebcamAnalysisProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isRealtime, setIsRealtime] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const animationRef = useRef<number>()
  const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestPendingRef = useRef(false)
  const attachStreamToVideo = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return
    if (videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
    videoRef.current
      .play()
      .catch(() => {
        // Some browsers block autoplay; user interaction already happened via Start Camera button.
      })
  }, [])

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkBackendHealth()
      setBackendConnected(connected)
    }
    checkConnection()
    const interval = setInterval(checkConnection, 10000) // Check every 10s
    return () => clearInterval(interval)
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser does not support camera access. Please use Chrome, Firefox, or Edge.")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream
      setIsStreaming(true)
      attachStreamToVideo()
    } catch (err) {
      console.error("Camera error:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      
      if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        setError("Camera access denied. Please allow camera permissions in your browser settings.")
      } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("no camera")) {
        setError("No camera device found. Please connect a camera to your computer.")
      } else if (errorMessage.includes("NotReadableError")) {
        setError("Camera is in use by another application. Please close other apps using the camera.")
      } else {
        setError(`Camera error: ${errorMessage}`)
      }
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
      analysisIntervalRef.current = null
    }
    requestPendingRef.current = false
    setIsStreaming(false)
    setIsRealtime(false)
    setCurrentEmotion(null)
    setFps(0)
  }, [])

  useEffect(() => {
    if (isStreaming) {
      attachStreamToVideo()
    }
  }, [isStreaming, attachStreamToVideo])

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return null
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null

    const { videoWidth, videoHeight } = video
    if (!videoWidth || !videoHeight) return null

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth
      canvas.height = videoHeight
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.8)
  }, [])

  const drawFaceOverlay = useCallback((ctx: CanvasRenderingContext2D, result: EmotionResult) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Use face data from API if available, otherwise estimate center
    const faceData = result.faceData || {
      x: (canvas.width - canvas.width * 0.4) / 2,
      y: (canvas.height - canvas.height * 0.5) / 2.5,
      width: canvas.width * 0.4,
      height: canvas.height * 0.5,
    }

    const { x, y, width: boxWidth, height: boxHeight } = faceData

    // Draw bounding box
    ctx.strokeStyle = "rgba(139, 92, 246, 0.8)"
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, boxWidth, boxHeight)

    // Draw corner accents
    const cornerLength = 20
    ctx.strokeStyle = "rgba(34, 211, 238, 1)"
    ctx.lineWidth = 3

    // Top-left
    ctx.beginPath()
    ctx.moveTo(x, y + cornerLength)
    ctx.lineTo(x, y)
    ctx.lineTo(x + cornerLength, y)
    ctx.stroke()

    // Top-right
    ctx.beginPath()
    ctx.moveTo(x + boxWidth - cornerLength, y)
    ctx.lineTo(x + boxWidth, y)
    ctx.lineTo(x + boxWidth, y + cornerLength)
    ctx.stroke()

    // Bottom-left
    ctx.beginPath()
    ctx.moveTo(x, y + boxHeight - cornerLength)
    ctx.lineTo(x, y + boxHeight)
    ctx.lineTo(x + cornerLength, y + boxHeight)
    ctx.stroke()

    // Bottom-right
    ctx.beginPath()
    ctx.moveTo(x + boxWidth - cornerLength, y + boxHeight)
    ctx.lineTo(x + boxWidth, y + boxHeight)
    ctx.lineTo(x + boxWidth, y + boxHeight - cornerLength)
    ctx.stroke()

    // Draw emotion label
    ctx.font = "bold 16px Geist, sans-serif"
    ctx.fillStyle = "rgba(34, 211, 238, 1)"
    ctx.textAlign = "center"
    ctx.fillText(result.primaryEmotion.toUpperCase(), x + boxWidth / 2, y - 10)

    // Draw confidence bar
    const barWidth = 100
    const barHeight = 6
    const barX = x + (boxWidth - barWidth) / 2
    const barY = y - 30

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = "rgba(139, 92, 246, 0.9)"
    ctx.fillRect(barX, barY, barWidth * (result.confidence / 100), barHeight)
  }, [])

  const processFrame = useCallback(() => {
    if (!isRealtime || !videoRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Draw video frame
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

    // Calculate FPS
    frameCountRef.current++
    const now = Date.now()
    if (now - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
      lastTimeRef.current = now
    }

    // Draw overlay if we have a current emotion
    if (currentEmotion) {
      drawFaceOverlay(ctx, currentEmotion)
    }

    animationRef.current = requestAnimationFrame(processFrame)
  }, [isRealtime, currentEmotion, drawFaceOverlay])

  useEffect(() => {
    if (isRealtime && isStreaming) {
      setIsAnalyzing(true)
      processFrame()

      // Analyze frames at interval
      analysisIntervalRef.current = setInterval(async () => {
        if (requestPendingRef.current) {
          return
        }
        const frameData = captureFrame()
        if (!frameData) return

        requestPendingRef.current = true
        try {
          const result = await analyzeFrame(frameData)
          setCurrentEmotion(result)
          onEmotionDetected(result)
          setError(null)
        } catch (err) {
          console.error("Frame analysis error:", err)
          setError("Real-time analysis interrupted. Retrying...")
        } finally {
          requestPendingRef.current = false
        }
      }, ML_CONFIG.FRAME_INTERVAL)
    } else {
      setIsAnalyzing(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
        analysisIntervalRef.current = null
      }
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
        analysisIntervalRef.current = null
      }
      requestPendingRef.current = false
    }
  }, [isRealtime, isStreaming, processFrame, setIsAnalyzing, captureFrame, onEmotionDetected])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">ML Backend:</span>
        <div className="flex items-center gap-1.5">
          {backendConnected === null ? (
            <span className="text-muted-foreground">Checking...</span>
          ) : backendConnected ? (
            <>
              <Wifi className="h-3 w-3 text-accent" />
              <span className="text-accent">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-chart-5" />
              <span className="text-chart-5">Demo Mode</span>
            </>
          )}
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary/30">
        {!isStreaming ? (
          <div className="flex h-full flex-col items-center justify-center">
            {error ? (
              <>
                <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </>
            ) : (
              <>
                <Camera className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Camera not active</p>
              </>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${isRealtime ? "hidden" : ""}`}
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`h-full w-full object-cover ${isRealtime ? "" : "hidden"}`}
            />

            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* FPS Counter */}
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded bg-background/80 px-2 py-1 text-xs font-mono">
                <div className="h-2 w-2 rounded-full bg-accent pulse-glow" />
                <span className="text-accent">{fps} FPS</span>
              </div>

              {/* Recording indicator */}
              {isRealtime && (
                <div className="absolute top-3 right-3 flex items-center gap-2 rounded bg-destructive/80 px-2 py-1 text-xs font-mono text-destructive-foreground">
                  <div className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse" />
                  LIVE
                </div>
              )}

              {/* Current emotion */}
              {currentEmotion && isRealtime && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded bg-background/80 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Detected:</span>
                    <span className="font-bold text-primary">{currentEmotion.primaryEmotion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span
                      className={`font-mono text-sm ${
                        currentEmotion.confidence >= 70 ? "text-accent" : "text-chart-5"
                      }`}
                    >
                      {currentEmotion.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={isStreaming ? stopCamera : startCamera}
          variant={isStreaming ? "destructive" : "default"}
          className={!isStreaming ? "bg-primary hover:bg-primary/90 text-primary-foreground neon-glow-purple" : ""}
        >
          {isStreaming ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Real-time</span>
          <Switch checked={isRealtime} onCheckedChange={setIsRealtime} disabled={!isStreaming} />
        </div>
      </div>

      <div className="rounded-lg bg-secondary/30 p-3">
        <p className="text-xs text-muted-foreground">
          {backendConnected
            ? "ML backend connected. Real-time emotion detection is active with your TensorFlow model."
            : "Running in demo mode. Connect your Python ML backend for actual emotion detection."}
        </p>
      </div>
    </div>
  )
}
