import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
      <p className="mb-8">Não foi possível encontrar a página solicitada.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Voltar para a página inicial
      </Link>
    </div>
  )
}
