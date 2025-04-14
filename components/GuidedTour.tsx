"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, ArrowLeft } from "lucide-react"

interface TourStep {
  title: string
  description: string
  target: string // ID ou classe do elemento alvo
  position: "top" | "bottom" | "left" | "right" | "center"
  highlight?: boolean // Se deve destacar o elemento alvo
}

interface GuidedTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const tourSteps: TourStep[] = [
  {
    title: "Bem-vindo à Cacilda Filmes!",
    description:
      "Este tutorial rápido vai te mostrar como aproveitar ao máximo nosso site. Vamos conhecer todas as funcionalidades disponíveis!",
    target: "body",
    position: "center",
  },
  {
    title: "Assistente Virtual",
    description:
      "Este é nosso assistente virtual. Digite suas perguntas aqui sobre nossos serviços, portfólio, ou qualquer informação sobre a Cacilda Filmes.",
    target: ".chat-input",
    position: "top",
    highlight: true,
  },
  {
    title: "Botões de Acesso Rápido",
    description:
      "Estes botões permitem acessar rapidamente informações específicas. Clique em 'Portfólio' para ver nossos trabalhos, 'Serviços' para conhecer o que oferecemos, 'Sobre' para nossa história, ou 'Contato' para falar conosco.",
    target: ".quick-access-buttons",
    position: "top",
    highlight: true,
  },
  {
    title: "Menu Lateral",
    description:
      "Clique no ícone 'C' da Cacilda no canto superior esquerdo da tela para abrir o menu lateral. Lá você encontrará links para a página inicial e para nosso portfólio completo com todos os vídeos organizados por categoria.",
    target: ".sidebar-toggle",
    position: "right",
    highlight: true,
  },
  {
    title: "Página de Portfólio",
    description:
      "Na página de portfólio você encontrará um slider interativo com nossos melhores trabalhos e todos os vídeos organizados por categorias. É a melhor maneira de explorar nossos projetos!",
    target: ".sidebar-toggle",
    position: "right",
    highlight: true,
  },
  {
    title: "Pronto para começar!",
    description:
      "Agora você já sabe como navegar pelo nosso site. Se precisar de ajuda a qualquer momento, clique no botão de ajuda no canto inferior direito da tela para ver este tutorial novamente!",
    target: "body",
    position: "center",
  },
]

