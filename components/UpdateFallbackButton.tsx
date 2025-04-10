"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Check } from "lucide-react"

export default function UpdateFallbackButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const updateFallback = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/update-fallback")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro ao atualizar fallback:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-4">
      <Button onClick={updateFallback} disabled={loading} className="mb-4">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Buscando vídeos...
          </>
        ) : (
          "Atualizar FALLBACK_VIDEOS com dados reais"
        )}
      </Button>

      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{result.success ? `${result.count} vídeos encontrados` : "Erro ao buscar vídeos"}</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <>
                <p className="mb-2">
                  Copie o código abaixo e substitua o conteúdo do arquivo <code>lib/constants.ts</code>:
                </p>
                <div className="relative">
                  <Textarea value={result.code} readOnly className="h-[300px] font-mono text-sm" />
                  <Button variant="outline" size="icon" className="absolute top-2 right-2" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Primeiros 3 vídeos:</h3>
                  {result.videos.slice(0, 3).map((video: any, index: number) => (
                    <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                      <p>
                        <strong>{video.title}</strong> (ID: {video.vimeo_id})
                      </p>
                      <p>Cliente: {video.client}</p>
                      <p>Categoria: {video.category}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-red-500">{result.message}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
