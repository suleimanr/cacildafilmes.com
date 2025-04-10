// !!!ATENÇÃO!!!
// Este arquivo contém tipos críticos para o ElevenLabs.
// NÃO MODIFIQUE este arquivo sem um pedido explícito e aprovação.
// Alterações aqui podem afetar o funcionamento do agente ElevenLabs.

export interface ElevenLabsConfig {
  readonly apiKey: string
  readonly agentId: string
  readonly apiBaseUrl: string
  readonly wsBaseUrl: string
}

export interface ElevenLabsMessage {
  type: string
  [key: string]: any
}

export interface ElevenLabsConversation {
  onMessage: (message: ElevenLabsMessage) => void
  onAgentSpeaking: (isSpeaking: boolean) => void
  onError: (error: Error) => void
  onDisconnect: () => void
  send: (message: ElevenLabsMessage) => void
  endSession: () => Promise<void>
}
