"use client"

import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { EmotionResult } from "@/lib/emotion-types"

interface EmotionTimelineProps {
  history: EmotionResult[]
}

export function EmotionTimeline({ history }: EmotionTimelineProps) {
  const data = history.map((result, index) => ({
    index: index + 1,
    confidence: result.confidence,
    emotion: result.primaryEmotion,
  }))

  return (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="index"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            labelFormatter={(label) => `Reading #${label}`}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name === "confidence" ? "Confidence" : name,
            ]}
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="hsl(185, 80%, 55%)"
            strokeWidth={2}
            dot={{ fill: "hsl(280, 80%, 60%)", strokeWidth: 0, r: 4 }}
            activeDot={{ fill: "hsl(280, 80%, 60%)", strokeWidth: 0, r: 6 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
