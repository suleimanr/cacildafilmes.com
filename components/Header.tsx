"use client"

import { useState, useEffect } from "react"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

interface HeaderProps {
  chatInteracted?: boolean
}

const Header: React.FC<HeaderProps> = ({ chatInteracted = false }) => {
  const [hasInteracted, setHasInteracted] = useState(chatInteracted)
  const [wordIndex, setWordIndex] = useState(0)

  const words = [
    "Crie",
    "Escreva",
    "Pergunte",
    "Descubra",
    "Aprenda",
    "Grave",
    "Resolva",
    "Inove",
    "Compartilhe",
    "É com a",
    "Pense",
  ]

  // Alternar palavras a cada 1.2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 1200)

    return () => clearInterval(interval)
  }, [words.length])

  // Detectar interação com o chat através de um evento personalizado
  useEffect(() => {
    const handleChatInteraction = () => {
      console.log("Header: Chat interaction detected")
      setHasInteracted(true)
    }

    window.addEventListener("chatInteraction", handleChatInteraction)

    return () => {
      window.removeEventListener("chatInteraction", handleChatInteraction)
    }
  }, [])

  // Também atualizar quando a prop chatInteracted mudar
  useEffect(() => {
    if (chatInteracted) {
      console.log("Header: chatInteracted prop changed to true")
      setHasInteracted(true)
    }
  }, [chatInteracted])

  const pathname = usePathname()
  const isPortfolioPage = pathname?.startsWith("/portfolio")

  // Se estiver na página de portfólio, não renderize nada
  if (isPortfolioPage) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-30">
      <motion.div
        className="flex justify-center items-center py-2 sm:py-4"
        initial={{ y: "calc(50vh - 80px - 48px)" }}
        animate={{ y: hasInteracted ? 0 : "calc(50vh - 80px - 48px)" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="flex items-center">
          <div className="relative h-8 mr-3 sm:mr-4 min-w-[80px] sm:min-w-[120px] flex items-center justify-end">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="text-white text-xl sm:text-2xl font-light absolute right-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          <Link href="/" className="relative w-36 sm:w-48 h-12 sm:h-16 block">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_cacilda_branco-s4HJCLoA37rroomFzzgQXIrg0KMt2N.png"
              alt="Cacilda Filmes Logo"
              fill
              sizes="(max-width: 768px) 100vw, 192px"
              priority
              className="object-contain"
            />
          </Link>
        </div>
      </motion.div>
    </header>
  )
}

export default Header