export default function GuidedTour({ isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  // Função auxiliar para encontrar elementos por várias estratégias
  const findElement = (selector: string): HTMLElement | null => {
    // Caso especial para o body
    if (selector === "body") return document.body

    let element: HTMLElement | null = null

    // Tenta encontrar pelo seletor exato
    element = document.querySelector(selector) as HTMLElement
    if (element) return element

    // Casos especiais para elementos específicos
    if (selector === ".chat-input") {
      // Tentar encontrar o textarea ou input
      element =
        (document.querySelector("textarea") as HTMLElement) ||
        (document.querySelector("input[type='text']") as HTMLElement) ||
        (document.querySelector(".chat-container textarea") as HTMLElement) ||
        (document.querySelector(".chat-container input") as HTMLElement)
    }

    if (selector === ".quick-access-buttons") {
      // Tentar várias estratégias para encontrar os botões de acesso rápido
      element =
        (document.querySelector('[class*="quick-access"]') as HTMLElement) ||
        (document.querySelector(".quick-access-container") as HTMLElement) ||
        (document.querySelector(".quick-access") as HTMLElement) ||
        (document.querySelector(".chat-buttons") as HTMLElement) ||
        // Tentar encontrar o container dos botões pelo conteúdo
        (Array.from(document.querySelectorAll("button")).find(
          (btn) =>
            btn.textContent?.includes("Portfólio") ||
            btn.textContent?.includes("Serviços") ||
            btn.textContent?.includes("Sobre") ||
            btn.textContent?.includes("Contato"),
        )?.parentElement as HTMLElement)

      // Se ainda não encontrou, tenta pegar o primeiro botão
      if (!element) {
        const portfolioButton = Array.from(document.querySelectorAll("button")).find((btn) =>
          btn.textContent?.includes("Portfólio"),
        )
        if (portfolioButton) {
          // Pega o container pai dos botões
          element = portfolioButton.parentElement as HTMLElement
        }
      }
    }

    if (selector === ".sidebar-toggle") {
      // Tentar encontrar o botão do sidebar
      element =
        (document.querySelector('button[aria-label*="menu"]') as HTMLElement) ||
        (document.querySelector('button[class*="sidebar"]') as HTMLElement) ||
        (document.querySelector('button[aria-label*="sidebar"]') as HTMLElement) ||
        (document.querySelector('button[aria-label*="Menu"]') as HTMLElement) ||
        // Tentar encontrar pelo conteúdo ou ícone
        (document.querySelector('button:has(svg[class*="menu"])') as HTMLElement)
    }

    if (selector === ".audio-button") {
      // Tentar encontrar o botão de áudio
      element =
        (document.querySelector('button[aria-label*="chamada"]') as HTMLElement) ||
        (document.querySelector('button[aria-label*="áudio"]') as HTMLElement) ||
        (document.querySelector('button[aria-label*="audio"]') as HTMLElement) ||
        (document.querySelector('button[class*="audio"]') as HTMLElement) ||
        (document.querySelector('button:has(svg[class*="waveform"])') as HTMLElement)
    }

    return element
  }

  // Atualiza o elemento alvo quando o passo muda
  useEffect(() => {
    if (!isOpen) return

    const step = tourSteps[currentStep]
    const element = findElement(step.target)

    setTargetElement(element)
    if (element && step.target !== "body") {
      setTargetRect(element.getBoundingClientRect())
    } else {
      setTargetRect(null)
    }
  }, [currentStep, isOpen])

  // Atualiza a posição do elemento alvo quando a janela é redimensionada
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })

      if (targetElement && tourSteps[currentStep].target !== "body") {
        setTargetRect(targetElement.getBoundingClientRect())
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [targetElement, currentStep])

  // Adicionar um observador de mutação para detectar mudanças no DOM
  useEffect(() => {
    if (!isOpen || !targetElement || tourSteps[currentStep].target === "body") return

    // Criar um observador que atualiza o retângulo do alvo quando o DOM muda
    const observer = new MutationObserver(() => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect())
      }
    })

    // Observar mudanças em todo o documento
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    })

    return () => observer.disconnect()
  }, [isOpen, targetElement, currentStep])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Calcula a posição do popup com base na posição do elemento alvo e tamanho da tela
  const getPopupPosition = () => {
    if (!targetRect || tourSteps[currentStep].position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: windowSize.width > 640 ? "400px" : "calc(100% - 40px)",
      }
    }

    const margin = windowSize.width > 640 ? 20 : 10 // Margem entre o popup e o elemento alvo
    const position = tourSteps[currentStep].position
    const popupWidth = windowSize.width > 640 ? 400 : windowSize.width - 40

    // Caso especial para o botão de áudio (passo 5)
    if (currentStep === 5) {
      // Posicionar à esquerda do botão de áudio para evitar cortes
      const leftPosition = Math.max(margin, targetRect.left - popupWidth - margin)

      return {
        top: `${targetRect.top + targetRect.height / 2}px`,
        left: `${leftPosition}px`,
        transform: "translateY(-50%)",
        maxWidth: `${popupWidth}px`,
      }
    }

    // Caso especial para os botões de acesso rápido (passo 2)
    if (currentStep === 2) {
      // Garantir que o popup fique acima dos botões e centralizado
      return {
        bottom: `${windowSize.height - targetRect.top + margin}px`,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: `${popupWidth}px`,
      }
    }

    // Ajustar posicionamento para telas pequenas
    if (windowSize.width <= 640) {
      // Em telas pequenas, posicionar no centro da tela para garantir visibilidade
      if (position === "left" || position === "right") {
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: `${windowSize.width - 40}px`,
        }
      }

      // Para posições top/bottom, verificar se há espaço suficiente
      if (targetRect.top > windowSize.height / 2) {
        // Se o elemento estiver na metade inferior da tela, posicionar acima
        return {
          bottom: `${windowSize.height - targetRect.top + margin}px`,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: `${windowSize.width - 40}px`,
        }
      } else {
        // Se o elemento estiver na metade superior da tela, posicionar abaixo
        return {
          top: `${targetRect.bottom + margin}px`,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: `${windowSize.width - 40}px`,
        }
      }
    }

    // Para telas maiores, usar o posicionamento original
    switch (position) {
      case "top":
        return {
          bottom: `${windowSize.height - targetRect.top + margin}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
          maxWidth: `${popupWidth}px`,
        }
      case "bottom":
        return {
          top: `${targetRect.bottom + margin}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
          maxWidth: `${popupWidth}px`,
        }
      case "left":
        // Garantir que não seja cortado à esquerda
        const leftPosition = Math.max(margin, targetRect.left - popupWidth - margin)
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${leftPosition}px`,
          transform: "translateY(-50%)",
          maxWidth: `${popupWidth}px`,
        }
      case "right":
        // Garantir que não seja cortado à direita
        const rightSpace = windowSize.width - targetRect.right - margin - popupWidth
        if (rightSpace < 0) {
          // Se não houver espaço suficiente à direita, posicionar abaixo
          return {
            top: `${targetRect.bottom + margin}px`,
            left: `${targetRect.left + targetRect.width / 2}px`,
            transform: "translateX(-50%)",
            maxWidth: `${popupWidth}px`,
          }
        }
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + margin}px`,
          transform: "translateY(-50%)",
          maxWidth: `${popupWidth}px`,
        }
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: `${popupWidth}px`,
        }
    }
  }

  // Renderiza o destaque ao redor do elemento alvo
  const renderHighlight = () => {
    if (!targetRect || tourSteps[currentStep].target === "body" || !tourSteps[currentStep].highlight) {
      return null
    }

    // Ajustar o tamanho do destaque para os botões de acesso rápido
    let highlightWidth = targetRect.width + 20
    let highlightHeight = targetRect.height + 20
    const highlightTop = targetRect.top - 10
    const highlightLeft = targetRect.left - 10
    const borderRadius = "8px"

    // Caso especial para os botões de acesso rápido (passo 2)
    if (currentStep === 2) {
      // Aumentar a área de destaque para cobrir todos os botões
      highlightWidth = Math.max(targetRect.width + 40, 300) // Mínimo de 300px de largura
      highlightHeight = targetRect.height + 20
    }

    return (
      <>
        {/* Overlay escuro com buraco para o elemento destacado */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none z-30"
          style={{
            maskImage: `radial-gradient(ellipse at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(highlightWidth, highlightHeight) * 0.6}px, black ${Math.max(highlightWidth, highlightHeight) * 0.6 + 50}px)`,
            WebkitMaskImage: `radial-gradient(ellipse at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(highlightWidth, highlightHeight) * 0.6}px, black ${Math.max(highlightWidth, highlightHeight) * 0.6 + 50}px)`,
          }}
        />

        {/* Círculo destacando o elemento */}
        <motion.div
          className="absolute z-40 pointer-events-none"
          style={{
            top: highlightTop,
            left: highlightLeft,
            width: highlightWidth,
            height: highlightHeight,
            borderRadius: borderRadius,
            border: "3px solid #FFFFFF",
          }}
          animate={{
            scale: [1, 1.05, 1],
            borderColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
            boxShadow: ["0 0 0 rgba(255,255,255,0.5)", "0 0 15px rgba(255,255,255,0.8)", "0 0 0 rgba(255,255,255,0.5)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />

        {/* Seta indicadora */}
        <motion.div
          className="absolute z-[60] pointer-events-none" // Aumentei o z-index para 60
          style={{
            ...getArrowPosition(),
          }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 5L19 12L12 19M5 12H18"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </>
    )
  }

  // Função para calcular a posição da seta indicadora
  const getArrowPosition = () => {
    if (!targetRect) return {}

    const position = tourSteps[currentStep].position

    // Caso especial para o botão de áudio (passo 5)
    if (currentStep === 5) {
      return {
        top: targetRect.top + targetRect.height / 2 - 15,
        left: targetRect.left - 40,
        transform: "rotate(0deg)",
      }
    }

    // Caso especial para os botões de acesso rápido (passo 2)
    if (currentStep === 2) {
      return {
        top: targetRect.top - 40,
        left: targetRect.left + targetRect.width / 2 - 15,
        transform: "rotate(90deg)",
      }
    }

    switch (position) {
      case "top":
        return {
          top: targetRect.top - 40,
          left: targetRect.left + targetRect.width / 2 - 15,
          transform: "rotate(90deg)",
        }
      case "bottom":
        return {
          top: targetRect.bottom + 10,
          left: targetRect.left + targetRect.width / 2 - 15,
          transform: "rotate(-90deg)",
        }
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2 - 15,
          left: targetRect.left - 40,
          transform: "rotate(0deg)",
        }
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2 - 15,
          left: targetRect.right + 10,
          transform: "rotate(180deg)",
        }
      default:
        return {
          display: "none",
        }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay transparente - removido o blur */}
      <div className="absolute inset-0" onClick={() => onClose()} />

      {/* Destaque do elemento alvo */}
      {renderHighlight()}

      {/* Popup de tutorial */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute z-50 bg-black dark:bg-gray-800 rounded-lg shadow-xl p-3 sm:p-6 border border-white"
          style={{
            ...getPopupPosition(),
            maxWidth:
              typeof window !== "undefined" ? (window.innerWidth > 640 ? "400px" : "calc(100vw - 32px)") : "400px",
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
            aria-label="Fechar tutorial"
          >
            <X size={20} />
          </button>

          {/* Conteúdo do tutorial */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{tourSteps[currentStep].title}</h3>
            <p className="text-sm sm:text-base text-gray-300">{tourSteps[currentStep].description}</p>
          </div>

          {/* Navegação do tutorial */}
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm text-gray-400">
              Passo {currentStep + 1} de {tourSteps.length}
            </div>
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-800 text-white rounded text-xs sm:text-sm hover:bg-gray-700 transition-colors border border-white"
                >
                  <ArrowLeft size={windowSize.width > 640 ? 16 : 12} className="mr-1" />
                  Anterior
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-black text-white rounded text-xs sm:text-sm hover:bg-gray-900 transition-colors border border-white"
              >
                {currentStep < tourSteps.length - 1 ? (
                  <>
                    Próximo
                    <ArrowRight size={windowSize.width > 640 ? 16 : 12} className="ml-1" />
                  </>
                ) : (
                  "Concluir"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
