""
\"use client"

interface ElevenLabsClientProps {
  messages: { role: string; content: string }[]
}

export class Conversation {
  onMessage: ((message: any) => void) | null = null
  onAgentSpeaking: ((isSpeaking: boolean) => void) | null = null
  onError: ((error: Error) => void) | null = null
  onDisconnect: (() => void) | null = null

  private ws: WebSocket | null = null
  private signedUrl: string

  constructor(signedUrl: string) {
    this.signedUrl = signedUrl
  }

  static async startSession(config: { signedUrl: string }): Promise<Conversation> {
    const conversation = new Conversation(config.signedUrl)
    conversation.connect()
    return conversation
  }

  private connect() {
    this.ws = new WebSocket(this.signedUrl)

    this.ws.onopen = () => {
      console.log("ElevenLabs WebSocket connected")
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (this.onMessage) {
          this.onMessage(data)
        }
        if (data.type === "audio" && this.onAgentSpeaking) {
          this.onAgentSpeaking(true)
          setTimeout(() => this.onAgentSpeaking?.(false), 200)
        }
      } catch (error) {
        console.error("ElevenLabs WebSocket message error:", error)
        this.onError?.(error as Error)
      }
    }

    this.ws.onerror = (error) => {
      console.error("ElevenLabs WebSocket error:", error)
      this.onError?.(error as Error)
    }

    this.ws.onclose = () => {
      console.log("ElevenLabs WebSocket disconnected")
      this.onDisconnect?.()
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("ElevenLabs WebSocket not connected, message not sent")
    }
  }

  async endSession() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
"
