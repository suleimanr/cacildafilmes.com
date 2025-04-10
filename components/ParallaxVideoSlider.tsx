"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import Image from "next/image"
import ShareButton from "./ShareButton"

interface Video {
  vimeo_id: string
  title: string
  category?: string
  description: string
  client?: string
  production?: string
  creation?: string
  thumbnail_url?: string
}

interface ParallaxVideoSliderProps {
  videos: Video[]
  onVideoSelect: (video: Video) => void
  videoToPlay: Video | null
  onClearVideoToPlay: () => void
}

export default function ParallaxVideoSlider({
  videos,
  onVideoSelect,
  videoToPlay,
  onClearVideoToPlay,
}: ParallaxVideoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(Date.now()) // Adicionar um key para forçar o recarregamento da imagem
  const [isMobile, setIsMobile] = useState(false)

  // Estado para controlar o vídeo em reprodução
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null)
  // Novo estado para controlar se o vídeo está sendo reproduzido ou apenas exibindo a capa
  const [isPlaying, setIsPlaying] = useState(false)

  // Detectar se estamos em um dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Atualizar o vídeo em reprodução quando videoToPlay mudar
  useEffect(() => {
    if (videoToPlay) {
      setPlayingVideo(videoToPlay)
      setIsPaused(true) // Pausar o slider quando um vídeo estiver sendo exibido
      setIsPlaying(false) // Inicialmente, apenas mostrar a capa, não reproduzir
      setImageKey(Date.now()) // Atualizar a key para forçar o recarregamento da imagem
      setImageError(false)
    }
  }, [videoToPlay])

  // Atualizar a key da imagem quando o vídeo atual mudar
  useEffect(() => {
    setImageKey(Date.now())
    setImageError(false)
  }, [currentIndex, videos])

  // Verificar se há vídeos disponíveis
  if (!videos || videos.length === 0) {
    console.log("Nenhum vídeo disponível para o slider")
    return (
      <div className="relative overflow-hidden rounded-xl shadow-2xl bg-black aspect-video max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-white text-xl">Nenhum vídeo disponível</p>
      </div>
    )
  }

  const currentVideo = videos[currentIndex]

  // Função para avançar para o próximo slide
  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length)
  }, [videos.length])

  // Função para voltar para o slide anterior
  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length)
  }, [videos.length])

  // Pausar o slider quando o mouse estiver sobre ele
  const handleMouseEnter = useCallback(() => setIsPaused(true), [])
  const handleMouseLeave = useCallback(() => {
    // Só retomar o slider se não houver vídeo em exibição
    if (!playingVideo) {
      setIsPaused(false)
    }
  }, [playingVideo])

  // Variantes de animação para o efeito parallax com wipe
  const slideVariants = {
    enter: (direction: number) => ({
      clipPath:
        direction > 0 ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      opacity: 1,
      scale: 1.05,
      zIndex: 2,
    }),
    center: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      opacity: 1,
      scale: 1,
      zIndex: 1,
      transition: {
        clipPath: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] },
        opacity: { duration: 0.8 },
        scale: { duration: 1.5 },
      },
    },
    exit: (direction: number) => ({
      clipPath:
        direction > 0 ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      opacity: 1,
      scale: 0.95,
      zIndex: 0,
      transition: {
        clipPath: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] },
        opacity: { duration: 0.8 },
        scale: { duration: 1.5 },
      },
    }),
  }

  // Variantes para o texto com efeito parallax mais lento
  const textVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: "spring", stiffness: 100, damping: 25 },
        opacity: { duration: 1.2, delay: 0.3 },
      },
    },
    exit: (direction: number) => ({
      y: direction > 0 ? -50 : 50,
      opacity: 0,
      transition: {
        y: { type: "spring", stiffness: 100, damping: 25 },
        opacity: { duration: 0.8 },
      },
    }),
  }

  // Variantes para o fundo com efeito parallax mais lento
  const backgroundVariants = {
    enter: (direction: number) => ({
      scale: 1.2,
      x: direction > 0 ? "3%" : "-3%",
    }),
    center: {
      scale: 1.1,
      x: 0,
      transition: {
        scale: { duration: 4 },
        x: { type: "spring", stiffness: 50, damping: 25, duration: 1.5 },
      },
    },
    exit: (direction: number) => ({
      scale: 1,
      x: direction > 0 ? "-3%" : "3%",
      transition: {
        scale: { duration: 2.5 },
        x: { type: "spring", stiffness: 50, damping: 25, duration: 1.5 },
      },
    }),
  }

  // Função para iniciar a reprodução do vídeo
  const handlePlayVideo = () => {
    setIsPlaying(true)
  }

  // Função para voltar ao slider
  const handleBackToSlider = () => {
    setPlayingVideo(null)
    setIsPlaying(false)
    onClearVideoToPlay() // Limpar o vídeo a ser reproduzido no componente pai
    setIsPaused(false) // Retomar o slider quando voltar
  }

  // Obter a URL da thumbnail para o vídeo atual ou em reprodução
  const getThumbnailUrl = useCallback(
    (video: Video) => {
      let thumbnailUrl = ""
      // Se tiver uma thumbnail personalizada, use-a
      if (video.thumbnail_url && video.thumbnail_url.trim() !== "") {
        thumbnailUrl = `${video.thumbnail_url}?t=${imageKey}` // Adicionar timestamp para evitar cache
      } else if (playingVideo && playingVideo.vimeo_id === video.vimeo_id) {
        // Se for para a capa (quando um vídeo está sendo exibido), use a versão de alta resolução 1920x1080
        // Usar a versão de maior qualidade possível - 1920x1080
        thumbnailUrl = `https://vumbnail.com/${video.vimeo_id}_1920x1080.jpg?t=${imageKey}`
      } else {
        // Para os slides normais, use a versão padrão
        thumbnailUrl = `https://vumbnail.com/${video.vimeo_id}.jpg?t=${imageKey}`
      }
      return thumbnailUrl
    },
    [imageKey, playingVideo],
  )

  const handleImageError = () => {
    console.error("Erro ao carregar imagem do slider")
    setImageError(true)
  }

  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(isPaused)

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const startTimer = () => {
      if (timerInterval.current) {
        clearTimeout(timerInterval.current)
      }

      timerInterval.current = setTimeout(() => {
        if (!isPausedRef.current) {
          nextSlide()
        } else {
          startTimer() // Se estiver pausado, tente novamente mais tarde
        }
      }, 3000)
    }

    startTimer()

    return () => {
      if (timerInterval.current) {
        clearTimeout(timerInterval.current)
      }
    }
  }, [currentIndex, nextSlide])

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-lg bg-black aspect-video max-w-7xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {playingVideo ? (
        // Player de vídeo ou capa do vídeo selecionado
        <div className="relative w-full h-full">
          {isPlaying ? (
            // Reprodução do vídeo
            <div className="absolute inset-0">
              <iframe
                src={`https://player.vimeo.com/video/${playingVideo.vimeo_id}?autoplay=1&loop=0&autopause=0&dnt=1&title=0&byline=0&portrait=0`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            // Capa do vídeo com informações
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                {imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    <h2 className="text-2xl font-bold">{playingVideo.title}</h2>
                  </div>
                ) : (
                  <Image
                    src={getThumbnailUrl(playingVideo) || "/placeholder.svg"}
                    alt={playingVideo.title}
                    layout="fill"
                    objectFit="contain"
                    className="bg-black"
                    onError={handleImageError}
                    key={imageKey}
                    unoptimized={true}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 text-white">
                  <div className="flex flex-col space-y-2 sm:space-y-4 max-w-4xl">
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                        {playingVideo.title}
                      </h1>
                      {playingVideo.client && (
                        <p className="text-sm sm:text-lg text-gray-200 mt-1 drop-shadow-md">
                          Cliente: {playingVideo.client}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {playingVideo.category && (
                          <span className="inline-block bg-black/50 backdrop-blur-sm border-[0.5px] border-white/50 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold text-white">
                            {playingVideo.category}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2 sm:space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-black font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-full flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                          onClick={handlePlayVideo}
                        >
                          <Play size={isMobile ? 12 : 16} />
                          <span>Assistir</span>
                        </motion.button>

                        <ShareButton videoId={playingVideo.vimeo_id} title={playingVideo.title} isMobile={isMobile} />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 sm:line-clamp-none">
                      {playingVideo.description}
                    </p>

                    {!isMobile && (
                      <>
                        {playingVideo.production && (
                          <p className="text-gray-300 text-sm">Produção: {playingVideo.production}</p>
                        )}

                        {playingVideo.creation && (
                          <p className="text-gray-300 text-sm">Criação: {playingVideo.creation}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none">
            <button
              onClick={handleBackToSlider}
              className="absolute top-1 left-1 sm:top-4 sm:left-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 sm:p-2 backdrop-blur-sm pointer-events-auto"
              aria-label="Voltar para o slider"
            >
              <ChevronLeft size={isMobile ? 16 : 24} />
            </button>
          </div>
        </div>
      ) : (
        // Slider de imagens quando nenhum vídeo estiver sendo exibido
        <>
          {/* Controles de navegação */}
          <button
            onClick={prevSlide}
            className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 sm:p-2 backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={isMobile ? 16 : 24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 sm:p-2 backdrop-blur-sm"
            aria-label="Próximo slide"
          >
            <ChevronRight size={isMobile ? 16 : 24} />
          </button>

          {/* Indicadores de slide */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 sm:space-x-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                }}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-3 sm:w-4" : "bg-white/50"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slider com efeito parallax wipe */}
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {/* Imagem de capa com efeito parallax */}
              <motion.div
                className="absolute inset-0"
                variants={backgroundVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    <h2 className="text-2xl font-bold">{currentVideo.title}</h2>
                  </div>
                ) : (
                  <Image
                    src={getThumbnailUrl(currentVideo) || "/placeholder.svg"}
                    alt={currentVideo.title}
                    layout="fill"
                    objectFit="cover"
                    className="brightness-75"
                    priority
                    onError={handleImageError}
                    key={imageKey} // Usar a key para forçar o recarregamento da imagem
                    unoptimized={true} // Desativar otimização para evitar problemas com cache
                  />
                )}
                {/* Overlay gradiente sutil apenas na parte inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </motion.div>

              {/* Conteúdo do slide com efeito parallax */}
              <motion.div
                className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 text-white"
                variants={textVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="flex flex-col space-y-2 sm:space-y-4 max-w-4xl">
                  {/* Título e Cliente */}
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                      {currentVideo.title}
                    </h1>
                    {currentVideo.client && (
                      <p className="text-sm sm:text-lg text-gray-200 mt-1 drop-shadow-md">
                        Cliente: {currentVideo.client}
                      </p>
                    )}
                  </div>

                  {/* Categoria e Botões */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {currentVideo.category && (
                        <span
                          key={`slider-category-${currentVideo.category}`}
                          className="inline-block bg-black/50 backdrop-blur-sm border-[0.5px] border-white/50 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold text-white"
                        >
                          {currentVideo.category}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2 sm:space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-full flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                        onClick={() => {
                          setPlayingVideo(currentVideo)
                          setIsPaused(true)
                        }}
                      >
                        <Play size={isMobile ? 12 : 16} />
                        <span>Assistir</span>
                      </motion.button>

                      {/* Substituir o botão de compartilhar pelo novo componente */}
                      <ShareButton videoId={currentVideo.vimeo_id} title={currentVideo.title} isMobile={isMobile} />
                    </div>
                  </div>

                  {/* Descrição curta */}
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2">
                    {currentVideo.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
