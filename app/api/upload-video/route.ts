import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  console.log("API /api/upload-video called")
  try {
    const formData = await req.formData()

    // Extrair dados do formulário
    const client = formData.get("client") as string
    const title = formData.get("title") as string
    const production = formData.get("production") as string
    const creation = formData.get("creation") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const vimeoLink = formData.get("vimeoLink") as string
    const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null

    console.log("Received data:", {
      client,
      title,
      production,
      creation,
      category,
      description,
      vimeoLink,
      thumbnailUrl: thumbnailUrl ? "URL present" : "No URL",
    })

    // Extract Vimeo ID from the link
    const vimeoId = vimeoLink.split("/").pop()?.split("?")[0]

    // Determine which table to use based on the environment
    const tableName = process.env.NODE_ENV === "production" ? "videosprod" : "videos"

    // Insert the new video into Supabase
    const { data, error } = await supabase.from(tableName).insert([
      {
        vimeo_id: vimeoId,
        title,
        client,
        production,
        creation,
        // Normalizar a categoria para garantir consistência
        category: category ? category.trim() : "sem-categoria",
        description,
        thumbnail_url: thumbnailUrl,
      },
    ])

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log(`Vídeo adicionado com sucesso à tabela ${tableName}:`, { vimeoId, title, category, thumbnailUrl })

    return NextResponse.json({ success: true, message: "Vídeo adicionado com sucesso" })
  } catch (error) {
    console.error("Detailed error in /api/upload-video:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar o upload",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
