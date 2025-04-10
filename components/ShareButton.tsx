"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Share2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  videoId: string
  title: string
  isMobile?: boolean
}

export default function ShareButton({ videoId, title, isMobile = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://vimeo.com/${videoId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (platform: string) => {
    const shareText = `Confira este vídeo: ${title}`

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank")
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        )
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "email":
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          "_blank",
        )
        break
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: shareText,
              url: shareUrl,
            })
          } catch (error) {
            console.error("Erro ao compartilhar:", error)
          }
        } else {
          handleCopyLink()
        }
        break
      default:
        handleCopyLink()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black/50 backdrop-blur-sm border-[0.5px] border-white/50 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-full flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
        >
          <Share2 size={isMobile ? 12 : 16} />
          <span className={isMobile ? "sr-only" : ""}>Compartilhar</span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare("whatsapp")}>WhatsApp</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("facebook")}>Facebook</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("twitter")}>Twitter</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("linkedin")}>LinkedIn</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("email")}>Email</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("native")}>
          {navigator.share ? "Compartilhar..." : copied ? "Link copiado!" : "Copiar link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
