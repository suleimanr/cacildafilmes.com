"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ImageIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import UploadProgress from "./UploadProgress"

// Lista de categorias predefinidas
const PREDEFINED_CATEGORIES = [
  "portfolio",
  "corporativo",
  "educacional",
  "institucional",
  "comercial",
  "making-of",
  "entrevista",
  "documentário",
  "animação",
  "motion",
  "outro",
]

// Modificar a interface UploadFormProps para incluir o vídeo a ser editado
interface UploadFormProps {
  onClose: () => void
  onSubmit: (data: {
    id?: number
    client: string
    title: string
    production: string
    creation: string
    category: string
    description: string
    vimeoLink: string
    thumbnailUrl?: string
  }) => Promise<void>
  videoToEdit?: {
    id: number
    vimeo_id: string
    title: string
    category?: string
    description?: string
    client?: string
    production?: string
    creation?: string
    thumbnail_url?: string
  } | null
}

// Função para extrair o ID do Vimeo do link
const getVimeoId = (vimeoLink: string): string => {
  const parts = vimeoLink.split("/")
  return parts[parts.length - 1].split("?")[0]
}

// Função para obter thumbnails do Vimeo em diferentes resoluções
const getVimeoThumbnails = async (vimeoId: string): Promise<{ [key: string]: string }> => {
  try {
    // Primeiro, tentamos obter a thumbnail via vumbnail.com (serviço gratuito)
    const defaultThumbnail = `https://vumbnail.com/${vimeoId}.jpg`

    // Também podemos oferecer diferentes resoluções
    return {
      default: defaultThumbnail,
      large: `https://vumbnail.com/${vimeoId}_large.jpg`,
      medium: `https://vumbnail.com/${vimeoId}_medium.jpg`,
      small: `https://vumbnail.com/${vimeoId}_small.jpg`,
    }
  } catch (error) {
    console.error("Erro ao obter thumbnails do Vimeo:", error)
    return {
      default: `https://vumbnail.com/${vimeoId}.jpg`,
    }
  }
}

