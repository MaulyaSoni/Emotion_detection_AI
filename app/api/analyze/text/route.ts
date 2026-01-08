import { NextResponse } from "next/server"
import { ML_CONFIG } from "@/lib/config"
import { analyzeTextLocally } from "@/lib/emotion-api"
import type { EmotionResult } from "@/lib/emotion-types"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 })
    }

    // Try ML backend first
    try {
      const backendResponse = await fetch(`${ML_CONFIG.BACKEND_URL}${ML_CONFIG.ENDPOINTS.ANALYZE_TEXT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(5000),
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        return NextResponse.json(data)
      }
    } catch {
      // ML backend unavailable, use fallback
      console.log("[v0] ML backend unavailable, using local text analysis")
    }

    // Fallback to local analysis
    const result: EmotionResult = analyzeTextLocally(text)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Text analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
