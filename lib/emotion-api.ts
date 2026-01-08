import type { EmotionResult, EmotionType, EmotionDistribution } from "./emotion-types"
import { ML_CONFIG } from "./config"

const EMOTION_LABELS = ML_CONFIG.EMOTION_LABELS
const EMPTY_DISTRIBUTION: EmotionDistribution = {
  Angry: 0,
  Disgust: 0,
  Fear: 0,
  Happy: 0,
  Sad: 0,
  Surprise: 0,
  Neutral: 0,
}

// Convert ML backend predictions array to EmotionDistribution
function predictionsToDistribution(predictions: number[]): EmotionDistribution {
  const total = predictions.reduce((a, b) => a + b, 0)
  return {
    Angry: Math.round((predictions[0] / total) * 100),
    Disgust: Math.round((predictions[1] / total) * 100),
    Fear: Math.round((predictions[2] / total) * 100),
    Happy: Math.round((predictions[3] / total) * 100),
    Sad: Math.round((predictions[4] / total) * 100),
    Surprise: Math.round((predictions[5] / total) * 100),
    Neutral: Math.round((predictions[6] / total) * 100),
  }
}

// Check if ML backend is available
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_CONFIG.BACKEND_URL}${ML_CONFIG.ENDPOINTS.HEALTH}`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

// Analyze text emotion via API
export async function analyzeText(text: string): Promise<EmotionResult> {
  const response = await fetch("/api/analyze/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error("Text analysis failed")
  }

  return response.json()
}

// Analyze image emotion via API
export async function analyzeImage(imageData: string): Promise<EmotionResult> {
  const response = await fetch("/api/analyze/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData }),
  })

  if (!response.ok) {
    throw new Error("Image analysis failed")
  }

  return response.json()
}

// Analyze webcam frame via API (optimized for real-time)
export async function analyzeFrame(frameData: string): Promise<EmotionResult> {
  const response = await fetch("/api/analyze/frame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frame: frameData }),
  })

  if (!response.ok) {
    throw new Error("Frame analysis failed")
  }

  return response.json()
}

// Fallback: Local text analysis when backend is unavailable
export function analyzeTextLocally(text: string): EmotionResult {
  const lowerText = text.toLowerCase()

  const emotionKeywords: Record<EmotionType, string[]> = {
    Happy: [
      "happy",
      "joy",
      "love",
      "excited",
      "great",
      "wonderful",
      "amazing",
      "awesome",
      "fantastic",
      "delighted",
      "pleased",
      "glad",
      "cheerful",
      "thrilled",
      "elated",
      "good",
      "best",
      "beautiful",
    ],
    Sad: [
      "sad",
      "unhappy",
      "depressed",
      "cry",
      "tears",
      "miserable",
      "heartbroken",
      "grief",
      "sorrow",
      "disappointed",
      "lonely",
      "hopeless",
      "gloomy",
      "melancholy",
      "hurt",
      "pain",
    ],
    Angry: [
      "angry",
      "mad",
      "furious",
      "hate",
      "annoyed",
      "frustrated",
      "irritated",
      "outraged",
      "enraged",
      "livid",
      "bitter",
      "resentful",
      "hostile",
      "rage",
    ],
    Fear: [
      "afraid",
      "scared",
      "fear",
      "terrified",
      "anxious",
      "worried",
      "nervous",
      "panic",
      "dread",
      "frightened",
      "alarmed",
      "horrified",
      "petrified",
      "terror",
    ],
    Surprise: [
      "surprised",
      "shocked",
      "amazed",
      "astonished",
      "unexpected",
      "wow",
      "unbelievable",
      "startled",
      "stunned",
      "bewildered",
      "astounded",
      "whoa",
    ],
    Disgust: [
      "disgusted",
      "gross",
      "nasty",
      "revolting",
      "sick",
      "yuck",
      "ew",
      "horrible",
      "awful",
      "repulsed",
      "vile",
      "distaste",
    ],
    Neutral: ["okay", "fine", "normal", "alright", "so-so", "whatever", "meh", "indifferent", "average", "ordinary"],
  }

  const scores: EmotionDistribution = {
    Happy: 0,
    Sad: 0,
    Angry: 0,
    Fear: 0,
    Surprise: 0,
    Disgust: 0,
    Neutral: 10,
  }

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        scores[emotion as EmotionType] += 15
      }
    })
  })

  // Punctuation analysis
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 2) {
    scores.Happy += 5
    scores.Surprise += 5
    scores.Angry += 3
  }

  // Caps analysis (shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (capsRatio > 0.5 && text.length > 10) {
    scores.Angry += 10
    scores.Surprise += 5
  }

  // Normalize
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const distribution: EmotionDistribution = {
    Angry: Math.round((scores.Angry / total) * 100),
    Disgust: Math.round((scores.Disgust / total) * 100),
    Fear: Math.round((scores.Fear / total) * 100),
    Happy: Math.round((scores.Happy / total) * 100),
    Sad: Math.round((scores.Sad / total) * 100),
    Surprise: Math.round((scores.Surprise / total) * 100),
    Neutral: Math.round((scores.Neutral / total) * 100),
  }

  const primaryEmotion = Object.entries(distribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as EmotionType
  const maxScore = Math.max(...Object.values(distribution))
  const confidence = Math.min(95, maxScore + Math.random() * 15)

  return {
    primaryEmotion,
    confidence,
    distribution,
    timestamp: Date.now(),
    source: "text",
  }
}

// Fallback: Generate random emotion for demo when backend unavailable
export function generateDemoEmotion(source: "image" | "webcam"): EmotionResult {
  const rawScores = EMOTION_LABELS.map(() => Math.random() * 100)
  const total = rawScores.reduce((a, b) => a + b, 0)

  const distribution: EmotionDistribution = {
    Angry: Math.round((rawScores[0] / total) * 100),
    Disgust: Math.round((rawScores[1] / total) * 100),
    Fear: Math.round((rawScores[2] / total) * 100),
    Happy: Math.round((rawScores[3] / total) * 100),
    Sad: Math.round((rawScores[4] / total) * 100),
    Surprise: Math.round((rawScores[5] / total) * 100),
    Neutral: Math.round((rawScores[6] / total) * 100),
  }

  const primaryEmotion = Object.entries(distribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as EmotionType
  const maxScore = Math.max(...Object.values(distribution))
  const confidence = Math.min(98, maxScore + Math.random() * 20)

  return {
    primaryEmotion,
    confidence,
    distribution,
    timestamp: Date.now(),
    source,
    faceData: source === "webcam" ? { x: 150, y: 80, width: 200, height: 250 } : undefined,
  }
}

const EMOTION_LABEL_SET = new Set<EmotionType>(EMOTION_LABELS as readonly EmotionType[])

export function transformBackendEmotionResult(
  data: {
    emotion?: EmotionType | string
    confidence?: number
    predictions?: number[]
    face_bbox?: [number, number, number, number]
  },
  source: "image" | "webcam",
): EmotionResult {
  const predictions = Array.isArray(data.predictions)
    ? data.predictions.map((value) => (typeof value === "number" ? value : Number(value) || 0))
    : []

  const hasValidPredictions = predictions.length === EMOTION_LABELS.length
  let distribution: EmotionDistribution = { ...EMPTY_DISTRIBUTION }
  let confidence = Math.min(100, Math.max(0, (data.confidence ?? 0) * 100))

  if (hasValidPredictions) {
    distribution = predictionsToDistribution(predictions)
    const maxValue = Math.max(...predictions)
    const maxIndex = predictions.indexOf(maxValue)
    confidence = Number(((maxValue / (predictions.reduce((sum, v) => sum + v, 0) || 1)) * 100).toFixed(1))
    return {
      primaryEmotion: EMOTION_LABELS[maxIndex],
      confidence,
      distribution,
      timestamp: Date.now(),
      source,
      faceData: data.face_bbox
        ? { x: data.face_bbox[0], y: data.face_bbox[1], width: data.face_bbox[2], height: data.face_bbox[3] }
        : undefined,
    }
  }

  const fallbackEmotion =
    typeof data.emotion === "string" && EMOTION_LABEL_SET.has(data.emotion as EmotionType)
      ? (data.emotion as EmotionType)
      : "Neutral"

  return {
    primaryEmotion: fallbackEmotion,
    confidence,
    distribution,
    timestamp: Date.now(),
    source,
    faceData: data.face_bbox
      ? { x: data.face_bbox[0], y: data.face_bbox[1], width: data.face_bbox[2], height: data.face_bbox[3] }
      : undefined,
  }
}
