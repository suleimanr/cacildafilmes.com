"\"use client"

// Placeholder simples para o cliente ElevenLabs
export class Conversation {
  onMessage: ((message: any) => void) | null = null
  onAgentSpeaking: ((isSpeaking: boolean) => void) | null = null
  onError: ((error: Error) => void) | null = null
  onDisconnect: (() => void) | null = null

  private signedUrl: string

  constructor(signedUrl: string) {
    this.signedUrl = signedUrl
  }

  static async startSession({ signedUrl }: { signedUrl: string }): Promise<Conversation> {
    return new Conversation(signedUrl)
  }

  send(message: any) {
    console.log("ElevenLabsClient: Sending message", message)
  }

  async endSession() {
    console.log("ElevenLabsClient: Ending session")
  }
}
