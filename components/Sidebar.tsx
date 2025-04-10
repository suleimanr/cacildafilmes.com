"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Film, ChevronRight } from "lucide-react"
import Image from "next/image"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest(".sidebar") && !target.closest(".sidebar-toggle")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren",
      },
    },
  }

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: {
      x: -20,
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  // Custom menu icon component - Using the C from Cacilda logo
  const MenuIcon = () => (
    <div className="w-6 h-6 flex items-center justify-center">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c_da%20cacilda-bgA15vR9sDKNZMh75ZLpgpBQ86lAgJ.png"
        alt="C da Cacilda"
        width={24}
        height={24}
        className="w-5 h-5"
      />
    </div>
  )

  // Custom close icon component
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <>
      {/* Toggle Button - Now with custom icon */}
      <button
        className="sidebar-toggle fixed top-4 sm:top-6 left-3 sm:left-4 z-50 bg-black/70 hover:bg-white/10 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/10"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Now with monochrome design */}
      <motion.div
        className="sidebar fixed top-0 left-0 h-full bg-black/90 backdrop-blur-md w-72 z-50 shadow-2xl overflow-hidden border-r border-white/5"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Header */}
          <motion.div className="p-6 border-b border-white/10 flex flex-col items-center" variants={itemVariants}>
            <div className="relative h-16 w-full mb-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_cacilda_branco-s4HJCLoA37rroomFzzgQXIrg0KMt2N.png"
                alt="Cacilda Filmes Logo"
                layout="fill"
                objectFit="contain"
                priority
                className="scale-90"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">Produtora Criativa</p>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3">
            <motion.div variants={itemVariants} className="mb-2 px-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navegação</p>
            </motion.div>

            <ul className="space-y-1">
              <motion.li variants={itemVariants}>
                <Link
                  href="/"
                  className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    pathname === "/"
                      ? "bg-white/5 text-white border-l-2 border-white/50"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Home
                      size={18}
                      className={pathname === "/" ? "text-white" : "text-gray-500 group-hover:text-white"}
                    />
                    <span>Home</span>
                  </div>
                  {pathname === "/" && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                  )}
                </Link>
              </motion.li>

              <motion.li variants={itemVariants}>
                <Link
                  href="/portfolio"
                  className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    pathname === "/portfolio"
                      ? "bg-white/5 text-white border-l-2 border-white/50"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Film
                      size={18}
                      className={pathname === "/portfolio" ? "text-white" : "text-gray-500 group-hover:text-white"}
                    />
                    <span>Portfolio</span>
                  </div>
                  {pathname === "/portfolio" && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                  )}
                </Link>
              </motion.li>
            </ul>

            {/* Featured Section */}
            <motion.div variants={itemVariants} className="mt-8 mb-2 px-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destaque</p>
            </motion.div>

            <motion.div variants={itemVariants} className="mx-3 mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3 group">
                <Image
                  src="https://vumbnail.com/754713544.jpg"
                  alt="Reel Cacilda Filmes"
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                  <p className="text-white text-sm font-medium">Reel Cacilda</p>
                </div>
              </div>
              <Link
                href="/portfolio"
                className="flex items-center justify-between text-sm text-white/80 hover:text-white transition-colors"
              >
                <span>Ver portfolio completo</span>
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </nav>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-auto p-4 border-t border-white/10 bg-black/50">
            <p className="text-gray-500 text-xs text-center">
              © 2025 Cacilda Filmes
              <br />
              <span className="text-gray-600">Todos os direitos reservados</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
