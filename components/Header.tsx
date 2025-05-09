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
        className="flex justify-center items-center py-4 sm:py-6 md:py-8"
        initial={{ y: "calc(50vh - 120px - 48px)" }}
        animate={{ y: hasInteracted ? 0 : "calc(50vh - 120px - 48px)" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Layout para dispositivos móveis (flex-col) */}
        <div className="sm:hidden flex flex-col items-center">
          <div className="relative h-6 flex items-center justify-center mb-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="text-white text-sm font-light"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          <Link href="/" className="relative w-24 h-10 block">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_cacilda_branco-s4HJCLoA37rroomFzzgQXIrg0KMt2N.png"
              alt="Cacilda Filmes Logo"
              fill
              sizes="112px"
              priority
              className="object-contain"
            />
          </Link>
        </div>

        {/* Layout para desktop (flex-row) - mantendo o original */}
        <div className="hidden sm:flex items-center">
          <div className="relative h-8 md:h-8 mr-4 min-w-[80px] md:min-w-[120px] flex items-center justify-end">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="text-white text-xl md:text-2xl font-light absolute right-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          <Link href="/" className="relative w-36 md:w-48 h-12 md:h-16 block">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_cacilda_branco-s4HJCLoA37rroomFzzgQXIrg0KMt2N.png"
              alt="Cacilda Filmes Logo"
              fill
              sizes="(max-width: 768px) 144px, 192px"
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
