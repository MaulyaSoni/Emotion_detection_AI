import type { EmotionResult, EmotionType, EmotionDistribution } from "./emotion-types"

// Simulated emotion analysis for text
// In production, this would call a real ML API
export function analyzeTextEmotion(text: string): EmotionResult {
  const lowerText = text.toLowerCase()

  // Simple keyword-based analysis for demo
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
    ],
    Neutral: ["okay", "fine", "normal", "alright", "so-so", "whatever", "meh", "indifferent"],
  }

  const scores: EmotionDistribution = {
    Happy: 0,
    Sad: 0,
    Angry: 0,
    Fear: 0,
    Surprise: 0,
    Neutral: 10, // Base neutral score
  }

  // Count keyword matches
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        scores[emotion as EmotionType] += 15
      }
    })
  })

  // Analyze punctuation
  const exclamationCount = (text.match(/!/g) || []).length
  const questionCount = (text.match(/\?/g) || []).length

  if (exclamationCount > 2) {
    scores.Happy += 5
    scores.Surprise += 5
    scores.Angry += 3
  }

  if (questionCount > 1) {
    scores.Fear += 3
    scores.Surprise += 3
  }

  // Analyze caps (shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (capsRatio > 0.5 && text.length > 10) {
    scores.Angry += 10
    scores.Surprise += 5
  }

  // Normalize scores to percentages
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const distribution: EmotionDistribution = {
    Happy: Math.round((scores.Happy / total) * 100),
    Sad: Math.round((scores.Sad / total) * 100),
    Angry: Math.round((scores.Angry / total) * 100),
    Fear: Math.round((scores.Fear / total) * 100),
    Surprise: Math.round((scores.Surprise / total) * 100),
    Neutral: Math.round((scores.Neutral / total) * 100),
  }

  // Find primary emotion
  const primaryEmotion = Object.entries(distribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as EmotionType

  // Calculate confidence with some randomness for realism
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

// Simulated image/webcam emotion analysis
// In production, this would use face-api.js or a cloud vision API
export function analyzeImageEmotion(): EmotionResult {
  const emotions: EmotionType[] = ["Happy", "Sad", "Angry", "Fear", "Surprise", "Neutral"]

  // Generate random but realistic distribution
  const rawScores = emotions.map(() => Math.random() * 100)
  const total = rawScores.reduce((a, b) => a + b, 0)

  const distribution: EmotionDistribution = {
    Happy: 0,
    Sad: 0,
    Angry: 0,
    Fear: 0,
    Surprise: 0,
    Neutral: 0,
  }

  emotions.forEach((emotion, i) => {
    distribution[emotion] = Math.round((rawScores[i] / total) * 100)
  })

  // Find primary emotion
  const primaryEmotion = Object.entries(distribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as EmotionType

  // Higher confidence for images
  const maxScore = Math.max(...Object.values(distribution))
  const confidence = Math.min(98, maxScore + Math.random() * 20)

  return {
    primaryEmotion,
    confidence,
    distribution,
    timestamp: Date.now(),
    source: "image",
  }
}
