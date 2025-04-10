"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

interface Video {
  id: number
  title: string
  vimeo_id: string
  category?: string
  description?: string
  client?: string
  production?: string
  creation?: string
}

interface DeleteVideoPopupProps {
  onClose: () => void
  onDelete: (id: number) => Promise<void>
  onEdit: (video: Video) => void
}

const DeleteVideoPopup: React.FC<DeleteVideoPopupProps> = ({ onClose, onDelete, onEdit }) => {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = async () => {
    try {
      console.log("Buscando lista de vídeos...")
      const response = await fetch("/api/list-videos")
      if (!response.ok) {
        throw new Error("Falha ao carregar os vídeos")
      }
      const data = await response.json()
      console.log("Vídeos recebidos:", data.videos)
      setVideos(data.videos)
    } catch (err) {
      setError("Erro ao carregar os vídeos. Por favor, tente novamente.")
      console.error("Erro ao carregar os vídeos:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id)
      toast.success("Vídeo deletado com sucesso!")
      fetchVideos() // Atualiza a lista de vídeos após a deleção
    } catch (err) {
      toast.error("Erro ao deletar o vídeo. Por favor, tente novamente.")
      console.error("Erro ao deletar o vídeo:", err)
    }
  }

  const handleEdit = (video: Video) => {
    onEdit(video)
    onClose() // Fechar o popup após clicar em editar
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg relative max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Gerenciar Vídeos</h2>

        {isLoading && <p className="text-white">Carregando vídeos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && (
          <ul className="space-y-2 sm:space-y-4">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-700 p-2 sm:p-3 rounded"
              >
                <span className="text-white text-sm sm:text-base mb-2 sm:mb-0">{video.title}</span>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(video)}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-gray-600 text-white hover:bg-gray-700 border-gray-500"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(video.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 border-red-500"
                  >
                    Deletar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && videos.length === 0 && <p className="text-white">Nenhum vídeo encontrado.</p>}
      </motion.div>
    </motion.div>
  )
}

export default DeleteVideoPopup
