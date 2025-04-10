"use client"
import { motion } from "framer-motion"

interface RoteiroFormatadoProps {
  content: string
}

export default function RoteiroFormatado({ content }: RoteiroFormatadoProps) {
  // Processar o conteúdo do roteiro
  const lines = content.split("\n").filter((line) => line.trim() !== "")

  // Função para determinar o tipo de linha
  const getLineType = (line: string) => {
    if (line.startsWith("🎬") || line.startsWith("# ")) return "title"
    if (line.startsWith("📍")) return "section"
    if (line.match(/^\[.*\]$/)) return "instruction"
    if (line.startsWith('"') && line.endsWith('"')) return "speech"
    if (line.includes("[") && line.includes("]")) return "lettering"
    return "text"
  }

  // Função para renderizar cada linha com base em seu tipo
  const renderLine = (line: string, index: number) => {
    const type = getLineType(line)

    switch (type) {
      case "title":
        return (
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg mb-6 mt-4"
          >
            {line.replace(/🎬|#/g, "").trim()}
          </motion.h1>
        )

      case "section":
        return (
          <motion.h2
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="text-xl md:text-2xl font-semibold text-blue-400 border-l-4 border-blue-500 pl-3 py-2 my-4"
          >
            {line.replace(/📍/g, "").trim()}
          </motion.h2>
        )

      case "instruction":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="bg-gray-800 text-gray-300 p-3 rounded-md my-3 font-mono text-sm md:text-base italic"
          >
            {line
              .replace(/\[|\]/g, "")
              .split("|")
              .map((part, i) => (
                <span key={i} className={i % 2 === 0 ? "text-yellow-400" : "text-green-400"}>
                  {i > 0 && " | "}
                  {part.trim().startsWith("Lettering") ? (
                    <>
                      <span className="text-yellow-400">Lettering: </span>
                      <span className="text-white font-bold">
                        {part.replace("Lettering:", "").replace("LETTERING:", "").trim()}
                      </span>
                    </>
                  ) : (
                    part.trim()
                  )}
                </span>
              ))}
          </motion.div>
        )

      case "lettering":
        const letteringMatch = line.match(/\[(.*?)\]/)
        const letteringText = letteringMatch ? letteringMatch[1] : ""
        const restOfText = line.replace(/\[.*?\]/, "")

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="my-3"
          >
            <span>{restOfText}</span>
            <span className="bg-blue-900 text-white px-2 py-1 rounded mx-1 font-bold">{letteringText}</span>
          </motion.div>
        )

      case "speech":
        return (
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="border-l-4 border-green-500 pl-4 py-2 my-3 text-white italic"
          >
            {line}
          </motion.blockquote>
        )

      default:
        return (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className="my-2 text-gray-200"
          >
            {line}
          </motion.p>
        )
    }
  }

  return (
    <div className="bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg border border-gray-700 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-red-500 mr-2">🎬</span>
          <h3 className="text-xl font-bold text-white">Roteiro Formatado</h3>
        </div>
        <div className="flex space-x-2">
          <span className="h-3 w-3 bg-red-500 rounded-full"></span>
          <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
          <span className="h-3 w-3 bg-green-500 rounded-full"></span>
        </div>
      </div>

      <div className="space-y-2">{lines.map((line, index) => renderLine(line, index))}</div>
    </div>
  )
}
