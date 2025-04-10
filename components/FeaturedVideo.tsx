"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ShareButton from "./ShareButton"

interface Video {
  vimeo_id: string
  title: string
  category?: string
  description: string
  client?: string
  production?: string
  creation?: string
  image?: string
  thumbnail_url?: string
}

interface FeaturedVideoProps {
  video: Video
}

export default function FeaturedVideo({ video }: FeaturedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Atualizar a função que carrega a imagem para usar a resolução 1920x1080
  const thumbnailSrc =
    video.thumbnail_url && video.thumbnail_url.trim() !== ""
      ? `${video.thumbnail_url}?t=${Date.now()}` // Adicionar timestamp para evitar cache
      : `https://vumbnail.com/${video.vimeo_id}_1920x1080.jpg?t=${Date.now()}`

  // Adicionar log para depuração
  console.log("FeaturedVideo - Thumbnail URL:", thumbnailSrc)

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black">
        {/* Vídeo */}
        <div className="aspect-video relative">
          <iframe
            src={`https://player.vimeo.com/video/${video.vimeo_id}?autoplay=0&loop=0&autopause=0&dnt=1&title=0&byline=0&portrait=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
          />

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <motion.div
                className="w-12 h-12 border-4 border-t-4 border-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
          )}

          {/* Overlay com gradiente para o texto */}
          {/* Informações do vídeo sobrepostas */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col space-y-4"
            >
              {/* Título e Cliente */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md">{video.title}</h1>
                {video.client && <p className="text-lg text-gray-200 mt-1 drop-shadow-md">Cliente: {video.client}</p>}
              </div>

              {/* Categoria e Botões */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {video.category && (
                    <span className="inline-block bg-black/50 backdrop-blur-sm border-[0.5px] border-white/50 rounded-full px-3 py-1 text-sm font-semibold text-white">
                      {video.category}
                    </span>
                  )}
                  {video.production && (
                    <span className="inline-block bg-black/50 backdrop-blur-sm border-[0.5px] border-white/50 rounded-full px-3 py-1 text-sm font-semibold text-white">
                      {video.production}
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black font-bold py-2 px-4 rounded-full"
                  >
                    Assistir
                  </motion.button>

                  {/* Substituir o botão de compartilhar pelo novo componente */}
                  <ShareButton videoId={video.vimeo_id} title={video.title} />
                </div>
              </div>

              {/* Descrição com expansão */}
              <motion.div
                initial={{ height: "2.5rem", opacity: 0.8 }}
                animate={{
                  height: showFullDescription ? "auto" : "2.5rem",
                  opacity: showFullDescription ? 1 : 0.8,
                }}
                className="relative overflow-hidden"
              >
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{video.description}</p>
                {!showFullDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent" />
                )}
              </motion.div>

              {/* Botão "Ler mais" */}
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-gray-300 hover:text-white underline self-start"
              >
                {showFullDescription ? "Mostrar menos" : "Ler mais"}
              </button>

              {/* Informações adicionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm text-gray-300">
                {video.creation && (
                  <div>
                    <span className="text-gray-400">Criação:</span> {video.creation}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
