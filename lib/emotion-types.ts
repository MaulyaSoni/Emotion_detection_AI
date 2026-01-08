export type EmotionType = "Angry" | "Disgust" | "Fear" | "Happy" | "Sad" | "Surprise" | "Neutral"

export interface EmotionDistribution {
  Angry: number
  Disgust: number
  Fear: number
  Happy: number
  Sad: number
  Surprise: number
  Neutral: number
}

export interface EmotionResult {
  primaryEmotion: EmotionType
  confidence: number
  distribution: EmotionDistribution
  timestamp: number
  source: "text" | "image" | "webcam"
  faceData?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface MLBackendResponse {
  emotion: EmotionType
  confidence: number
  predictions: number[] // [Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral]
  face_detected: boolean
  face_bbox?: [number, number, number, number] // [x, y, w, h]
}

export interface AnalysisRequest {
  type: "text" | "image" | "frame"
  data: string // text content or base64 encoded image
}
