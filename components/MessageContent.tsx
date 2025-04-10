import RoteiroFormatado from "./RoteiroFormatado"

interface MessageContentProps {
  content: string
}

// Função para verificar se o conteúdo é um roteiro
const isRoteiro = (content: string): boolean => {
  return content.includes(":::roteiro") && content.includes(":::")
}

// Função para extrair o conteúdo do roteiro
const extractRoteiroContent = (content: string): string => {
  const match = content.match(/:::roteiro\s*([\s\S]*?)\s*:::/)
  return match ? match[1] : content
}

export default function MessageContent({ content }: MessageContentProps) {
  if (isRoteiro(content)) {
    const roteiroContent = extractRoteiroContent(content)
    return <RoteiroFormatado content={roteiroContent} />
  }

  return <div className="leading-relaxed text-sm sm:text-base md:text-lg text-white font-sans">{content}</div>
}
