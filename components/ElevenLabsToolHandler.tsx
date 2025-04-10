"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ElevenLabsToolHandler() {
  const router = useRouter()

  useEffect(() => {
    // Função para lidar com eventos da ferramenta do ElevenLabs
    const handleElevenLabsToolEvent = (event: CustomEvent) => {
      const { action, videoId } = event.detail || {}
      console.log("ElevenLabs tool event received:", { action, videoId })

      // Lidar com diferentes ações
      switch (action) {
        case "openPortfolio":
          // Navegar para a página de portfólio
          router.push("/portfolio")
          break

        case "openVideoDialog":
          // Abrir a galeria de vídeos (navegar para a página de portfólio)
          router.push("/portfolio")
          break

        case "openVideo":
          // Abrir um vídeo específico
          if (videoId) {
            router.push(`/portfolio?video=${encodeURIComponent(videoId)}`)
          } else {
            // Se não houver videoId, apenas navegar para a página de portfólio
            router.push("/portfolio")
          }
          break

        default:
          console.warn(`Ação desconhecida: ${action}`)
      }
    }

    // Registrar o listener para o evento
    window.addEventListener("elevenlabs-tool-videoInteraction", handleElevenLabsToolEvent as EventListener)

    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener("elevenlabs-tool-videoInteraction", handleElevenLabsToolEvent as EventListener)
    }
  }, [router])

  // Este componente não renderiza nada visualmente
  return null
}
