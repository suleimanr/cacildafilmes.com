"use client"

import type React from "react"

interface RoteiroFormatadoProps {
  content: string
}

const RoteiroFormatado: React.FC<RoteiroFormatadoProps> = ({ content }) => {
  // Função simplificada para processar o conteúdo
  const processContent = () => {
    const lines = content.split("\n")
    return lines.map((line, index) => {
      const trimmedLine = line.trim()

      if (trimmedLine === "") {
        return <div key={index} className="h-2"></div>
      } else if (trimmedLine.startsWith("🎬")) {
        return (
          <div
            key={index}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xl p-4 rounded-lg mb-6"
          >
            {trimmedLine}
          </div>
        )
      } else if (trimmedLine.startsWith("📍")) {
        return (
          <div key={index} className="border-l-4 border-blue-500 pl-3 font-semibold text-lg mb-4">
            {trimmedLine}
          </div>
        )
      } else if (trimmedLine.match(/^\[.*\]$/)) {
        return (
          <div key={index} className="bg-gray-100 p-3 rounded-md mb-4 text-gray-700">
            {trimmedLine}
          </div>
        )
      } else if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
        return (
          <div key={index} className="border-l-4 border-green-500 pl-3 py-2 mb-4 italic">
            {trimmedLine}
          </div>
        )
      } else {
        return (
          <div key={index} className="mb-4">
            {trimmedLine}
          </div>
        )
      }
    })
  }

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md max-w-4xl mx-auto my-4 font-sans">
      {processContent()}
    </div>
  )
}

export default RoteiroFormatado
