"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
          <h2 className="text-3xl font-bold mb-4">Algo deu errado!</h2>
          <p className="mb-8 text-gray-400">Ocorreu um erro inesperado. Por favor, tente novamente.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
