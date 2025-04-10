import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Roboto, Bebas_Neue } from "next/font/google"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import HelpButton from "@/components/HelpButton"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ElevenLabsToolHandler from "@/components/ElevenLabsToolHandler"

// Configuração das fontes usando next/font
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})
const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas-neue",
})

export const metadata: Metadata = {
  title: "Cacilda Filmes",
  description: "Transformando o aprendizado corporativo",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const showHeader = params.slug !== "portfolio"

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} ${roboto.variable} ${bebasNeue.variable} font-sans`}>
        {showHeader && <Header />}
        <Sidebar />
        {children}
        <HelpButton />
        <ElevenLabsToolHandler />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  )
}


import './globals.css'