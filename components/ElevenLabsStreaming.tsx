"use client"

// !!!ATENÇÃO!!!
// Este componente é crítico para a integração com o ElevenLabs.
// NÃO MODIFIQUE este componente sem um pedido explícito e aprovação.
// Alterações aqui podem afetar o funcionamento do agente ElevenLabs.

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { config } from "@/lib/config"
import { Conversation } from "@11labs/client"
import type { ElevenLabsConversation } from "@/types/elevenlabs"

interface ElevenLabsStreamingProps {
  isCallActive: boolean
  onAudioData: (audioData: Uint8Array) => void
  onError: (error: string) => void
  onAgentSpeaking?: (isSpeaking: boolean) => void
}

const ElevenLabsStreaming: React.FC<ElevenLabsStreamingProps> = ({
  isCallActive,
  onAudioData,
  onError,
  onAgentSpeaking,
}) => {
  const conversationRef = useRef<ElevenLabsConversation | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_INTERVAL = 5000 // 5 seconds
  let reconnectTimer: NodeJS.Timeout | null = null

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        setReconnectAttempts((prev) => prev + 1)
        connectToElevenLabs()
        reconnectTimer = null
      }, RECONNECT_INTERVAL)
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      onError("Unable to establish a stable connection. Please try again later.")
    }
  }, [reconnectAttempts, onError, reconnectTimer])

  const connectToElevenLabs = useCallback(async () => {
    try {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }

      if (conversationRef.current) {
        await conversationRef.current.endSession()
        conversationRef.current = null
      }

      const agentId = config.elevenlabs.agentId
      const apiKey = config.elevenlabs.apiKey

      if (!agentId || !apiKey) {
        onError("Agent ID or API Key is not configured. Please check your environment variables.")
        return
      }

      const response = await fetch(`/api/generate-signed-url?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = `Failed to get signed URL: ${response.statusText}, Details: ${JSON.stringify(errorData)}`
        onError(errorMessage)
        scheduleReconnect()
        return
      }

      const { signedUrl } = await response.json()

      const conversation = await Conversation.startSession({ signedUrl })
      conversationRef.current = conversation

      setReconnectAttempts(0)

      conversation.onMessage = (message) => {
        if (message.type === "audio") {
          const audioData = new Uint8Array(
            atob(message.audio_event.audio_base_64)
              .split("")
              .map((char) => char.charCodeAt(0)),
          )
          onAudioData(audioData)
          if (onAgentSpeaking) onAgentSpeaking(true)
        } else if (message.type === "ping") {
          conversation.send({ type: "pong", event_id: message.ping_event.event_id })
        }
      }

      if (onAgentSpeaking) {
        conversation.onAgentSpeaking = (isSpeaking) => {
          onAgentSpeaking(isSpeaking)
        }
      }

      conversation.onError = (error) => {
        onError(`Conversation error: ${error.message}`)
        scheduleReconnect()
      }

      conversation.onDisconnect = () => {
        scheduleReconnect()
      }
    } catch (error) {
      onError(`Failed to connect to ElevenLabs: ${error instanceof Error ? error.message : String(error)}`)
      scheduleReconnect()
    }
  }, [onAudioData, onError, onAgentSpeaking, scheduleReconnect, reconnectTimer])

  const disconnectFromElevenLabs = useCallback(async () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
    }
  }, [reconnectTimer])

  useEffect(() => {
    if (isCallActive) {
      connectToElevenLabs()
    } else {
      disconnectFromElevenLabs()
    }

    return () => {
      disconnectFromElevenLabs()
    }
  }, [isCallActive, connectToElevenLabs, disconnectFromElevenLabs])

  return null
}

export default ElevenLabsStreaming
