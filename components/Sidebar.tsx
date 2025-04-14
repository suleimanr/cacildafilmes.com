"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { X } from "lucide-react"

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm sidebar-toggle"
        aria-label="Abrir menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white z-40 p-4 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-grow">
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="block hover:text-blue-400">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="block hover:text-blue-400">
                    Portfólio
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mt-auto text-center text-gray-500">
              <p className="text-xs">&copy; 2023 Cacilda Filmes</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
