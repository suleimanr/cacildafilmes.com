"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface WaveformAudioVisualizerProps {
  agentAudioData: Uint8Array | null
  userAudioData: Uint8Array | null
  isAgentSpeaking: boolean
  isUserSpeaking: boolean
}

const WaveformAudioVisualizer: React.FC<WaveformAudioVisualizerProps> = ({
  agentAudioData,
  userAudioData,
  isAgentSpeaking,
  isUserSpeaking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animationFrameId: number
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = 300
      }
    }

    window.addEventListener("resize", handleResize)

    const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t

    const drawWaveform = (data: Uint8Array | null, isSpeaking: boolean, isAgent: boolean) => {
      if (!data) return

      const gradient = ctx.createLinearGradient(0, 0, width, 0)

      if (isAgent) {
        gradient.addColorStop(0, "#FF00FF")
        gradient.addColorStop(0.5, "#00FFFF")
        gradient.addColorStop(1, "#FF0000")
      } else {
        gradient.addColorStop(0, "#0000FF")
        gradient.addColorStop(0.5, "#00FF00")
        gradient.addColorStop(1, "#800080")
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2

      const time = performance.now() * 0.001
      const yOffset = isAgent ? height * 0.25 : height * 0.75

      const drawLayer = (offset: number, scale: number) => {
        ctx.beginPath()

        for (let i = 0; i < width; i++) {
          const dataIndex = Math.floor((i / width) * data.length)
          const normalizedData = data[dataIndex] / 255.0
          const amplitudeScale = isAgent ? 2 : 1.5
          const amplitude = normalizedData * height * 0.4 * amplitudeScale * scale

          const progress = i / width
          const waveOffset = Math.sin(progress * Math.PI * 10 + time * 3) * 20
          const distortion = Math.sin(progress * Math.PI * 20 + time * 5) * 15 * normalizedData

          const y = yOffset + (amplitude + waveOffset + distortion + offset) * (isAgent ? -1 : 1)

          if (i === 0) {
            ctx.moveTo(i, y)
          } else {
            ctx.lineTo(i, y)
          }
        }

        ctx.stroke()
      }

      // Draw multiple layers with different offsets and scales
      const layers = isAgent ? 5 : 4
      for (let i = 0; i < layers; i++) {
        const offset = (i - layers / 2) * 15
        const scale = 1 - Math.abs(i - layers / 2) * 0.2
        drawLayer(offset, scale)
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw agent waveform
      drawWaveform(agentAudioData, isAgentSpeaking, true)

      // Draw user waveform
      drawWaveform(userAudioData, isUserSpeaking, false)

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [agentAudioData, userAudioData, isAgentSpeaking, isUserSpeaking])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="w-full h-full flex items-center justify-center"
    >
      <canvas ref={canvasRef} width={window.innerWidth} height={300} className="w-full h-full" />
    </motion.div>
  )
}

export default WaveformAudioVisualizer
