"use client"
import { motion } from "framer-motion"

interface RoteiroFormatadoProps {
  content: string
}

export default function RoteiroFormatado({ content }: RoteiroFormatadoProps) {
  // Process the content to identify different parts of the script
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="bg-gray-900 border border-blue-500 rounded-lg p-4 my-4 text-white">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Roteiro Formatado
      </h2>

      <div className="space-y-4">
        {lines.map((line, index) => {
          // Check if line is a section header (starts with 📍)
          if (line.startsWith("📍")) {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-l-4 border-blue-500 pl-3 py-1 font-bold text-blue-300"
              >
                {line}
              </motion.div>
            )
          }

          // Check if line is a camera instruction (enclosed in [])
          if (line.startsWith("[") && line.endsWith("]")) {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 text-gray-300 p-2 rounded italic"
              >
                {line}
              </motion.div>
            )
          }

          // Check if line starts with an emoji (like 🎬)
          if (/^\p{Emoji}/u.test(line)) {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="font-bold text-lg text-yellow-300"
              >
                {line}
              </motion.div>
            )
          }

          // Default formatting for regular lines
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="border-l-2 border-green-500 pl-3 py-1"
            >
              {line}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
