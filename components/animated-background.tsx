"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let nodes: { x: number; y: number; vx: number; vy: number; size: number; pulse: number }[] = []
    let mouseX = 0
    let mouseY = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initNodes()
    }

    const initNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 18000)
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      }))
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const draw = () => {
      ctx.fillStyle = "rgba(8, 8, 20, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      nodes.forEach((node, i) => {
        const dx = mouseX - node.x
        const dy = mouseY - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          const force = ((200 - dist) / 200) * 0.02
          node.vx += dx * force * 0.01
          node.vy += dy * force * 0.01
        }

        node.x += node.vx
        node.y += node.vy

        if (node.x < 0) {
          node.x = 0
          node.vx *= -0.8
        }
        if (node.x > canvas.width) {
          node.x = canvas.width
          node.vx *= -0.8
        }
        if (node.y < 0) {
          node.y = 0
          node.vy *= -0.8
        }
        if (node.y > canvas.height) {
          node.y = canvas.height
          node.vy *= -0.8
        }

        node.vx *= 0.99
        node.vy *= 0.99

        const pulseSize = node.size + Math.sin(time * 2 + node.pulse) * 0.5

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize * 3)
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.8)")
        gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.3)")
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)")

        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core node
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(139, 92, 246, 0.9)"
        ctx.fill()

        nodes.slice(i + 1).forEach((other) => {
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.4

            const lineGradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y)
            lineGradient.addColorStop(0, `rgba(34, 211, 238, ${alpha})`)
            lineGradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.8})`)
            lineGradient.addColorStop(1, `rgba(34, 211, 238, ${alpha})`)

            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = lineGradient
            ctx.lineWidth = alpha * 2
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="fixed inset-0 z-0 animated-grid opacity-20" />
      <div className="fixed inset-0 z-0 bg-gradient-radial from-transparent via-background/50 to-background pointer-events-none" />
    </>
  )
}
