import RoteiroFormatado from "./RoteiroFormatado"

interface MessageContentProps {
  content: string
}

// Function to check if content is a roteiro
const isRoteiro = (content: string): boolean => {
  return content.includes(":::roteiro") && content.includes(":::")
}

// Function to extract roteiro content
const extractRoteiroContent = (content: string): string => {
  const match = content.match(/:::roteiro\s*([\s\S]*?)\s*:::/)
  return match ? match[1] : content
}

export default function MessageContent({ content }: MessageContentProps) {
  if (isRoteiro(content)) {
    return <RoteiroFormatado content={extractRoteiroContent(content)} />
  }

  return <div className="leading-relaxed text-sm sm:text-base md:text-lg text-white font-sans">{content}</div>
}
