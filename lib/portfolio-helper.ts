import { supabase } from "@/lib/supabase"

// Função para determinar qual tabela de vídeos usar com base no ambiente
export function getVideoTableName() {
  return process.env.NODE_ENV === "production" ? "videosprod" : "videos"
}

// Função para gerar uma resposta de portfólio completa com todos os vídeos
export async function generatePortfolioResponse() {
  try {
    // Buscar vídeos do Supabase
    const tableName = getVideoTableName()
    const { data: videos, error } = await supabase.from(tableName).select("*")

    if (error) {
      console.error(`Erro ao buscar vídeos da tabela ${tableName}:`, error)
      return generatePortfolioResponseSync()
    }

    if (!videos || videos.length === 0) {
      console.log(`Nenhum vídeo encontrado na tabela ${tableName}.`)
      return generatePortfolioResponseSync()
    }

    return `
# Portfólio da Cacilda Filmes

A Cacilda Filmes é especializada em produção audiovisual para educação corporativa, criando conteúdos personalizados de alta qualidade para grandes empresas e marcas reconhecidas.

## Como acessar nosso portfólio completo

Para visualizar todos os nossos trabalhos em uma interface interativa:

1. Clique no ícone "C" da Cacilda no canto superior esquerdo da tela para abrir a barra lateral
2. Na barra lateral, você encontrará a opção "Portfolio"
3. Clique em "Portfolio" para acessar a página completa

Na página de portfólio você encontrará:
- Um slider interativo com nossos principais trabalhos
- Vídeos organizados por categorias
- Opção de visualizar cada vídeo em tela cheia
- Informações detalhadas sobre cada projeto

Esta é a melhor maneira de explorar todo o nosso trabalho com uma experiência visual completa.
`
  } catch (error) {
    console.error("Erro ao gerar resposta de portfólio:", error)
    return generatePortfolioResponseSync()
  }
}

// Versão síncrona para uso em componentes React
export function generatePortfolioResponseSync() {
  return `
# Portfólio da Cacilda Filmes

A Cacilda Filmes é especializada em produção audiovisual para educação corporativa, criando conteúdos personalizados de alta qualidade para grandes empresas e marcas reconhecidas.

## Como acessar nosso portfólio completo

Para visualizar todos os nossos trabalhos em uma interface interativa:

1. Clique no ícone "C" da Cacilda no canto superior esquerdo da tela para abrir a barra lateral
2. Na barra lateral, você encontrará a opção "Portfolio"
3. Clique em "Portfolio" para acessar a página completa

Na página de portfólio você encontrará:
- Um slider interativo com nossos principais trabalhos
- Vídeos organizados por categorias
- Opção de visualizar cada vídeo em tela cheia
- Informações detalhadas sobre cada projeto

Esta é a melhor maneira de explorar todo o nosso trabalho com uma experiência visual completa.
`
}
