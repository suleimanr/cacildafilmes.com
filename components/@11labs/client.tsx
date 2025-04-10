"\"use client"

interface ElevenLabsClientProps {
  messages: { role: string; content: string }[]
}

interface ElevenLabsConversation {
  onMessage: (message: any) => void
  onAgentSpeaking: (isSpeaking: boolean) => void
  onError: (error: Error) => void
  onDisconnect: () => void
  send: (message: any) => void
  endSession: () => Promise<void>
}

const noop = () => {}

export const Conversation = {
  startSession: async (config: { signedUrl: string }): Promise<ElevenLabsConversation> => {
    return {
      onMessage: noop,
      onAgentSpeaking: noop,
      onError: noop,
      onDisconnect: noop,
      send: noop,
      endSession: async () => {},
    }
  },
}