// Modificar o componente para aceitar o videoToEdit
const UploadForm: React.FC<UploadFormProps> = ({ onClose, onSubmit, videoToEdit }) => {
  const [formData, setFormData] = useState({
    id: videoToEdit?.id || undefined,
    client: videoToEdit?.client || "",
    title: videoToEdit?.title || "",
    production: videoToEdit?.production || "",
    creation: videoToEdit?.creation || "",
    category: videoToEdit?.category ? videoToEdit.category.toLowerCase().trim() : "",
    description: videoToEdit?.description || "",
    vimeoLink: videoToEdit ? `https://vimeo.com/${videoToEdit.vimeo_id}` : "",
    thumbnailUrl: videoToEdit?.thumbnail_url || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customCategory, setCustomCategory] = useState<string>("")
  const [usingCustomCategory, setUsingCustomCategory] = useState<boolean>(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [useCustomThumbnail, setUseCustomThumbnail] = useState<boolean>(!!videoToEdit?.thumbnail_url)
  const [vimeoThumbnails, setVimeoThumbnails] = useState<{ [key: string]: string } | null>(null)
  const [selectedThumbnailSize, setSelectedThumbnailSize] = useState<string>("default")
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false)

  // Estado para o progresso do upload
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [progressMessage, setProgressMessage] = useState("Enviando dados...")

  // Atualizar o formulário quando videoToEdit mudar
  useEffect(() => {
    if (videoToEdit) {
      const normalizedCategory = videoToEdit.category ? videoToEdit.category.toLowerCase().trim() : ""
      setFormData({
        id: videoToEdit.id,
        client: videoToEdit.client || "",
        title: videoToEdit.title || "",
        production: videoToEdit.production || "",
        creation: videoToEdit.creation || "",
        category: normalizedCategory,
        description: videoToEdit.description || "",
        vimeoLink: `https://vimeo.com/${videoToEdit.vimeo_id}`,
        thumbnailUrl: videoToEdit.thumbnail_url || "",
      })

      // Se houver uma thumbnail personalizada, definir a preview
      if (videoToEdit.thumbnail_url) {
        setThumbnailPreview(videoToEdit.thumbnail_url)
        setUseCustomThumbnail(true)
      } else {
        setUseCustomThumbnail(false)
        // Carregar thumbnails do Vimeo
        loadVimeoThumbnails(videoToEdit.vimeo_id)
      }

      // Verificar se a categoria é personalizada
      if (normalizedCategory && !PREDEFINED_CATEGORIES.includes(normalizedCategory)) {
        setCustomCategory(normalizedCategory)
        setUsingCustomCategory(true)
      } else {
        setUsingCustomCategory(false)
      }
    }
  }, [videoToEdit])

  // Carregar thumbnails do Vimeo quando o link mudar
  useEffect(() => {
    const vimeoId = getVimeoId(formData.vimeoLink)
    if (vimeoId) {
      loadVimeoThumbnails(vimeoId)
    }
  }, [formData.vimeoLink])

  // Função para carregar thumbnails do Vimeo
  const loadVimeoThumbnails = async (vimeoId: string) => {
    if (!vimeoId) return

    setIsLoadingThumbnails(true)
    try {
      const thumbnails = await getVimeoThumbnails(vimeoId)
      setVimeoThumbnails(thumbnails)

      // Se não estiver usando thumbnail personalizada, definir a preview para a thumbnail do Vimeo
      if (!useCustomThumbnail) {
        setThumbnailPreview(thumbnails[selectedThumbnailSize])
      }
    } catch (error) {
      console.error("Erro ao carregar thumbnails:", error)
      toast.error("Não foi possível carregar as thumbnails do Vimeo")
    } finally {
      setIsLoadingThumbnails(false)
    }
  }

  // Atualizar o título do formulário com base em se é edição ou adição
  const formTitle = videoToEdit ? "Editar Vídeo" : "Adicionar Novo Vídeo"
  const submitButtonText = videoToEdit ? "Atualizar" : "Enviar"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setShowProgress(true)
    setUploadProgress(0)
    setProgressMessage("Preparando dados...")

    try {
      // Usar a categoria personalizada se estiver ativada
      const finalCategory = usingCustomCategory
        ? customCategory.toLowerCase().trim()
        : formData.category.toLowerCase().trim()

      // Determinar qual URL de thumbnail usar
      let thumbnailUrl = formData.thumbnailUrl

      // Se não estiver usando thumbnail personalizada, usar a do Vimeo
      if (!useCustomThumbnail && vimeoThumbnails) {
        thumbnailUrl = vimeoThumbnails[selectedThumbnailSize]
      }

      // Atualizar mensagem de progresso
      setProgressMessage("Enviando dados do vídeo...")
      setUploadProgress(50)

      // Preparar dados para envio
      const dataToSubmit = {
        ...formData,
        category: finalCategory,
        thumbnailUrl: thumbnailUrl,
      }

      // Enviar dados para o servidor
      await onSubmit(dataToSubmit)

      // Completar o progresso
      setUploadProgress(100)
      setProgressMessage("Concluído!")

      // Limpar o formulário após envio bem-sucedido
      setTimeout(() => {
        setShowProgress(false)
        toast.success(videoToEdit ? "Vídeo atualizado com sucesso!" : "Vídeo enviado com sucesso!")

        setFormData({
          id: undefined,
          client: "",
          title: "",
          production: "",
          creation: "",
          category: "",
          description: "",
          vimeoLink: "",
          thumbnailUrl: "",
        })
        setThumbnailPreview(null)
        setUseCustomThumbnail(false)
        setVimeoThumbnails(null)
        onClose()
      }, 500)
    } catch (err) {
      console.error("Erro ao enviar o formulário:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao fazer upload")
      toast.error("Ocorreu um erro. Por favor, tente novamente.")
      setShowProgress(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    if (value === "outro") {
      setUsingCustomCategory(true)
      setFormData((prev) => ({ ...prev, category: "" }))
    } else {
      setUsingCustomCategory(false)
      setFormData((prev) => ({ ...prev, category: value }))
    }
  }

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value)
  }

  const handleThumbnailSizeChange = (size: string) => {
    setSelectedThumbnailSize(size)
    if (vimeoThumbnails && !useCustomThumbnail) {
      setThumbnailPreview(vimeoThumbnails[size])
    }
  }

  const toggleCustomThumbnail = () => {
    setUseCustomThumbnail(!useCustomThumbnail)
    if (useCustomThumbnail) {
      // Se estiver desativando a thumbnail personalizada
      if (vimeoThumbnails) {
        setThumbnailPreview(vimeoThumbnails[selectedThumbnailSize])
      }
      setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))
    }
  }

  // Função para atualizar a URL da thumbnail personalizada
  const handleCustomThumbnailUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData((prev) => ({ ...prev, thumbnailUrl: url }))
    setThumbnailPreview(url)
  }

  // Recarregar thumbnails do Vimeo
  const handleRefreshThumbnails = () => {
    const vimeoId = getVimeoId(formData.vimeoLink)
    if (vimeoId) {
      loadVimeoThumbnails(vimeoId)
      toast.info("Recarregando thumbnails...")
    } else {
      toast.error("Link do Vimeo inválido")
    }
  }

  // Determinar qual thumbnail mostrar na preview
  const thumbnailToShow =
    thumbnailPreview ||
    (vimeoThumbnails ? vimeoThumbnails[selectedThumbnailSize] : null) ||
    (formData.vimeoLink ? `https://vumbnail.com/${getVimeoId(formData.vimeoLink)}.jpg` : null)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl relative my-4 sm:my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
            disabled={isLoading}
          >
            <X size={24} />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white pr-8">{formTitle}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</div>}

            {/* Thumbnail Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="thumbnail" className="text-white text-sm">
                  Thumbnail
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useCustomThumbnail"
                    checked={useCustomThumbnail}
                    onChange={toggleCustomThumbnail}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Label htmlFor="useCustomThumbnail" className="text-white text-sm cursor-pointer">
                    Usar URL personalizada
                  </Label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-full sm:w-1/3 aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  {thumbnailToShow ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={thumbnailToShow || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                        unoptimized={true}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <ImageIcon size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-400 text-xs text-center">
                        {isLoadingThumbnails ? "Carregando..." : "Thumbnail não disponível"}
                      </p>
                    </div>
                  )}

                  {isLoadingThumbnails && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <RefreshCw size={24} className="text-white" />
                      </motion.div>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-2/3 space-y-2">
                  {useCustomThumbnail ? (
                    // Opção para URL personalizada
                    <div className="space-y-2">
                      <Label htmlFor="customThumbnailUrl" className="text-white text-sm">
                        URL da Thumbnail Personalizada
                      </Label>
                      <Input
                        id="customThumbnailUrl"
                        type="url"
                        value={formData.thumbnailUrl || ""}
                        onChange={handleCustomThumbnailUrlChange}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                        disabled={isLoading}
                      />
                      <p className="text-gray-400 text-xs">Cole a URL de uma imagem online para usar como thumbnail.</p>
                    </div>
                  ) : (
                    // Opções para thumbnails do Vimeo
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-white text-sm">Tamanho da Thumbnail</Label>
                        <Button
                          type="button"
                          onClick={handleRefreshThumbnails}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 bg-gray-600 text-white hover:bg-gray-700 border-gray-500"
                          disabled={isLoading || isLoadingThumbnails}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Recarregar
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          onClick={() => handleThumbnailSizeChange("default")}
                          variant={selectedThumbnailSize === "default" ? "default" : "outline"}
                          className={`w-full ${selectedThumbnailSize === "default" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-600 text-white hover:bg-gray-700 border-gray-500"}`}
                          disabled={isLoading}
                        >
                          Padrão
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleThumbnailSizeChange("large")}
                          variant={selectedThumbnailSize === "large" ? "default" : "outline"}
                          className={`w-full ${selectedThumbnailSize === "large" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-600 text-white hover:bg-gray-700 border-gray-500"}`}
                          disabled={isLoading}
                        >
                          Grande
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleThumbnailSizeChange("medium")}
                          variant={selectedThumbnailSize === "medium" ? "default" : "outline"}
                          className={`w-full ${selectedThumbnailSize === "medium" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-600 text-white hover:bg-gray-700 border-gray-500"}`}
                          disabled={isLoading}
                        >
                          Média
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleThumbnailSizeChange("small")}
                          variant={selectedThumbnailSize === "small" ? "default" : "outline"}
                          className={`w-full ${selectedThumbnailSize === "small" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-600 text-white hover:bg-gray-700 border-gray-500"}`}
                          disabled={isLoading}
                        >
                          Pequena
                        </Button>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Selecione o tamanho da thumbnail do Vimeo que deseja usar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-white text-sm">
                  Cliente
                </Label>
                <Input
                  id="client"
                  name="client"
                  type="text"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                  required
                  className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-white text-sm">
                  Título
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Título do vídeo"
                  required
                  className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="production" className="text-white text-sm">
                  Produção
                </Label>
                <Input
                  id="production"
                  name="production"
                  type="text"
                  value={formData.production}
                  onChange={handleChange}
                  placeholder="Equipe de produção"
                  required
                  className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creation" className="text-white text-sm">
                  Criação
                </Label>
                <Input
                  id="creation"
                  name="creation"
                  type="text"
                  value={formData.creation}
                  onChange={handleChange}
                  placeholder="Equipe de criação"
                  required
                  className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white text-sm">
                  Categoria
                </Label>
                <Select
                  value={usingCustomCategory ? "outro" : formData.category}
                  onValueChange={handleCategoryChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {usingCustomCategory && (
                  <div className="mt-2">
                    <Input
                      id="customCategory"
                      type="text"
                      value={customCategory}
                      onChange={handleCustomCategoryChange}
                      placeholder="Digite a categoria personalizada"
                      required
                      className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vimeoLink" className="text-white text-sm">
                  Link do Vimeo
                </Label>
                <Input
                  id="vimeoLink"
                  name="vimeoLink"
                  type="text"
                  value={formData.vimeoLink}
                  onChange={handleChange}
                  placeholder="https://vimeo.com/..."
                  required
                  className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 h-10 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white text-sm">
                Descrição
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descrição do vídeo"
                required
                className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 min-h-[100px] text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-gray-600 text-white hover:bg-gray-700 border-gray-500"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 border-blue-500"
              >
                {isLoading ? "Enviando..." : submitButtonText}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Componente de progresso */}
        {showProgress && <UploadProgress progress={uploadProgress} message={progressMessage} />}
      </motion.div>
    </AnimatePresence>
  )
}

export default UploadForm
