"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Fechar a sidebar quando clicar em um link (opcional)
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Botão de toggle quando fechado - círculo com "C" */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-2 sm:top-4 left-2 sm:left-4 z-40 bg-black rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-800"
          aria-label="Abrir menu"
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c_da%20cacilda-ubHzFIL2iZhqUTg8XSlzkrN44mGK5N.png"
            alt="C"
            width={24}
            height={24}
            className="w-4 h-4 sm:w-6 sm:h-6"
          />
        </button>
      )}

      {/* Sidebar completa */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 h-screen w-full sm:w-64 bg-black/50 backdrop-blur-sm text-white z-40 flex flex-col border-r border-gray-800"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Cabeçalho com logo */}
            <div className="p-3 sm:p-4 pb-2 sm:pb-3 flex flex-col items-center border-b border-gray-800">
              <div className="text-center mb-1 sm:mb-2 relative w-32 sm:w-40 h-10 sm:h-14">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_cacilda_branco-oW4mlHomp8Wf1J1FU4m5d6oVVArDh2.png"
                  alt="CACILDA"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-gray-400 text-xs sm:text-base">Produtora Criativa</p>
            </div>

            {/* Navegação */}
            <div className="p-3 sm:p-4">
              <h2 className="text-gray-500 text-xs tracking-wider mb-2 sm:mb-3">NAVEGAÇÃO</h2>
              <nav>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="flex items-center p-1.5 sm:p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      onClick={handleLinkClick}
                    >
                      <span className="mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="sm:w-[18px] sm:h-[18px]"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      </span>
                      <span className="text-sm sm:text-base">Home</span>
                      {typeof window !== "undefined" && window.location.pathname === "/" && (
                        <span className="ml-auto">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full inline-block"></span>
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/portfolio"
                      className="flex items-center p-1.5 sm:p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      onClick={handleLinkClick}
                    >
                      <span className="mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="sm:w-[18px] sm:h-[18px]"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                          <line x1="7" y1="2" x2="7" y2="22"></line>
                          <line x1="17" y1="2" x2="17" y2="22"></line>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <line x1="2" y1="7" x2="7" y2="7"></line>
                          <line x1="2" y1="17" x2="7" y2="17"></line>
                          <line x1="17" y1="17" x2="22" y2="17"></line>
                          <line x1="17" y1="7" x2="22" y2="7"></line>
                        </svg>
                      </span>
                      <span className="text-sm sm:text-base">Portfolio</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Destaque */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 flex-grow">
              <h2 className="text-gray-500 text-xs tracking-wider mb-2 sm:mb-3">DESTAQUE</h2>
              <div className="bg-black rounded-lg overflow-hidden border border-gray-800">
                <div className="relative aspect-video">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sidebar%20aberta-BR5CHIQgaZmOr3QVd9bpQrTjezJLub.png"
                    alt="Reel Cacilda"
                    fill
                    className="object-cover"
                  />
                </div>
                <Link
                  href="/portfolio"
                  className="flex items-center justify-between p-2 sm:p-3 text-white bg-black hover:bg-gray-900 transition-colors"
                  onClick={handleLinkClick}
                >
                  <span className="text-xs sm:text-sm">Ver portfolio completo</span>
                  <ChevronRight size={14} className="sm:size-16" />
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 text-center text-gray-500 text-xs border-t border-gray-800">
              <p>&copy; 2025 Cacilda Filmes</p>
              <p>Todos os direitos reservados</p>
            </div>

            {/* Botão para fechar */}
            <button
              onClick={toggleSidebar}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white"
              aria-label="Fechar menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-5 sm:h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
