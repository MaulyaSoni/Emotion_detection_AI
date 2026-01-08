import { Smile, Frown, Angry, Meh, AlertTriangle, Zap, ThumbsDown } from "lucide-react"
import type { EmotionType } from "@/lib/emotion-types"

interface EmotionBadgeProps {
  emotion: EmotionType
}

const emotionConfig: Record<
  EmotionType,
  {
    icon: typeof Smile
    color: string
    bgColor: string
    glowClass: string
    gradient: string
  }
> = {
  Happy: {
    icon: Smile,
    color: "text-chart-5",
    bgColor: "bg-chart-5/20",
    glowClass: "shadow-[0_0_30px_rgba(250,204,21,0.4)]",
    gradient: "from-chart-5/30 to-chart-5/5",
  },
  Sad: {
    icon: Frown,
    color: "text-neon-blue",
    bgColor: "bg-neon-blue/20",
    glowClass: "shadow-[0_0_30px_rgba(96,165,250,0.4)]",
    gradient: "from-neon-blue/30 to-neon-blue/5",
  },
  Angry: {
    icon: Angry,
    color: "text-chart-4",
    bgColor: "bg-chart-4/20",
    glowClass: "shadow-[0_0_30px_rgba(248,113,113,0.4)]",
    gradient: "from-chart-4/30 to-chart-4/5",
  },
  Fear: {
    icon: AlertTriangle,
    color: "text-primary",
    bgColor: "bg-primary/20",
    glowClass: "neon-glow-purple",
    gradient: "from-primary/30 to-primary/5",
  },
  Surprise: {
    icon: Zap,
    color: "text-accent",
    bgColor: "bg-accent/20",
    glowClass: "neon-glow-cyan",
    gradient: "from-accent/30 to-accent/5",
  },
  Disgust: {
    icon: ThumbsDown,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/20",
    glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
    gradient: "from-emerald-500/30 to-emerald-500/5",
  },
  Neutral: {
    icon: Meh,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    glowClass: "",
    gradient: "from-muted/30 to-muted/5",
  },
}

export function EmotionBadge({ emotion }: EmotionBadgeProps) {
  const config = emotionConfig[emotion]
  
  // Fallback if emotion is undefined
  if (!config) {
    return (
      <div className="flex flex-col items-center animate-bounce-in">
        <div className="relative group cursor-default">
          <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground">
            Unknown Emotion
          </div>
        </div>
      </div>
    )
  }
  
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center animate-bounce-in">
      <div className="relative group cursor-default">
        <div
          className={`absolute -inset-4 rounded-3xl bg-gradient-to-b ${config.gradient} blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`}
        />

        <div className="absolute -inset-1 rounded-2xl holographic opacity-30 group-hover:opacity-60 transition-opacity" />

        <div
          className={`relative mb-4 rounded-2xl ${config.bgColor} p-8 ${config.glowClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className={`h-20 w-20 ${config.color} transition-transform duration-500 group-hover:scale-110`} />
        </div>
      </div>

      <h3 className={`text-4xl font-bold ${config.color} text-shimmer`}>{emotion}</h3>
      <p className="mt-2 text-sm text-muted-foreground">Primary Detected Emotion</p>

      <div className={`mt-4 h-1 w-24 rounded-full bg-gradient-to-r ${config.gradient}`} />
    </div>
  )
}
