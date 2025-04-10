"use client"

import { useEffect, useState } from "react"
import { ensureStorageBucket } from "@/lib/supabase"

export default function InitializeStorage() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initStorage = async () => {
      try {
        await ensureStorageBucket()
        setInitialized(true)
      } catch (error) {
        console.error("Erro ao inicializar storage:", error)
      }
    }

    initStorage()
  }, [])

  return null // Este componente não renderiza nada visualmente
}
