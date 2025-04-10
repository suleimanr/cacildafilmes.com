"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import GuidedTour from "./GuidedTour"

export default function HelpButton() {
  const [showTutorial, setShowTutorial] = useState(false)

  const handleTutorialComplete = () => {
    setShowTutorial(false)
  }

  return (
    <>
      <button
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-20 right-2 sm:right-4 bg-blue-600 text-white rounded-lg p-1.5 sm:p-2 shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center"
        aria-label="Ajuda"
      >
        <HelpCircle size={16} className="mr-1" />
        <span className="text-xs sm:text-sm">Tutorial</span>
      </button>

      <GuidedTour isOpen={showTutorial} onClose={() => setShowTutorial(false)} onComplete={handleTutorialComplete} />
    </>
  )
}
