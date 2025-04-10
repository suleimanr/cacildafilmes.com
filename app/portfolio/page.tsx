"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import VideoCard from "@/components/VideoCard"
import CategoryRow from "@/components/CategoryRow"
import ParallaxVideoSlider from "@/components/ParallaxVideoSlider"
import Footer from "@/components/footer"
import { FALLBACK_VIDEOS } from "@/lib/constants"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface Video {
  id?: number
  vimeo_id: string
  title: string
  category?: string
  description: string
  client?: string
  production?: string
  creation?: string
  thumbnail_url?: string
}

export default function PortfolioPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Novo estado para controlar qual vídeo deve ser exibido no slider
  const [videoToPlay, setVideoToPlay] = useState<Video | null>(null)

  // Referência para o slider para poder rolar até ele
  const sliderRef = useRef<HTMLDivElement>(null)

  // Referência para a seção "Todos os Vídeos"
  const allVideosRef = useRef<HTMLDivElement>(null)

  // Função para buscar vídeos com cache-busting
  const fetchVideos = useCallback(async (forceFresh = false) => {
    try {
      setLoading(true)
      console.log("Iniciando busca de vídeos...")

      // Adicionar um parâmetro de cache-busting para garantir dados atualizados
      const cacheBuster = forceFresh ? Date.now().toString() : ""
      const queryParams = new URLSearchParams()
      if (cacheBuster) {
        queryParams.append("t", cacheBuster)
      }

      const url = `/api/list-videos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      console.log(`Fetching videos from: ${url}`)

      const response = await fetch(url, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar vídeos")
      }

      const data = await response.json()
      console.log("Dados recebidos da API:", data)
      setLastFetchTime(data.timestamp || Date.now())

      // Use API data if available, otherwise use fallback
      const videoData = data.success && data.videos && data.videos.length > 0 ? data.videos : FALLBACK_VIDEOS

      // Ensure all videos have a category and normalize category names
      const processedVideos = videoData.map((video: Video) => ({
        ...video,
        // Normalize category to lowercase and ensure it exists
        category: video.category ? video.category.toLowerCase().trim() : "sem-categoria",
      }))

      console.log("Vídeos processados:", processedVideos)
      setVideos(processedVideos)

      // Extract unique categories, safely handling undefined values
      const uniqueCategories = Array.from(
        new Set(
          processedVideos
            .map((video: Video) => video.category?.toLowerCase().trim())
            .filter(Boolean), // Remove any undefined values
        ),
      ) as string[]

      console.log("Categorias encontradas:", uniqueCategories)
      setCategories(uniqueCategories)

      // Set a featured video (first video or a specific one)
      if (processedVideos.length > 0) {
        setSelectedVideo(processedVideos[0])
      }
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err)
      setError("Não foi possível carregar os vídeos. Usando dados de fallback.")

      // Use fallback data with category safety
      const processedFallback = FALLBACK_VIDEOS.map((video: Video) => ({
        ...video,
        category: video.category ? video.category.toLowerCase().trim() : "sem-categoria",
      }))

      console.log("Usando vídeos de fallback:", processedFallback)
      setVideos(processedFallback)

      // Extract unique categories from fallback, safely handling undefined values
      const uniqueCategories = Array.from(
        new Set(
          processedFallback
            .map((video: Video) => video.category?.toLowerCase().trim())
            .filter(Boolean), // Remove any undefined values
        ),
      ) as string[]

      console.log("Categorias de fallback:", uniqueCategories)
      setCategories(uniqueCategories)

      // Set a featured video from fallback
      if (processedFallback.length > 0) {
        setSelectedVideo(processedFallback[0])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Efeito para carregar vídeos inicialmente e quando o refreshTrigger mudar
  useEffect(() => {
    console.log("Executando useEffect para buscar vídeos")
    fetchVideos(refreshTrigger > 0)
  }, [fetchVideos, refreshTrigger])

  // Adicionar um useEffect para verificar o parâmetro de consulta do vídeo na URL
  useEffect(() => {
    // Verificar se há um parâmetro de vídeo na URL
    const params = new URLSearchParams(window.location.search)
    const videoId = params.get("video")
    const refresh = params.get("refresh")

    console.log("Parâmetros da URL:", { videoId, refresh })

    // Se o parâmetro de atualização estiver presente, forçar a atualização
    if (refresh === "true") {
      setRefreshTrigger((prev) => prev + 1)

      // Remover o parâmetro de atualização da URL
      const newUrl = window.location.pathname + (videoId ? `?video=${videoId}` : "")
      window.history.replaceState({}, document.title, newUrl)

      // Mostrar uma notificação
      toast.info("Atualizando a lista de vídeos...", {
        position: "top-right",
        autoClose: 2000,
      })
    }

    if (videoId && videos.length > 0) {
      // Encontrar o vídeo correspondente ao ID na URL
      const videoFromUrl = videos.find((v) => v.vimeo_id === videoId)
      if (videoFromUrl) {
        // Selecionar e exibir o vídeo (sem reproduzir automaticamente)
        setSelectedVideo(videoFromUrl)
        setVideoToPlay(videoFromUrl)

        // Rolar até o slider
        if (sliderRef.current) {
          sliderRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }, [videos]) // Executar quando a lista de vídeos for carregada

  // Adicionar um listener para eventos de storage para detectar atualizações de vídeos
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "video_updated") {
        const updateTime = Number.parseInt(e.newValue || "0", 10)

        // Verificar se a atualização é mais recente que o último fetch
        if (updateTime > lastFetchTime) {
          console.log("Detectada atualização de vídeo em outra aba, atualizando...")
          // Incrementar o refreshTrigger para forçar o recarregamento dos vídeos
          setRefreshTrigger((prev) => prev + 1)

          // Mostrar uma notificação
          toast.info("Atualizando a lista de vídeos...", {
            position: "top-right",
            autoClose: 2000,
          })
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [lastFetchTime])

  // Adicionar um botão de atualização manual
  const clearImageCache = () => {
    // Forçar o navegador a recarregar as imagens adicionando um timestamp às URLs
    const timestamp = Date.now()
    document.querySelectorAll("img").forEach((img) => {
      if (img.src.includes("data:image")) return // Pular URLs de dados
      if (img.src.includes("vumbnail.com")) {
        // Para thumbnails do Vimeo, recarregar a imagem
        const newSrc = img.src.split("?")[0] + "?t=" + timestamp
        img.src = newSrc
      }
    })

    toast.success("Cache de imagens limpo com sucesso!", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  // Modificar a função handleManualRefresh para também limpar o cache de imagens
  const handleManualRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
    clearImageCache()
    toast.info("Atualizando a lista de vídeos...", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  // Modificar a função handleVideoSelect para apenas exibir o vídeo sem reproduzir automaticamente
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setVideoToPlay(video) // Definir o vídeo a ser exibido, mas não reproduzido automaticamente

    // Rolar até o slider para que o usuário veja o vídeo selecionado
    if (sliderRef.current) {
      sliderRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Função para limpar o vídeo a ser exibido (quando o usuário fecha o player)
  const handleClearVideoToPlay = () => {
    setVideoToPlay(null)
  }

  // Função para rolar até a seção "Todos os Vídeos"
  const scrollToAllVideos = () => {
    if (allVideosRef.current) {
      allVideosRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  console.log("Estado atual:", {
    loading,
    videosCount: videos.length,
    categoriesCount: categories.length,
    error,
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-10 pb-16">
        {/* Botão de atualização manual */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
          <h1 className="text-3xl font-bold text-white">Portfólio</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
            <div className="bg-yellow-600 text-white p-3 rounded-md">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
            <motion.div
              className="w-16 h-16 border-4 border-t-4 border-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
        ) : videos.length === 0 ? (
          // Nenhum vídeo encontrado
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Nenhum vídeo encontrado</h2>
              <p className="text-gray-400 mb-6">Não foi possível carregar os vídeos do portfólio.</p>
              <button
                onClick={handleManualRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Slider de Vídeos com Parallax */}
            <div ref={sliderRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <ParallaxVideoSlider
                videos={videos}
                onVideoSelect={handleVideoSelect}
                videoToPlay={videoToPlay}
                onClearVideoToPlay={handleClearVideoToPlay}
              />
            </div>

            <div className="space-y-6 mt-8">
              {/* Categories Sections - Agora vem primeiro */}
              {categories.map((category) => (
                <CategoryRow
                  key={`category-row-${category}-${refreshTrigger}`} // Adicionar refreshTrigger à chave para forçar re-render
                  category={category}
                  videos={videos.filter((v) => v.category?.toLowerCase() === category)}
                  onVideoSelect={handleVideoSelect}
                  selectedVideoId={selectedVideo?.vimeo_id}
                />
              ))}

              {/* All Videos Section - Agora vem por último */}
              <div ref={allVideosRef}>
                <motion.section
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-gray-200">Todos os Vídeos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {videos.map((video) => (
                      <VideoCard
                        key={`${video.vimeo_id}-${video.category}`} // Adicionar categoria à chave para forçar re-render quando a categoria mudar
                        video={video}
                        onClick={() => handleVideoSelect(video)}
                        isSelected={selectedVideo?.vimeo_id === video.vimeo_id}
                      />
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
