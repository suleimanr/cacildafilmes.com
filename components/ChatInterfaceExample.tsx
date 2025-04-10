"use client"

import type React from "react"

import { useState } from "react"
import type { Message } from "ai"
import ChatInterfaceWithRoteiro from "./ChatInterfaceWithRoteiro"

export default function ChatInterfaceExample() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // Adicionar mensagem do usuário
    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simular resposta do assistente (em um app real, você faria uma chamada API aqui)
    setTimeout(() => {
      // Exemplo de resposta com roteiro
      let assistantResponse = ""

      // Simular uma resposta normal ou uma resposta com roteiro
      if (input.toLowerCase().includes("roteiro") || messages.length % 3 === 0) {
        assistantResponse = `:::roteiro
🎬 Roteiro: Exemplo de Roteiro

📍 Introdução  
[Plano aberto | Apresentador entra em cena]

"Olá! Seja bem-vindo ao nosso exemplo de roteiro formatado."

📍 Seção 1 – Conceitos Básicos  
[Lettering: "FORMATAÇÃO PROFISSIONAL"]

"Vamos explorar como criar roteiros bem formatados."

📍 Seção 2 – Aplicações Práticas
[Close no apresentador | Gestos enfáticos]

"Estes roteiros podem ser usados para vídeos, apresentações e muito mais!"

📍 Encerramento  
[Plano médio | Apresentador sorri]

"Espero que tenha gostado deste exemplo. Até a próxima!"
:::`
      } else {
        assistantResponse =
          "Esta é uma resposta normal, sem formatação de roteiro. Para ver um exemplo de roteiro formatado, digite algo que inclua a palavra 'roteiro'."
      }

      const assistantMessage: Message = { role: "assistant", content: assistantResponse }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <ChatInterfaceWithRoteiro
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        setMessages={setMessages}
      />
    </div>
  )
}
