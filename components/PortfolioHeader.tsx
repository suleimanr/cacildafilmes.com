"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"

const PortfolioHeader: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 w-full bg-black flex justify-center py-3">
      <Link href="/" className="relative w-40 sm:w-48 h-12 sm:h-14 block">
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
  )
}

export default PortfolioHeader
