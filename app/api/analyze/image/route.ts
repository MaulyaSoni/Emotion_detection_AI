import { NextResponse } from "next/server"
import { ML_CONFIG } from "@/lib/config"
import { generateDemoEmotion, transformBackendEmotionResult } from "@/lib/emotion-api"
import type { EmotionResult } from "@/lib/emotion-types"

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Invalid image input" }, { status: 400 })
    }

    // Try ML backend first
    try {
      const backendResponse = await fetch(`${ML_CONFIG.BACKEND_URL}${ML_CONFIG.ENDPOINTS.ANALYZE_IMAGE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
        signal: AbortSignal.timeout(10000),
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        const result: EmotionResult = transformBackendEmotionResult(data, "image")
        return NextResponse.json(result)
      }
    } catch {
      console.log("[v0] ML backend unavailable, using demo mode for image")
    }

    // Fallback to demo mode
    const result: EmotionResult = generateDemoEmotion("image")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Image analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
