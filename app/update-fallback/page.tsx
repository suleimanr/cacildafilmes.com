"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function UpdateFallbackPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [videoCount, setVideoCount] = useState(0)
  const [tableName, setTableName] = useState<string | null>(null)
  const [environment, setEnvironment] = useState<string | null>(null)

  const fetchFallbackVideos = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    setCode(null)
    setTableName(null)
    setEnvironment(null)

    try {
      const response = await fetch("/api/get-fallback-videos", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setCode(data.code)
        setVideoCount(data.count)
        setTableName(data.tableName)
        setEnvironment(data.environment)
        setSuccess(true)
      } else {
        throw new Error(data.error || "Erro desconhecido ao buscar vídeos")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          alert("Código copiado para a área de transferência!")
        })
        .catch((err) => {
          console.error("Erro ao copiar para a área de transferência:", err)
          alert("Erro ao copiar para a área de transferência. Por favor, selecione e copie manualmente.")
        })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Atualizar FALLBACK_VIDEOS</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar vídeos para atualizar o fallback</CardTitle>
          <CardDescription>
            Este utilitário busca todos os vídeos da tabela apropriada do Supabase e gera o código para atualizar o
            arquivo lib/constants.ts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchFallbackVideos} disabled={loading} className="mb-4">
            {loading ? "Buscando vídeos..." : "Buscar vídeos e gerar código"}
          </Button>

          {environment && tableName && (
            <Alert className="mb-4">
              <AlertTitle>Informações do ambiente</AlertTitle>
              <AlertDescription>
                Ambiente: <strong>{environment}</strong>
                <br />
                Tabela: <strong>{tableName}</strong>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
              <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>
                <p>
                  Encontrados {videoCount} vídeos na tabela {tableName}.
                </p>
                <p className="mt-2">Copie o código abaixo e substitua o conteúdo do arquivo lib/constants.ts</p>
                <Button onClick={copyToClipboard} className="mt-2">
                  Copiar código para a área de transferência
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {code && (
        <Card>
          <CardHeader>
            <CardTitle>Código gerado</CardTitle>
            <CardDescription>Copie este código e substitua o conteúdo do arquivo lib/constants.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap">{code}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Instruções:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Clique no botão "Buscar vídeos e gerar código" para buscar os vídeos da tabela apropriada.</li>
          <li>Copie o código gerado usando o botão "Copiar código para a área de transferência".</li>
          <li>Abra o arquivo lib/constants.ts no seu editor de código.</li>
          <li>Substitua todo o conteúdo do arquivo pelo código copiado.</li>
          <li>Salve o arquivo e reinicie o servidor de desenvolvimento.</li>
        </ol>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Alternativa: Usando o script</h2>
        <p className="mb-2">
          Você também pode executar o script diretamente no terminal para atualizar automaticamente o arquivo:
        </p>
        <div className="bg-gray-100 p-4 rounded">
          <code>npx ts-node scripts/update-fallback-videos.ts</code>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Nota: O script sempre busca da tabela videosprod, independentemente do ambiente.
        </p>
      </div>
    </div>
  )
}
