"use client"

import type React from "react"
import RoteiroFormatado from "./RoteiroFormatado"

interface MessageContentProps {
  content: string
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Verificar se o conteúdo é um roteiro
  const isRoteiro = content.includes(":::roteiro") && content.includes(":::")

  if (isRoteiro) {
    // Extrair o conteúdo do roteiro
    const match = content.match(/:::roteiro\s*([\s\S]*?)\s*:::/)
    const roteiroContent = match ? match[1] : content
    return <RoteiroFormatado content={roteiroContent} />
  } else {
    // Renderizar como texto normal
    return <div className="whitespace-pre-wrap">{content}</div>
  }
}

export default MessageContent
