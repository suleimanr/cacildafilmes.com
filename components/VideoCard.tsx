"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Share2 } from "lucide-react"

interface Video {
  vimeo_id: string
  title: string
  category?: string
  description: string
  client?: string
  thumbnail_url?: string
}

interface VideoCardProps {
  video: Video
  onClick: () => void
  isSelected?: boolean
}

export default function VideoCard({ video, onClick, isSelected = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(Date.now()) // Adicionar um key para forçar o recarregamento da imagem

  // Efeito para atualizar o imageKey quando a thumbnail_url mudar
  useEffect(() => {
    setImageKey(Date.now())
    setImageError(false)
  }, [video.thumbnail_url])

  // Modificar a função handleShare para garantir que a mensagem apareça ao clicar
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation() // Impedir que o clique propague para o card

    // Construir a URL da página da Cacilda Filmes com o ID do vídeo como parâmetro
    const currentUrl = window.location.origin + window.location.pathname
    const shareUrl = `${currentUrl}?video=${video.vimeo_id}`

    // Copiar para a área de transferência e mostrar feedback
    copyToClipboard(shareUrl)

    // Mostrar o tooltip independentemente do mouse estar sobre o botão
    setShowShareTooltip(true)
    setCopied(true)

    // Esconder o tooltip após 3 segundos
    setTimeout(() => {
      setCopied(false)
      setShowShareTooltip(false)
    }, 3000)
  }

  // Melhorar a função copyToClipboard para garantir feedback visual
  const copyToClipboard = async (text: string) => {
    try {
      // Tenta usar a API moderna do clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback para o método mais antigo
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed" // Evita rolar para o elemento
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } else {
          console.error("Falha ao copiar texto")
        }
      }
    } catch (error) {
      console.error("Erro ao copiar para a área de transferência:", error)
    }
  }

  // Usar a thumbnail personalizada se disponível, caso contrário usar a do Vimeo
  // Atualizar a função que carrega a imagem para usar a versão de maior resolução possível quando selecionada
  const thumbnailSrc =
    video.thumbnail_url && video.thumbnail_url.trim() !== ""
      ? `${video.thumbnail_url}?t=${imageKey}` // Adicionar timestamp para evitar cache
      : isSelected
        ? `https://vumbnail.com/${video.vimeo_id}_1920x1080.jpg?t=${imageKey}`
        : `https://vumbnail.com/${video.vimeo_id}.jpg?t=${imageKey}`

  // Adicionar este log após a definição de thumbnailSrc
  console.log(`VideoCard: Usando thumbnail para ${video.title}:`, {
    temThumbnailURL: !!video.thumbnail_url,
    thumbnailURL: video.thumbnail_url,
    thumbnailSrcUsada: thumbnailSrc,
  })

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem: ${thumbnailSrc}`)
    setImageError(true)
  }

  // Limitar a descrição a um número máximo de caracteres
  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <motion.div
      className="relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex flex-col bg-black"
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowShareTooltip(false)
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative bg-black/90">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-xs p-2 text-center">
            {video.title || "Vídeo sem thumbnail"}
          </div>
        ) : (
          <Image
            src={thumbnailSrc || "/placeholder.svg"}
            alt={video.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            onError={handleImageError}
            key={imageKey}
            unoptimized={true}
          />
        )}

        {/* Share button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0.8, scale: 1 }}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full z-10"
          onClick={handleShare}
          onMouseEnter={() => setShowShareTooltip(true)}
          onMouseLeave={() => {
            if (!copied) {
              setShowShareTooltip(false)
            }
          }}
        >
          <Share2 size={16} />
        </motion.button>

        {/* Mensagem "Link copiado!" como elemento separado */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-medium py-1 px-3 rounded-md text-sm z-50 shadow-md"
            >
              Link copiado!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Informações do vídeo abaixo da thumbnail */}
      <div className="p-3 flex-grow flex flex-col">
        {/* Categoria */}
        {video.category && (
          <div className="mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{video.category}</span>
          </div>
        )}

        {/* Título */}
        <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">{video.title}</h3>

        {/* Descrição */}
        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{truncateDescription(video.description, 80)}</p>

        {/* Cliente */}
        {video.client && <p className="text-xs text-gray-500 mt-auto pt-2">{video.client}</p>}
      </div>
    </motion.div>
  )
}
