"use client"

import { motion } from "framer-motion"

interface UploadProgressProps {
  progress: number
  message: string
}

export default function UploadProgress({ progress, message }: UploadProgressProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold text-white mb-4">{message}</h3>

        <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
          <motion.div
            className="bg-blue-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-center text-white">{progress}%</p>
      </div>
    </div>
  )
}
