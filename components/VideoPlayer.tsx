"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface VideoPlayerProps {
  videoId: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, []) // Removed unnecessary videoId dependency

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg bg-gray-800"
      style={{ maxWidth: "calc(100vw - 16px)" }}
    >
      <div ref={containerRef} className="relative pb-[56.25%] w-full">
        {shouldLoad && (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?autoplay=0&loop=0&autopause=0&dnt=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className={`absolute top-0 left-0 w-full h-full ${isLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleLoad}
            onError={handleError}
          ></iframe>
        )}
        {(!shouldLoad || !isLoaded || hasError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
            {hasError ? (
              <a
                href={`https://vimeo.com/${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm sm:text-base"
              >
                Ver vídeo no Vimeo
              </a>
            ) : (
              <p className="text-white text-sm sm:text-base">Carregando vídeo...</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default VideoPlayer
