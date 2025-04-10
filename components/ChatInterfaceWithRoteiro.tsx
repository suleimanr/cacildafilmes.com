"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Message } from "ai"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import ThinkingAnimation from "./ThinkingAnimation"
import ScrollToBottomButton from "./ScrollToBottomButton"
import { MessageRenderer } from "./MessageRenderer"
import QuickAccessButtons from "./QuickAccessButtons"

interface ChatInterfaceProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export default function ChatInterfaceWithRoteiro({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  setMessages,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Função para rolar para o final da conversa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Verificar quando mostrar o botão de rolagem
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShowScrollButton(!isNearBottom)
  }

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Adicionar event listener para scroll
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current
    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", handleScroll)
      return () => messagesContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Ajustar altura do textarea conforme o conteúdo
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    target.style.height = "auto"
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
  }

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Área de mensagens */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex justify-center mt-8">
            <QuickAccessButtons setMessages={setMessages} />
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {/* Aqui usamos o MessageRenderer para processar o conteúdo */}
                <MessageRenderer message={message} />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Botão de rolagem para o final */}
      {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}

      {/* Área de input */}
      <div className="border-t p-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-end space-x-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onInput={handleTextareaInput}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[40px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-10 w-10">
            {isLoading ? <ThinkingAnimation /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
