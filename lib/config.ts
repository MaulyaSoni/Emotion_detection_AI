// Configuration for the ML backend
// The Python FastAPI server should be running on this URL

export const ML_CONFIG = {
  // The URL where your Python ML backend is running
  // For development, this is typically localhost:8001
  // For production, replace with your actual backend URL
  BACKEND_URL: process.env.NEXT_PUBLIC_ML_BACKEND_URL || "http://localhost:8001",

  // API endpoints
  ENDPOINTS: {
    ANALYZE_TEXT: "/api/analyze/text",
    ANALYZE_IMAGE: "/api/analyze/image",
    ANALYZE_FRAME: "/api/analyze/frame",
    HEALTH: "/api/health",
  },

  // Emotion labels matching the model output order
  EMOTION_LABELS: ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"] as const,

  // Confidence threshold (same as Python model)
  CONFIDENCE_THRESHOLD: 0.25,

  // Frame analysis interval for webcam (ms)
  FRAME_INTERVAL: 500,
}
