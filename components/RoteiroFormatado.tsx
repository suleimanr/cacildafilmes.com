"use client"

import type React from "react"
import { motion } from "framer-motion"

interface RoteiroFormatadoProps {
  content: string
}

const RoteiroFormatado: React.FC<RoteiroFormatadoProps> = ({ content }) => {
  // Função para processar o conteúdo linha por linha
  const processContent = (content: string) => {
    const lines = content.split("\n")
    const processedLines = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === "") {
        processedLines.push({ type: "blank", content: "" })
      } else if (line.startsWith("🎬")) {
        // Título do roteiro
        processedLines.push({ type: "title", content: line })
      } else if (line.startsWith("📍")) {
        // Seção (Introdução, Desenvolvimento, etc)
        processedLines.push({ type: "section", content: line })
      } else if (line.match(/^\[.*\]$/)) {
        // Instruções entre colchetes
        const instruction = line.substring(1, line.length - 1)
        if (instruction.toLowerCase().includes("lettering:")) {
          // Lettering especial
          processedLines.push({ type: "lettering", content: instruction })
        } else {
          // Instrução normal
          processedLines.push({ type: "instruction", content: instruction })
        }
      } else if (line.startsWith('"') && line.endsWith('"')) {
        // Falas entre aspas
        processedLines.push({ type: "speech", content: line })
      } else {
        // Texto normal
        processedLines.push({ type: "text", content: line })
      }
    }

    return processedLines
  }

  const processedContent = processContent(content)

  // Animação para os elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  // Função para renderizar cada tipo de linha
  const renderLine = (line: { type: string; content: string }, index: number) => {
    switch (line.type) {
      case "title":
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xl md:text-2xl p-4 rounded-lg mb-6"
          >
            {line.content}
          </motion.div>
        )
      case "section":
        // Determinar o ícone com base no nome da seção
        let icon = "📍"
        const sectionName = line.content.toLowerCase()

        if (sectionName.includes("introdução")) {
          icon = "🎬"
        } else if (sectionName.includes("desenvolvimento") || sectionName.includes("seção")) {
          icon = "🎞️"
        } else if (sectionName.includes("encerramento") || sectionName.includes("conclusão")) {
          icon = "🏁"
        }

        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="border-l-4 border-blue-500 pl-3 font-semibold text-lg md:text-xl mb-4 flex items-center"
          >
            <span className="mr-2 text-xl">{icon}</span>
            {line.content}
          </motion.div>
        )
      case "instruction":
        return (
          <motion.div key={index} variants={itemVariants} className="bg-gray-100 p-3 rounded-md mb-4 flex items-start">
            <span className="mr-2 text-xl">🎬</span>
            <span className="text-gray-700">{line.content}</span>
          </motion.div>
        )
      case "lettering":
        // Extrair o texto do lettering
        const letteringMatch = line.content.match(/lettering:\s*["'](.+?)["']/i)
        const letteringText = letteringMatch ? letteringMatch[1] : line.content

        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-blue-600 text-white p-3 rounded-md mb-4 font-bold text-center uppercase"
          >
            {letteringText}
          </motion.div>
        )
      case "speech":
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="border-l-4 border-green-500 pl-3 py-2 mb-4 flex items-start"
          >
            <span className="mr-2 text-xl">🧑‍🏫</span>
            <span className="italic">{line.content}</span>
          </motion.div>
        )
      case "text":
        return (
          <motion.div key={index} variants={itemVariants} className="mb-4">
            {line.content}
          </motion.div>
        )
      case "blank":
        return <div key={index} className="h-2"></div>
      default:
        return <div key={index}>{line.content}</div>
    }
  }

  return (
    <motion.div
      className="bg-white text-black p-6 rounded-lg shadow-md max-w-4xl mx-auto my-4 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {processedContent.map((line, index) => renderLine(line, index))}
    </motion.div>
  )
}

export default RoteiroFormatado
