"use client"

export default function ThinkingAnimation() {
  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="text-gray-400">Pensando...</span>
    </div>
  )
}
