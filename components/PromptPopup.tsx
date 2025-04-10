"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PromptPopupProps {
  onClose: () => void
  onSubmit: (type: string, content: string) => Promise<void>
}

const PromptPopup: React.FC<PromptPopupProps> = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState("")
  const [type, setType] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !content.trim()) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await onSubmit(type, content)
      onClose()
    } catch (err) {
      console.error("Erro ao enviar o prompt:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao enviar o prompt")
    } finally {
      setIsLoading(false)
    }
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
        className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Adicionar à Base de Conhecimento</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 bg-red-100 p-2 sm:p-3 rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="type" className="text-white text-sm sm:text-base">
              Tipo de Conteúdo
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full bg-gray-700 text-white border-gray-600 text-sm sm:text-base">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_info">Informações da Empresa</SelectItem>
                <SelectItem value="portfolio_info">Informações do Portfólio</SelectItem>
                <SelectItem value="service_info">Informações de Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-white text-sm sm:text-base">
              Conteúdo
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-24 sm:h-32 p-2 bg-gray-700 text-white border-gray-600 rounded text-sm sm:text-base"
              placeholder="Digite o conteúdo para adicionar à base de conhecimento..."
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="bg-gray-600 text-white hover:bg-gray-700 border-gray-500 w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 border-blue-500 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default PromptPopup
