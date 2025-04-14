import type React from "react"
import type { Metadata } from "next"
import PortfolioHeader from "@/components/PortfolioHeader"

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
    <div className="bg-black min-h-screen">
      <PortfolioHeader />
      <div className="pt-8 sm:pt-12">{children}</div>
    </div>
  )
}
