"use client"

import { useEffect, useState } from "react"
import { ElevenLabsClient } from "@11labs/client"

export default function ElevenLabsClientProvider() {
  const [client, setClient] = useState<ElevenLabsClient | null>(null)

  useEffect(() => {
    // Inicializar o cliente apenas no lado do cliente
    if (typeof window !== "undefined") {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      if (apiKey) {
        const newClient = new ElevenLabsClient({
          apiKey,
        })
        setClient(newClient)
      }
    }
  }, [])

  return null
}
