"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Content from "./components/Content"
import ScrollIndicator from "./components/ScrollIndicator"

const sections = [
  { id: "hero", content: "Punch Conteúdo" },
  { id: "about", content: "Sobre Nós" },
  { id: "services", content: "Nossos Serviços" },
  { id: "projects", content: "Nossos Projetos" },
  { id: "contact", content: "Contato" },
]

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0)
  const appRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0 && activeSection < sections.length - 1) {
        setActiveSection((prev) => prev + 1)
      } else if (e.deltaY < 0 && activeSection > 0) {
        setActiveSection((prev) => prev - 1)
      }
    }

    const appElement = appRef.current
    if (appElement) {
      appElement.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (appElement) {
        appElement.removeEventListener("wheel", handleWheel)
      }
    }
  }, [activeSection])

  return (
    <div
      ref={appRef}
      className="h-screen overflow-hidden bg-yellow-300 flex flex-col justify-center items-center relative"
    >
      {sections.map((section, index) => (
        <Content key={section.id} content={section.content} isActive={index === activeSection} />
      ))}
      <ScrollIndicator totalSections={sections.length} activeSection={activeSection} />
    </div>
  )
}

export default App
