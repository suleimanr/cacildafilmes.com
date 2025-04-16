"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"

interface BriefingUploadProps {
  onRoteiroGenerated: (roteiro: string) => void
}

export default function BriefingUpload({ onRoteiroGenerated }: BriefingUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    try {
      const response = await fetch("/api/briefing-upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`)
      }

      // Ler o stream da resposta
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let roteiro = ""

      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          roteiro += decoder.decode(value, { stream: true })
        }
      } else {
        const data = await response.json()
        roteiro = data.roteiro || "Não foi possível gerar o roteiro."
      }

      toast.success("Roteiro criado com sucesso!")
      onRoteiroGenerated(roteiro)
    } catch (error) {
      console.error("Erro ao processar o briefing:", error)
      toast.error("Erro ao processar o briefing. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-all duration-300 ${
        isDragActive ? "border-green-500 bg-gray-800" : "border-gray-600"
      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
          <p className="text-white">Processando o briefing...</p>
        </div>
      ) : isDragActive ? (
        <p className="text-green-400">Solte o PDF aqui</p>
      ) : (
        <div>
          <p className="text-gray-300 mb-2">
            Arraste e solte o arquivo PDF do briefing aqui, ou clique para selecionar.
          </p>
          <p className="text-gray-400 text-sm">O arquivo será processado e um roteiro será gerado automaticamente.</p>
        </div>
      )}
    </div>
  )
}
