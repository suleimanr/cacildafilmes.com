"use client"

import { useRef, useEffect, useState } from "react"
import VideoCard from "./VideoCard"
import { motion, AnimatePresence } from "framer-motion"

interface Video {
  vimeo_id: string
  title: string
  category?: string
  description: string
  client?: string
}

interface CategoryRowProps {
  category: string
  videos: Video[]
  onVideoSelect: (video: Video) => void
  selectedVideoId?: string
}

export default function CategoryRow({ category, videos, onVideoSelect, selectedVideoId }: CategoryRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasRendered, setHasRendered] = useState(false)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef
      const scrollAmount = container.clientWidth * 0.75

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  // Format category name for display
  const formatCategoryName = (name: string) => {
    if (name === "sem-categoria") return "Sem Categoria"
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Usar IntersectionObserver para detectar quando a seção está visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const sectionElement = scrollContainerRef.current?.parentElement
    if (sectionElement) {
      observer.observe(sectionElement)
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement)
      }
    }
  }, [])

  // Marcar como renderizado após a primeira renderização
  useEffect(() => {
    setHasRendered(true)
  }, [])

  // Filtrar vídeos pela categoria atual, garantindo uma comparação case-insensitive
  const filteredVideos = videos.filter(
    (video) => video.category?.toLowerCase().trim() === category.toLowerCase().trim(),
  )

  // If no videos in this category, don't render the row
  if (filteredVideos.length === 0) {
    return null
  }

  console.log(`Categoria: ${category}, Vídeos: ${filteredVideos.length}`)

  return (
    <motion.section
      key={`category-section-${category}`} // Adicionar uma chave única baseada na categoria
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible || hasRendered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-200">{formatCategoryName(category)}</h2>
      </div>

      {/* Scroll buttons - only show if there are enough videos */}
      {filteredVideos.length > 4 && (
        <>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
            <button
              onClick={() => scroll("left")}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 focus:outline-none"
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
            <button
              onClick={() => scroll("right")}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 focus:outline-none"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <AnimatePresence>
          {filteredVideos.map((video, index) => (
            <motion.div
              key={`${video.vimeo_id}-${category}`}
              className="flex-none w-64 sm:w-72"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <VideoCard
                video={video}
                onClick={() => onVideoSelect(video)}
                isSelected={selectedVideoId === video.vimeo_id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
