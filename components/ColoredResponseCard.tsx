"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Phone, Mail, Instagram } from "lucide-react"

export type CardType = "portfolio" | "servicos" | "sobre" | "contato"

interface ColoredResponseCardProps {
  type: CardType
  title: string
  subtitle: string
  content: string
  buttonText?: string
  buttonLink?: string
  onClick?: () => void
}

const ColoredResponseCard: React.FC<ColoredResponseCardProps> = ({
  type,
  title,
  subtitle,
  content,
  buttonText,
  buttonLink,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = (e: React.MouseEvent) => {
    // Evitar que o toggle seja acionado quando clicar em links ou botões
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === "A" || e.target.tagName === "BUTTON" || e.target.closest("a") || e.target.closest("button"))
    ) {
      return
    }

    setIsExpanded(!isExpanded)
  }

  // Determinar a cor de fundo com base no tipo
  const getBgColor = () => {
    switch (type) {
      case "portfolio":
        return "bg-blue-600"
      case "servicos":
        return "bg-red-600"
      case "sobre":
        return "bg-yellow-400"
      case "contato":
        return "bg-green-500"
      default:
        return "bg-gray-800"
    }
  }

  // Determinar a categoria com base no tipo
  const getCategory = () => {
    switch (type) {
      case "portfolio":
        return "PORTFÓLIO"
      case "servicos":
        return "SERVIÇOS"
      case "sobre":
        return "SOBRE NÓS"
      case "contato":
        return "CONTATO"
      default:
        return "CACILDA FILMES"
    }
  }

  // Determinar a imagem com base no tipo
  const getImage = () => {
    switch (type) {
      case "portfolio":
        return "/images/portfolio-muitas.png"
      case "servicos":
        return "/images/servicos-coca.png"
      case "sobre":
        return "/images/sobre-estudio.png"
      case "contato":
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/foto_estudio_contato-9sM5iZYhns1nT7xGZD3NqF9P3IbGgB.png"
      default:
        return "/placeholder.svg?height=400&width=800"
    }
  }

  return (
    <div
      className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer mb-6"
      onClick={toggleExpand}
    >
      {/* Imagem com fundo colorido */}
      <div className={`relative ${getBgColor()}`}>
        <img src={getImage() || "/placeholder.svg"} alt={title} className="w-full h-48 sm:h-56 md:h-64 object-cover" />
      </div>

      {/* Informações do card com fundo preto */}
      <div className="bg-black text-white p-4">
        <div className="text-gray-400 text-sm font-medium mb-1">{getCategory()}</div>
        <h3 className="text-xl sm:text-2xl font-bold mb-1">{title}</h3>
        <p className="text-gray-300 text-sm">{subtitle}</p>

        {/* Botão de expandir/retrair */}
        {content && (
          <div
            className="mt-3 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            onClick={toggleExpand}
          >
            <span className="mr-1">{isExpanded ? "Ver menos" : "Ver mais"}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}

        {/* Conteúdo expandido */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto", marginTop: "10px" },
                collapsed: { opacity: 0, height: 0, marginTop: "0px" },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-gray-800 pt-3 mt-3">
                {content && <p className="text-gray-300 text-sm">{content}</p>}

                {/* Botão de ação - apenas para o card de portfólio */}
                {type === "portfolio" && (
                  <a
                    href="/portfolio"
                    className="block mt-4 bg-white text-black py-2 px-4 rounded hover:bg-gray-100 text-center text-sm font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onClick) onClick()
                    }}
                  >
                    Ver Portfólio Completo
                  </a>
                )}

                {/* Informações de contato */}
                {type === "contato" && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-300 mb-2">Entre em contato conosco:</p>
                    <div className="space-y-2">
                      <a
                        href="tel:+5511948878572"
                        className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="mr-2" size={16} />
                        +55 11 94887-8572
                      </a>
                      <a
                        href="mailto:atendimento@cacildafilmes.com"
                        className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="mr-2" size={16} />
                        atendimento@cacildafilmes.com
                      </a>
                      <a
                        href="https://instagram.com/cacildafilmes"
                        className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Instagram className="mr-2" size={16} />
                        @cacildafilmes
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ColoredResponseCard
