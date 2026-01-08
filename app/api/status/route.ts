import { NextResponse } from "next/server"

export async function GET() {
  const info = {
    frontend_url: "http://localhost:8000",
    backend_url: "http://localhost:8001",
    timestamp: new Date().toISOString(),
    checks: {
      frontend: "OK",
      backend_configured: true,
      endpoints: {
        health: "/api/health",
        analyze_text: "/api/analyze/text",
        analyze_image: "/api/analyze/image",
        analyze_frame: "/api/analyze/frame",
        webcam_status: "/api/webcam/status",
      },
      camera_requirements: {
        note: "Camera requires user permission and HTTPS (or localhost)",
        supported_browsers: ["Chrome", "Firefox", "Edge", "Safari 14.1+"],
        common_issues: [
          "Permission denied - Check browser settings and click Allow",
          "Camera in use - Close other apps using the camera",
          "Not supported - Use Chrome, Firefox, or Edge",
        ],
      },
    },
  }

  return NextResponse.json(info)
}
