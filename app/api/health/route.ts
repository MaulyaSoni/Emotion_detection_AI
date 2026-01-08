import { NextResponse } from "next/server"
import { ML_CONFIG } from "@/lib/config"

export async function GET() {
  let backendStatus = "disconnected"

  try {
    const response = await fetch(`${ML_CONFIG.BACKEND_URL}${ML_CONFIG.ENDPOINTS.HEALTH}`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    })

    if (response.ok) {
      backendStatus = "connected"
    }
  } catch {
    backendStatus = "disconnected"
  }

  return NextResponse.json({
    status: "ok",
    frontend: "connected",
    mlBackend: backendStatus,
    backendUrl: ML_CONFIG.BACKEND_URL,
    timestamp: new Date().toISOString(),
  })
}
