"use client"

import type React from "react"

import { useRef } from "react"

import { useState, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import WaveformIcon from "./WaveformIcon"

interface OpenAIAssistantProps {
  onMessageSent: (message: string) => void
  onToggleCall?: () => void
  isCallActive?: boolean
  isCentered?: boolean
  onFirstInteraction?: () => void
  onInputChange?: (input: string) => void
  hashtagSuggestions?: string[]
  className?: string
}

export default function OpenAIAssistant({
  onMessageSent,
  onToggleCall,
  isCallActive = false,
  isCentered = false,
  onFirstInteraction,
  onInputChange,
  hashtagSuggestions = [],
  className,
}: OpenAIAssistantProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Função para ajustar a altura do textarea conforme o conteúdo
  const adjustTextareaHeight = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = "auto"
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`
  }, [])

  // Função para lidar com a mudança no input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setInput(value)

      if (onInputChange) {
        onInputChange(value)
      }

      if (e.target) {
        adjustTextareaHeight(e.target)
      }

      // Disparar o evento de primeira interação
      if (value.length === 1 && onFirstInteraction) {
        onFirstInteraction()
      }
    },
    [adjustTextareaHeight, onInputChange, onFirstInteraction],
  )

  // Função para enviar a mensagem
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!input.trim() || isLoading) return

      setIsLoading(true)

      try {
        await onMessageSent(input)
        setInput("")

        // Resetar a altura do textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, onMessageSent],
  )

  // Função para lidar com teclas pressionadas
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enviar mensagem com Enter (sem Shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    },
    [handleSubmit],
  )

  // Efeito para focar no textarea quando o componente montar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          className="w-full py-3 px-4 bg-red-900 text-white border-none focus:outline-none focus:ring-0 resize-none overflow-hidden min-h-[60px]"
          style={{ borderRadius: "8px" }}
        />

        {/* Sugestões de hashtags */}
        {hashtagSuggestions.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-md p-2 z-10">
            <div className="flex flex-wrap gap-2">
              {hashtagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setInput((prev) => prev.replace(/#$/, tag + " "))
                    if (textareaRef.current) {
                      textareaRef.current.focus()
                    }
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botão de chamada de voz */}
        {onToggleCall && (
          <button
            type="button"
            onClick={onToggleCall}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
              isCallActive ? "bg-red-600" : "bg-gray-700"
            } hover:opacity-80 transition-colors`}
            aria-label={isCallActive ? "Encerrar chamada" : "Iniciar chamada de voz"}
          >
            <WaveformIcon className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  )
}
