"\"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface ElevenLabsClientProps {
  messages: { role: string; content: string }[]
}

export const ElevenLabsClient: React.FC<ElevenLabsClientProps> = ({ messages }) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const synthesizeSpeech = async (text: string) => {
      try {
        const response = await fetch("/api/elevenlabs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        if (data.audio) {
          const audioBlob = new Blob(
            [
              new Uint8Array(
                atob(data.audio)
                  .split("")
                  .map((c) => c.charCodeAt(0)),
              ),
            ],
            {
              type: "audio/mpeg",
            },
          )
          const audioUrl = URL.createObjectURL(audioBlob)

          if (audioRef.current) {
            audioRef.current.src = audioUrl
            audioRef.current.play().catch((error) => console.error("Error playing audio:", error))
          }
        }
      } catch (error) {
        console.error("Error synthesizing speech:", error)
      }
    }

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        synthesizeSpeech(lastMessage.content)
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [messages])

  return <audio ref={audioRef} controls={false} className="hidden" />
}
