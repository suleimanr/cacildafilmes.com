"use client"

import type React from "react"
import ReactMarkdown from "react-markdown"
import RoteiroFormatado from "./RoteiroFormatado"

interface MessageContentProps {
  content: string
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Verificar se o conteúdo é um roteiro
  const roteiroRegex = /:::roteiro\s*([\s\S]*?)\s*:::/
  const match = String(content || "").match(roteiroRegex)

  // Verificar também se o conteúdo parece ser um roteiro mesmo sem as tags
  const isLikelyRoteiro =
    !match &&
    String(content || "").includes("🎬") &&
    (String(content || "").includes("[") || String(content || "").includes("CENA"))

  if (match) {
    // Se for um roteiro com tags, extrair o conteúdo entre as tags e usar o componente RoteiroFormatado
    const roteiroContent = match[1]
    return <RoteiroFormatado content={roteiroContent} />
  } else if (isLikelyRoteiro) {
    // Se parecer um roteiro mesmo sem as tags, usar o componente RoteiroFormatado
    return <RoteiroFormatado content={String(content || "")} />
  } else {
    // Se não for um roteiro, renderizar como markdown normal
    return (
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
        <ReactMarkdown>{String(content || "")}</ReactMarkdown>
      </div>
    )
  }
}

export default MessageContent
