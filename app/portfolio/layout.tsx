import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Sidebar from "@/components/Sidebar"
import PortfolioHeader from "@/components/PortfolioHeader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portfólio | Cacilda Filmes",
  description: "Conheça nossos trabalhos e projetos",
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} bg-black min-h-screen`}>
      <PortfolioHeader />
      <Sidebar />
      <div className="pt-8 sm:pt-12">{children}</div>
    </div>
  )
}
