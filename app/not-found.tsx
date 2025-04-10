import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Página não encontrada</h2>
        <p className="mb-6">A página que você está procurando não existe ou foi movida.</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}
