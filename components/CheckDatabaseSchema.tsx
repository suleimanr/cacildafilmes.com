"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function CheckDatabaseSchema() {
  const [isChecking, setIsChecking] = useState(true)
  const [showManualInstructions, setShowManualInstructions] = useState(false)
  const [sqlCommand, setSqlCommand] = useState("")

  useEffect(() => {
    const checkSchema = async () => {
      try {
        const response = await fetch("/api/add-thumbnail-column")
        const data = await response.json()

        if (data.success) {
          console.log(data.message)

          if (data.needsManualAction) {
            setSqlCommand(data.sql)
            setShowManualInstructions(true)
          } else if (data.message.includes("adicionada com sucesso")) {
            toast.success("Esquema do banco de dados atualizado com sucesso")
          }
        } else {
          console.error("Erro ao verificar esquema:", data.error)
          toast.error("Erro ao verificar esquema do banco de dados")
        }
      } catch (error) {
        console.error("Erro ao verificar esquema do banco de dados:", error)
        toast.error("Erro ao verificar esquema do banco de dados")
      } finally {
        setIsChecking(false)
      }
    }

    checkSchema()
  }, [])

  return (
    <>
      {showManualInstructions && (
        <Dialog open={showManualInstructions} onOpenChange={setShowManualInstructions}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Atualização do Banco de Dados Necessária</DialogTitle>
              <DialogDescription className="text-gray-300">
                É necessário adicionar uma coluna ao banco de dados para suportar thumbnails personalizadas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <p>Por favor, execute o seguinte comando SQL no seu painel do Supabase:</p>

              <div className="bg-gray-900 p-4 rounded-md overflow-x-auto">
                <code className="text-green-400">
                  {sqlCommand || "ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;"}
                </code>
              </div>

              <p>Após executar o comando, atualize esta página.</p>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowManualInstructions(false)}>Entendi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
