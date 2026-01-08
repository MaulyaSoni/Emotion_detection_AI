import { NextResponse } from "next/server"
import { ML_CONFIG } from "@/lib/config"
import { generateDemoEmotion, transformBackendEmotionResult } from "@/lib/emotion-api"
import type { EmotionResult } from "@/lib/emotion-types"

export async function POST(request: Request) {
  try {
    const { frame } = await request.json()

    if (!frame || typeof frame !== "string") {
      return NextResponse.json({ error: "Invalid frame input" }, { status: 400 })
    }

    // Try ML backend first
    try {
      const backendResponse = await fetch(ML_CONFIG.ENDPOINTS.ANALYZE_FRAME, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
        signal: AbortSignal.timeout(2000), // Shorter timeout for real-time
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        const result: EmotionResult = transformBackendEmotionResult(data, "webcam")
        return NextResponse.json(result)
      }
    } catch {
      // ML backend unavailable or timeout for real-time
    }

    // Fallback to demo mode
    const result: EmotionResult = generateDemoEmotion("webcam")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Frame analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
