import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getVideoTableName } from "@/lib/supabase"

export async function PUT(req: Request) {
  console.log("API /api/update-video called")
  try {
    // Verificar se a requisição é multipart/form-data
    const contentType = req.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)

    let data: any = {}

    try {
      if (contentType.includes("multipart/form-data")) {
        // Processar como FormData
        const formData = await req.formData()
        console.log("FormData recebido, campos:", Array.from(formData.keys()))

        // Extrair dados do formulário
        data = {
          id: formData.get("id"),
          client: formData.get("client"),
          title: formData.get("title"),
          production: formData.get("production"),
          creation: formData.get("creation"),
          category: formData.get("category"),
          description: formData.get("description"),
          vimeoLink: formData.get("vimeoLink"),
          thumbnailUrl: formData.get("thumbnailUrl"),
        }
      } else {
        // Processar como JSON
        data = await req.json()
      }
    } catch (parseError) {
      console.error("Erro ao analisar os dados da requisição:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao processar os dados da requisição",
          error: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    console.log("Dados recebidos para atualização:", {
      id: data.id,
      client: data.client,
      title: data.title,
      category: data.category,
      vimeoLink: data.vimeoLink ? "Presente" : "Ausente",
      thumbnailUrl: data.thumbnailUrl ? "Presente" : "Ausente",
    })

    if (!data.id) {
      console.error("ID do vídeo não fornecido")
      return NextResponse.json({ success: false, message: "ID do vídeo é obrigatório" }, { status: 400 })
    }

    // Determine which table to use based on the environment
    const tableName = getVideoTableName()
    console.log("Tabela a ser usada:", tableName)

    // Verificar se o vídeo existe
    const { data: existingVideo, error: checkError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", data.id)
      .single()

    if (checkError) {
      console.error("Erro ao verificar vídeo existente:", checkError)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao verificar vídeo existente",
          error: checkError.message,
        },
        { status: 500 },
      )
    }

    if (!existingVideo) {
      console.error("Vídeo não encontrado com ID:", data.id)
      return NextResponse.json({ success: false, message: "Vídeo não encontrado" }, { status: 404 })
    }

    // Extract Vimeo ID from the link if provided
    const updateData: any = {
      title: data.title,
      client: data.client,
      production: data.production,
      creation: data.creation,
      // Normalizar a categoria para garantir consistência
      category: data.category ? data.category.trim() : "sem-categoria",
      description: data.description,
    }

    // Only update vimeo_id if a new link was provided
    if (data.vimeoLink) {
      const vimeoId = data.vimeoLink.split("/").pop()?.split("?")[0]
      updateData.vimeo_id = vimeoId
    }

    // Update thumbnail_url if provided
    if (data.thumbnailUrl !== undefined) {
      updateData.thumbnail_url = data.thumbnailUrl || null
      console.log("Nova thumbnail URL:", data.thumbnailUrl || "Removida")
    }

    // Update the video in Supabase
    console.log("Atualizando vídeo com dados:", updateData)
    const { data: updatedData, error } = await supabase.from(tableName).update(updateData).eq("id", data.id).select()

    if (error) {
      console.error("Erro do Supabase:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao atualizar o vídeo",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Vídeo atualizado com sucesso na tabela ${tableName}:`, updatedData)

    return NextResponse.json({ success: true, message: "Vídeo atualizado com sucesso", data: updatedData })
  } catch (error) {
    console.error("Erro detalhado em /api/update-video:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar a atualização",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
