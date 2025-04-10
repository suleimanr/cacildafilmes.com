"use client"

import type React from "react"
import { useState, useCallback } from "react"
import ElevenLabsStreaming from "./ElevenLabsStreaming"
import CircularAudioVisualizer from "./CircularAudioVisualizer"

const AudioChat: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [agentAudioData, setAgentAudioData] = useState<Uint8Array | null>(null)
  const [userAudioData, setUserAudioData] = useState<Uint8Array | null>(null)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false)

  const handleAudioData = useCallback((audioData: Uint8Array) => {
    setAgentAudioData(audioData)
    setIsAgentSpeaking(true)
    setTimeout(() => setIsAgentSpeaking(false), 200)
  }, [])

  const handleError = useCallback((error: string) => {
    console.error("ElevenLabs error:", error)
  }, [])

  const handleConnectionStatusChange = useCallback((status: "connected" | "disconnected") => {
    console.log("Connection status:", status)
    if (status === "connected") {
      setIsMicrophoneActive(true)
    } else {
      setIsMicrophoneActive(false)
    }
  }, [])

  const toggleMicrophone = useCallback(() => {
    setIsMicrophoneActive((prev) => !prev)
  }, [])

  return (
    <div className="relative w-full h-full">
      <ElevenLabsStreaming
        isCallActive={isCallActive}
        onAudioData={handleAudioData}
        onError={handleError}
        onConnectionStatusChange={handleConnectionStatusChange}
      />
      <CircularAudioVisualizer
        agentAudioData={agentAudioData}
        userAudioData={userAudioData}
        isAgentSpeaking={isAgentSpeaking}
        isUserSpeaking={isUserSpeaking}
      />
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button onClick={() => setIsCallActive(!isCallActive)} className="bg-blue-500 text-white px-4 py-2 rounded">
          {isCallActive ? "End Call" : "Start Call"}
        </button>
        <button
          onClick={toggleMicrophone}
          className={`px-4 py-2 rounded ${isMicrophoneActive ? "bg-red-500 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          {isMicrophoneActive ? "Mute" : "Unmute"}
        </button>
      </div>
    </div>
  )
}

export default AudioChat
