"use client"

import React, { useRef } from "react"
import { useState, useCallback, useEffect } from "react"
import QuickAccessButtons from "@/components/QuickAccessButtons"
import GuidedTour from "@/components/GuidedTour"
import Header from "@/components/Header"
import { v4 as uuidv4 } from "uuid"
import { Textarea } from "@/components/ui/textarea"
import ColoredResponseCard, { type CardType } from "@/components/ColoredResponseCard"
import UploadForm from "@/components/UploadForm"
import DeleteVideoPopup from "@/components/DeleteVideoPopup"
import PromptPopup from "@/components/PromptPopup"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ScrollToBottomButton from "@/components/ScrollToBottomButton"
import { motion } from "framer-motion"
import MessageContent from "@/components/MessageContent"
import Sidebar from "@/components/Sidebar" // Importando o componente Sidebar
import BriefingUpload from "@/components/BriefingUpload"

interface Message {
  role: "user" | "assistant"
  content: string
  id: string
  cardType?: CardType
}

export default function Home() {
  // Verificar se estamos no servidor ou no cliente
  const isServer = typeof window === "undefined"
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Detectar quando estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isChatCentered, setIsChatCentered] = useState(true)
  const [isThinking, setIsThinking] = useState(false)
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([])
  const [apiLimitReached, setApiLimitReached] = useState(false)
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Estado para verificar se há mensagens não lidas
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Estado para controlar o tutorial guiado
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialCompleted, setTutorialCompleted] = useState(false)

  // Adicione o estado de interação do chat dentro do componente Home:
  const [chatInteracted, setChatInteracted] = useState(false)

  // Estados para controlar os formulários administrativos
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showDeleteVideoForm, setShowDeleteVideoForm] = useState(false)
  const [showPromptForm, setShowPromptForm] = useState(false)
  const [videoToEdit, setVideoToEdit] = useState<any>(null)

  // Adicionar um novo estado para controlar a posição inicial
  const [isInitialPosition, setIsInitialPosition] = useState(true)

  // Adicione este estado
  const [showBriefingUpload, setShowBriefingUpload] = useState(false)

  // Função para rolar para o final das mensagens
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      setHasUnreadMessages(false)
      setUnreadCount(0)
    }
  }, [])

  // Verificar se há mensagens não lidas
  const checkForUnreadMessages = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100

      if (!isScrolledToBottom) {
        setHasUnreadMessages(true)
        setUnreadCount((prev) => prev + 1)
      }
    }
  }, [])

  // Rolar para o final quando as mensagens mudarem
  useEffect(() => {
    if (messages.length > 0) {
      // Usar setTimeout para garantir que o DOM foi atualizado
      setTimeout(() => {
        if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
          const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100

          if (isScrolledToBottom) {
            scrollToBottom()
          } else {
            checkForUnreadMessages()
          }
        }
      }, 100)
    }
  }, [messages, scrollToBottom, checkForUnreadMessages])

  // Adicione um useEffect para ouvir o evento de interação:
  useEffect(() => {
    const handleChatInteraction = () => {
      console.log("Home: Chat interaction detected")
      setChatInteracted(true)
    }

    window.addEventListener("chatInteraction", handleChatInteraction)

    return () => {
      window.removeEventListener("chatInteraction", handleChatInteraction)
    }
  }, [])

  // Adicionar listeners para os eventos dos formulários administrativos
  useEffect(() => {
    const handleOpenUploadForm = () => {
      setShowUploadForm(true)
      setVideoToEdit(null)
    }

    const handleOpenDeleteVideoForm = () => {
      setShowDeleteVideoForm(true)
    }

    const handleOpenPromptForm = () => {
      setShowPromptForm(true)
    }

    window.addEventListener("openUploadForm", handleOpenUploadForm)
    window.addEventListener("openDeleteVideoForm", handleOpenDeleteVideoForm)
    window.addEventListener("openPromptForm", handleOpenPromptForm)

    return () => {
      window.removeEventListener("openUploadForm", handleOpenUploadForm)
      window.removeEventListener("openDeleteVideoForm", handleOpenDeleteVideoForm)
      window.removeEventListener("openPromptForm", handleOpenPromptForm)
    }
  }, [])

  // Respostas rápidas pré-definidas para perguntas comuns
  const quickResponses: Record<string, string> = React.useMemo(
    () => ({
      olá: "Olá! Como posso ajudar você hoje? Estou aqui para fornecer informações sobre a Cacilda Filmes.",
      oi: "Olá! Como posso ajudar você hoje? Estou aqui para fornecer informações sobre a Cacilda Filmes.",
      hello: "Olá! Como posso ajudar você hoje? Estou aqui para fornecer informações sobre a Cacilda Filmes.",
      contato: `Na Cacilda Filmes, criamos experiências de aprendizagem que aproximam empresas dos seus colaboradores e parceiros — as pessoas que tornam o sucesso possível. Combinamos educação corporativa, storytelling e tecnologia para transformar conteúdo em treinamentos envolventes, inspiradores e com impacto real no dia a dia. Entre em contato conosco.`,
      "quem é você":
        "Sou o assistente virtual da Cacilda Filmes, estou aqui para ajudar com informações sobre nossos serviços, portfólio e como podemos ajudar sua empresa com soluções audiovisuais para educação corporativa.",
      "o que vocês fazem":
        "# Sobre a Cacilda Filmes\n\nA Cacilda Filmes é uma produtora especializada em educação corporativa para grandes empresas, oferecendo uma variedade de serviços com foco em transformar conhecimento em experiências memoráveis. Com expertise em design, inovação e experiência de aprendizagem, a empresa atua de ponta a ponta na criação de soluções audiovisuais.",
      serviços: `A Cacilda Filmes desenvolve soluções audiovisuais sob medida para a educação corporativa, entregando experiências que informam, engajam e fortalecem a cultura das empresas. O que fazemos Produzimos conteúdos como videoaulas, vídeos institucionais, documentários corporativos, animações, motion graphics, materiais complementares e ferramentas de avaliação. Tudo é planejado para tornar o aprendizado mais acessível, envolvente e eficaz. Unimos narrativa, estratégia e design para transformar conhecimento em experiências memoráveis. Áreas de Atuação Cultura organizacional Onboarding e integração de novos colaboradores Desenvolvimento de lideranças Fomento ao espírito empreendedor Cada projeto da Cacilda Filmes é pensado para atender às necessidades específicas do cliente, com alto nível de personalização, excelência técnica e foco em resultado.`,
      portfolio: "",
      sobre: `Na Cacilda Filmes, a gente faz muito mais do que vídeos. Somos uma produtora de conteúdo especializada em educação corporativa que entrega impacto real para grandes empresas. Unimos estratégia, storytelling e tecnologia para transformar conhecimento em experiências que engajam, ensinam e permanecem. Do roteiro à entrega final, criamos soluções sob medida que encantam colaboradores, aceleram treinamentos e fortalecem a cultura organizacional. Leve o aprendizado a outro nível, fale com a gente. A Cacilda entrega conteúdo que conecta, transforma e dá resultado.`,
    }),
    [],
  )

  // Palavras-chave para identificar perguntas que devem ser respondidas pelo Assistant
  const complexQueryKeywords = [
    "roteiro",
    "briefing",
    "ideia",
    "criar",
    "desenvolver",
    "estratégia",
    "conceito",
    "planejar",
    "sugestão",
    "como fazer",
    "ajuda com",
    "preciso de",
    "elaborar",
  ]

  // Adicionar uma verificação de idioma para as respostas do fallback
  // Adicionar esta função antes do useEffect que inicializa as mensagens

  // Garantir que todas as respostas estejam em português
  useEffect(() => {
    // Verificar se todas as respostas rápidas estão em português
    for (const key in quickResponses) {
      if (!quickResponses[key].match(/[áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/)) {
        console.warn(`A resposta para "${key}" pode não estar em português.`)
      }
    }
  }, [quickResponses])

  // Modificar a função shouldUseAssistant para garantir que roteiros sempre usem o Assistant
  const shouldUseAssistant = useCallback(
    (message: string) => {
      const lowercaseMessage = message.toLowerCase()

      // Sempre usar o Assistant para roteiros
      if (
        lowercaseMessage.includes("roteiro") ||
        lowercaseMessage.includes("script") ||
        lowercaseMessage.includes("aula")
      ) {
        return true
      }

      // Verificar se a mensagem contém palavras-chave de consultas complexas
      return (
        complexQueryKeywords.some((keyword) => lowercaseMessage.includes(keyword)) ||
        // Ou se é uma mensagem longa (provavelmente mais complexa)
        message.length > 100 ||
        // Ou se contém um ponto de interrogação (provavelmente uma pergunta específica)
        message.includes("?")
      )
    },
    [complexQueryKeywords],
  )

  // Adicionar função para verificar se está no final da conversa
  const checkIfAtBottom = useCallback(() => {
    if (!chatContainerRef.current) return

    const container = chatContainerRef.current
    const isBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 50
    setIsAtBottom(isBottom)

    // Se estiver no final, resetar contador de não lidas
    if (isBottom) {
      setUnreadCount(0)
    }
  }, [])

  // Adicione esta função para lidar com o roteiro gerado
  const handleRoteiroGenerated = (roteiro: string) => {
    // Adicionar o roteiro como uma mensagem do assistente
    const newAssistantMessage = {
      role: "assistant" as const,
      content: `:::roteiro\n${roteiro}\n:::`,
      id: uuidv4(),
    }

    setMessages((prev) => [...prev, newAssistantMessage])
    setShowBriefingUpload(false)

    // Rolar para o final após adicionar a resposta
    setTimeout(scrollToBottom, 100)
  }

  const handleMessageSent = useCallback(
    async (message: string) => {
      const event = new Event("chatInteraction")
      window.dispatchEvent(event)

      const newUserMessage = { role: "user", content: message, id: uuidv4() }
      setMessages((prev) => [...prev, newUserMessage])
      setError(null)
      setIsThinking(true)

      try {
        const lowercaseMessage = message.toLowerCase().trim()

        // Comandos administrativos
        if (lowercaseMessage.startsWith("/uploadcacilda")) {
          setShowUploadForm(true)
          setVideoToEdit(null)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Formulário de upload de vídeo aberto.",
              id: uuidv4(),
            },
          ])
          setIsThinking(false)
          return
        }

        if (lowercaseMessage.startsWith("/deletecacilda")) {
          setShowDeleteVideoForm(true)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Gerenciador de vídeos aberto.",
              id: uuidv4(),
            },
          ])
          setIsThinking(false)
          return
        }

        if (lowercaseMessage.startsWith("/promptcacilda")) {
          setShowPromptForm(true)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Formulário para adicionar à base de conhecimento aberto.",
              id: uuidv4(),
            },
          ])
          setIsThinking(false)
          return
        }

        if (lowercaseMessage.startsWith("/briefingcacilda")) {
          setShowBriefingUpload(true)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Formulário de upload de briefing aberto.",
              id: uuidv4(),
            },
          ])
          setIsThinking(false)
          return
        }

        // Comando para testar a conexão com a API
        if (lowercaseMessage.startsWith("/testapi")) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Testando conexão com a API OpenAI...",
              id: uuidv4(),
            },
          ])

          try {
            const response = await fetch("/api/test-openai")
            const data = await response.json()

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Resultado do teste: ${data.success ? "Sucesso" : "Falha"}\n${data.message || ""}\n${data.error || ""}`,
                id: uuidv4(),
              },
            ])
          } catch (error) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Erro ao testar API: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                id: uuidv4(),
              },
            ])
          }

          setIsThinking(false)
          return
        }

        // Comando para testar o assistente
        if (lowercaseMessage.startsWith("/testassistant")) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Testando configuração do assistente OpenAI...",
              id: uuidv4(),
            },
          ])

          try {
            const response = await fetch("/api/check-assistant")
            const data = await response.json()

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Resultado do teste: ${data.success ? "Sucesso" : "Falha"}\n${data.message || ""}\n${data.error || ""}\n${data.assistant ? `ID: ${data.assistant.id}\nModelo: ${data.assistant.model}` : ""}`,
                id: uuidv4(),
              },
            ])
          } catch (error) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Erro ao testar assistente: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                id: uuidv4(),
              },
            ])
          }

          setIsThinking(false)
          return
        }

        if (quickResponses[lowercaseMessage]) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: quickResponses[lowercaseMessage],
              id: uuidv4(),
            },
          ])
          setIsThinking(false)
          return
        }

        // Verifica se é simples (usamos fallback só nesses casos)
        const isSimple = !shouldUseAssistant(message)
        // Garantir que o apiPayload seja construído corretamente
        const apiPayload = {
          messages: [...messages, newUserMessage],
          timestamp: Date.now(),
          useSimpleModel: !shouldUseAssistant(message), // Usar o Assistant quando shouldUseAssistant retornar true
        }

        const assistantMessageId = uuidv4()
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Processando sua solicitação...",
            id: assistantMessageId,
          },
        ])

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let assistantMessage = ""

        if (!reader) throw new Error("Leitor ausente na resposta")

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantMessage += chunk

          setMessages((prev) => {
            const index = prev.findIndex((m) => m.id === assistantMessageId)
            if (index === -1) return prev
            const newMessages = [...prev]
            newMessages[index] = {
              ...newMessages[index],
              content: assistantMessage,
            }
            return newMessages
          })

          scrollToBottom()
        }
      } catch (err) {
        console.error("Erro:", err)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Houve uma falha técnica ao gerar a resposta. Tente novamente ou entre em contato com nosso atendimento.",
            id: uuidv4(),
          },
        ])
      } finally {
        setIsThinking(false)
        setTimeout(scrollToBottom, 100)
      }
    },
    [messages, quickResponses, shouldUseAssistant, scrollToBottom],
  )

  // Modificar a função handleQuickAccessClick para também atualizar a posição
  const handleQuickAccessClick = useCallback(
    (topic: string) => {
      // Disparar evento de interação com o chat
      const event = new Event("chatInteraction")
      window.dispatchEvent(event)

      // Atualizar a posição quando um botão de acesso rápido for clicado
      setIsInitialPosition(false)

      // Adicionar a mensagem do usuário
      const newUserMessage = { role: "user", content: topic, id: uuidv4() }
      setMessages((prev) => [...prev, newUserMessage])

      // Mapear os tópicos dos botões para as chaves das respostas rápidas
      const topicMap: Record<string, string> = {
        portfolio: "portfolio",
        servicos: "serviços",
        sobre: "sobre",
        contato: "contato",
      }

      const mappedTopic = topicMap[topic] || topic

      // Configurar os detalhes do card com base no tópico
      let cardType: CardType | undefined
      let content = ""

      switch (mappedTopic) {
        case "portfolio":
          cardType = "portfolio"
          content = "" // String vazia para o portfólio
          break
        case "serviços":
          cardType = "servicos"
          content = quickResponses["serviços"]
          break
        case "sobre":
          cardType = "sobre"
          content = quickResponses["sobre"]
          break
        case "contato":
          cardType = "contato"
          content = quickResponses["contato"]
          break
        default:
          // Para outros tópicos, usar o handleMessageSent normal
          handleMessageSent(topic)
          return
      }

      // Adicionar um pequeno delay para simular o processamento
      setTimeout(() => {
        // Adicionar a resposta do assistente
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: content,
            id: uuidv4(),
            cardType: cardType,
          },
        ])
        // Rolar para o final após adicionar a resposta
        setTimeout(scrollToBottom, 100)
      }, 500)
    },
    [handleMessageSent, quickResponses, scrollToBottom],
  )

  // Modificar a função handleError para mostrar uma mensagem mais amigável ao usuário
  const handleError = useCallback((error: string) => {
    console.error("Error:", error)

    // Mensagem mais amigável para o usuário
    const userFriendlyMessage =
      error.includes("URL") || error.includes("API")
        ? "O serviço está temporariamente indisponível. Por favor, tente novamente mais tarde."
        : error

    setError(userFriendlyMessage)

    toast.error("Ocorreu um erro. Por favor, tente novamente mais tarde.", {
      position: "top-right",
      autoClose: 5000,
    })
  }, [])

  // Modificar a função handleFirstInteraction para também atualizar a posição
  const handleFirstInteraction = useCallback(() => {
    // Disparar evento de interação com o chat
    const event = new Event("chatInteraction")
    window.dispatchEvent(event)

    setIsChatCentered(false)
    setIsInitialPosition(false) // Adicionar esta linha para controlar a posição
  }, [])

  // Modificar a função handleInputChange para também atualizar a posição
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Disparar evento de interação com o chat se o usuário começar a digitar
    if (value.length === 1) {
      const event = new Event("chatInteraction")
      window.dispatchEvent(event)
      handleFirstInteraction()
    }

    if (value.endsWith("#")) {
      setHashtagSuggestions(["#videoaulas", "#institucional", "#varejo", "#motion", "#makingof"])
    } else if (!value.includes("#")) {
      setHashtagSuggestions([])
    }
  }

  // Função para enviar mensagem
  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      if (!input.trim() || isThinking) return

      // Atualizar a posição quando uma mensagem for enviada
      setIsInitialPosition(false)

      const message = input.trim()
      setInput("")

      // Processar a mensagem
      await handleMessageSent(message)
    },
    [input, isThinking, handleMessageSent],
  )

  // Função para lidar com teclas pressionadas
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  // Verificar se é a primeira visita do usuário
  useEffect(() => {
    // Só executar no cliente
    if (isClient) {
      try {
        const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")
        if (!hasVisitedBefore && !tutorialCompleted) {
          // Mostrar o tutorial após um pequeno delay para garantir que a página carregou completamente
          const timer = setTimeout(() => {
            setShowTutorial(true)
          }, 1500)
          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error("Erro ao acessar localStorage:", error)
      }
    }
  }, [tutorialCompleted, isClient])

  // Marcar como visitado quando o tutorial for concluído
  const handleTutorialComplete = () => {
    setTutorialCompleted(true)
    setShowTutorial(false)

    // Só acessar localStorage no cliente
    if (isClient) {
      try {
        localStorage.setItem("hasVisitedBefore", "true")
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error)
      }
    }
  }

  // Funções para lidar com os formulários administrativos
  const handleUploadFormSubmit = async (data: any) => {
    try {
      if (data.id) {
        // Atualizar vídeo existente
        const response = await fetch("/api/update-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: data.id,
            title: data.title,
            vimeoId: getVimeoId(data.vimeoLink),
            category: data.category,
            description: data.description,
            client: data.client,
            production: data.production,
            creation: data.creation,
            thumbnailUrl: data.thumbnailUrl,
          }),
        })

        if (!response.ok) {
          throw new Error("Falha ao atualizar o vídeo")
        }

        toast.success("Vídeo atualizado com sucesso!")
      } else {
        // Adicionar novo vídeo
        const response = await fetch("/api/upload-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            vimeoId: getVimeoId(data.vimeoLink),
            category: data.category,
            description: data.description,
            client: data.client,
            production: data.production,
            creation: data.creation,
            thumbnailUrl: data.thumbnailUrl,
          }),
        })

        if (!response.ok) {
          throw new Error("Falha ao fazer upload do vídeo")
        }

        toast.success("Vídeo enviado com sucesso!")
      }

      setShowUploadForm(false)
    } catch (error) {
      console.error("Erro ao enviar o vídeo:", error)
      toast.error("Erro ao enviar o vídeo. Por favor, tente novamente.")
    }
  }

  const handleDeleteVideo = async (id: number) => {
    try {
      const response = await fetch("/api/delete-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Falha ao deletar o vídeo")
      }

      toast.success("Vídeo deletado com sucesso!")
    } catch (error) {
      console.error("Erro ao deletar o vídeo:", error)
      toast.error("Erro ao deletar o vídeo. Por favor, tente novamente.")
    }
  }

  const handleEditVideo = (video: any) => {
    setVideoToEdit(video)
    setShowUploadForm(true)
    setShowDeleteVideoForm(false)
  }

  const handlePromptSubmit = async (type: string, content: string) => {
    try {
      const response = await fetch("/api/add-knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, content }),
      })

      if (!response.ok) {
        throw new Error("Falha ao adicionar à base de conhecimento")
      }

      toast.success("Informação adicionada à base de conhecimento com sucesso!")
      setShowPromptForm(false)
    } catch (error) {
      console.error("Erro ao adicionar à base de conhecimento:", error)
      toast.error("Erro ao adicionar à base de conhecimento. Por favor, tente novamente.")
      throw error
    }
  }

  // Função auxiliar para extrair o ID do Vimeo de um link
  const getVimeoId = (vimeoLink: string): string => {
    const parts = vimeoLink.split("/")
    return parts[parts.length - 1].split("?")[0]
  }

  // Modificar a função handleNewMessage para incrementar contador quando não estiver no final
  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message])

      // Se não estiver no final da conversa, incrementar contador de não lidas
      if (!isAtBottom && message.role === "assistant") {
        setUnreadCount((prev) => prev + 1)
      }

      // Resto da função permanece igual
      if (message.role === "assistant") {
        setIsThinking(false)
      }
    },
    [isAtBottom],
  )

  // Adicionar evento de scroll para verificar posição
  useEffect(() => {
    const container = chatContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkIfAtBottom)
      return () => container.removeEventListener("scroll", checkIfAtBottom)
    }
  }, [checkIfAtBottom])

  return (
    // Modificar a div principal para melhorar a responsividade
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Renderizar o Header com a prop chatInteracted */}
      <Header chatInteracted={chatInteracted} />
      {/* Adicionar o componente Sidebar */}
      <Sidebar />
      {apiLimitReached && (
        <div className="fixed top-20 left-0 right-0 bg-yellow-600 text-white text-center py-2 px-4 z-50">
          Estamos operando com capacidade limitada. Algumas funcionalidades podem estar indisponíveis.
        </div>
      )}
      <div className="h-screen relative overflow-hidden flex flex-col pt-4">
        <div className="flex-grow relative pb-20">
          {messages.length > 0 && (
            <div
              ref={chatContainerRef}
              className="h-full overflow-y-scroll p-2 sm:p-4 md:p-6 lg:p-8 pb-40 sm:pb-40 scrollbar-visible smooth-scroll"
              id="chat-messages"
              style={{ maxHeight: "calc(100vh - 180px)" }} /* Ajustado para melhor visualização em mobile */
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      id={message.id}
                      className={`mb-4 sm:mb-6 md:mb-8 message-item ${message.role === "user" ? "pl-1 sm:pl-4 md:pl-8" : ""}`} /* Reduzido o padding para mobile */
                    >
                      {message.role === "user" && (
                        <div className="uppercase text-white mb-1 sm:mb-2 tracking-wider text-xs sm:text-sm">VOCÊ:</div>
                      )}
                      {message.role === "assistant" && (
                        <div className="uppercase text-white mb-1 sm:mb-2 tracking-wider text-xs sm:text-sm">
                          CACILDA:
                        </div>
                      )}
                      {message.cardType ? (
                        <ColoredResponseCard
                          type={message.cardType}
                          title={
                            message.cardType === "portfolio"
                              ? "Portfólio Cacilda Filmes"
                              : message.cardType === "servicos"
                                ? "Serviços Cacilda Filmes"
                                : message.cardType === "sobre"
                                  ? "Sobre a Cacilda Filmes"
                                  : "Contato Cacilda Filmes"
                          }
                          subtitle={
                            message.cardType === "portfolio"
                              ? "Conheça nossos trabalhos"
                              : message.cardType === "servicos"
                                ? "O que oferecemos"
                                : message.cardType === "sobre"
                                  ? "Quem somos"
                                  : "Fale conosco"
                          }
                          content={message.content}
                        />
                      ) : (
                        <div className="leading-relaxed text-xs sm:text-sm md:text-base text-white font-sans">
                          {" "}
                          {/* Reduzido o tamanho do texto para mobile */}
                          <MessageContent content={message.content} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {
                  // Modificando apenas a parte relevante onde o ThinkingAnimation é renderizado
                  isThinking && (
                    <div className="mb-4 sm:mb-6 md:mb-8 message-item">
                      <div className="uppercase text-white mb-1 sm:mb-2 tracking-wider text-xs sm:text-sm">
                        CACILDA:
                      </div>
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )
                }
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Botão para rolar para o final quando há mensagens não lidas */}
          {!isAtBottom && (
            <ScrollToBottomButton
              onClick={() => {
                scrollToBottom()
                setUnreadCount(0)
              }}
              unreadCount={unreadCount}
            />
          )}
        </div>

        {/* Campo de entrada animado que muda de posição */}
        <motion.div
          className="fixed left-0 right-0 p-2 sm:p-4 border-t border-gray-800 bg-black"
          initial={{ bottom: 0 }}
          animate={{
            bottom: isInitialPosition ? "calc(50vh - 180px)" : 0,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
        >
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex items-end">
              <div className="relative flex-grow">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="w-full bg-black text-white border border-gray-800 rounded-lg pr-14 min-h-[50px] max-h-[100px] resize-none text-sm sm:text-base" /* Ajustado para mobile */
                  rows={1}
                />
                {hashtagSuggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-md p-2 z-10">
                    <div className="flex flex-wrap gap-2">
                      {hashtagSuggestions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setInput((prev) => prev.replace(/#$/, tag + " "))
                            if (textareaRef.current) {
                              textareaRef.current.focus()
                            }
                          }}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs sm:text-sm text-white"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={!input.trim() || isThinking}
                    className={`p-2 rounded-full ${
                      !input.trim() || isThinking
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    } transition-colors duration-300 flex items-center justify-center`}
                    aria-label="Enviar mensagem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      {" "}
                      {/* Reduzido o tamanho do ícone para mobile */}
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-2 sm:mt-4 flex justify-center">
              {" "}
              {/* Reduzido o margin para mobile */}
              <QuickAccessButtons onButtonClick={handleQuickAccessClick} />
            </div>
          </div>
        </motion.div>
      </div>
      // Adicione este código no JSX, onde você tem os botões administrativos
      {showBriefingUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Upload de Briefing</h2>
              <button onClick={() => setShowBriefingUpload(false)} className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <BriefingUpload onRoteiroGenerated={handleRoteiroGenerated} />
          </div>
        </div>
      )}
      {/* Tutorial Guiado */}
      <GuidedTour isOpen={showTutorial} onClose={() => setShowTutorial(false)} onComplete={handleTutorialComplete} />
      {/* Botão para abrir o tutorial novamente */}
      {tutorialCompleted && (
        <button
          onClick={() => setShowTutorial(true)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors z-40"
          aria-label="Abrir tutorial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}
      {/* Formulários administrativos */}
      {showUploadForm && (
        <UploadForm
          onClose={() => setShowUploadForm(false)}
          onSubmit={handleUploadFormSubmit}
          videoToEdit={videoToEdit}
        />
      )}
      {showDeleteVideoForm && (
        <DeleteVideoPopup
          onClose={() => setShowDeleteVideoForm(false)}
          onDelete={handleDeleteVideo}
          onEdit={handleEditVideo}
        />
      )}
      {showPromptForm && <PromptPopup onClose={() => setShowPromptForm(false)} onSubmit={handlePromptSubmit} />}
      {/* Toast container para notificações */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  )
}
