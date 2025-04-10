"use client"

import type React from "react"
import { Briefcase, Info, Phone, ImageIcon } from "lucide-react"

interface QuickAccessButtonsProps {
  onButtonClick: (topic: string) => void
  className?: string
}

const QuickAccessButtons: React.FC<QuickAccessButtonsProps> = ({ onButtonClick, className = "" }) => {
  // Restaurar a estrutura original dos botões de acesso rápido
  const buttons = [
    {
      label: "Portfólio",
      topic: "portfolio",
      icon: <ImageIcon size={14} />,
      color: "from-blue-500 to-cyan-400",
      hoverColor: "hover:from-blue-600 hover:to-cyan-500",
    },
    {
      label: "Serviços",
      topic: "servicos",
      icon: <Briefcase size={14} />,
      color: "from-purple-500 to-pink-400",
      hoverColor: "hover:from-purple-600 hover:to-pink-500",
    },
    {
      label: "Sobre",
      topic: "sobre",
      icon: <Info size={14} />,
      color: "from-amber-500 to-yellow-400",
      hoverColor: "hover:from-amber-600 hover:to-yellow-500",
    },
    {
      label: "Contato",
      topic: "contato",
      icon: <Phone size={14} />,
      color: "from-emerald-500 to-green-400",
      hoverColor: "hover:from-emerald-600 hover:to-green-500",
    },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => onButtonClick(button.topic)}
          className="bg-black text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-900 transition-colors border border-white"
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}

export default QuickAccessButtons
