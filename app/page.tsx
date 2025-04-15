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
import Sidebar from "@/components/Sidebar"

interface Message {
  role: "user" | "assistant"
  content: string
  id: string
  cardType?: CardType
}

interface ClienteInfo {
  nome_completo?: string
  empresa?: string
  tema_desejado?: string
  email?: string
  telefone?: string
}

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setIsClient(true) }, [])

  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isChatCentered, setIsChatCentered] = useState(true)
  const [isThinking, setIsThinking] = useState(false)
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([])
  const [apiLimitReached, setApiLimitReached] = useState(false)
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [clienteInfo, setClienteInfo] = useState<ClienteInfo | null>(null)
  const [coletandoDados, setColetandoDados] = useState(false)
  const [etapaCadastro, setEtapaCadastro] = useState<null | keyof ClienteInfo>(null)

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [isInitialPosition, setIsInitialPosition] = useState(true)
  const [isInitialPositionn, setIsInitialPositionn] = useState(true)

  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialCompleted, setTutorialCompleted] = useState(false)
  const [chatInteracted, setChatInteracted] = useState(false)

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showDeleteVideoForm, setShowDeleteVideoForm] = useState(false)
  const [showPromptForm, setShowPromptForm] = useState(false)
  const [videoToEdit, setVideoToEdit] = useState<any>(null)

  const camposCadastro = {
    nome_completo: "Qual é o seu nome completo?",
    empresa: "Qual é o nome da sua empresa?",
    tema_desejado: "Sobre qual tema você deseja criar uma videoaula?",
    email: "Qual é o seu e-mail?",
    telefone: "E por fim, qual é o seu telefone?",
  }

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      setHasUnreadMessages(false)
      setUnreadCount(0)
    }
  }, [])

  const checkIfAtBottom = useCallback(() => {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsAtBottom(isBottom)
    if (isBottom) setUnreadCount(0)
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
          const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100
          if (isScrolledToBottom) scrollToBottom()
          else checkIfAtBottom()
        }
      }, 100)
    }
  }, [messages, scrollToBottom, checkIfAtBottom])

  useEffect(() => {
    const handleChatInteraction = () => {
      console.log("Home: Chat interaction detected")
      setChatInteracted(true)
    }
    window.addEventListener("chatInteraction", handleChatInteraction)
    return () => window.removeEventListener("chatInteraction", handleChatInteraction)
  }, [])

  useEffect(() => {
    const handleOpenUploadForm = () => { setShowUploadForm(true); setVideoToEdit(null) }
    const handleOpenDeleteVideoForm = () => { setShowDeleteVideoForm(true) }
    const handleOpenPromptForm = () => { setShowPromptForm(true) }
    window.addEventListener("openUploadForm", handleOpenUploadForm)
    window.addEventListener("openDeleteVideoForm", handleOpenDeleteVideoForm)
    window.addEventListener("openPromptForm", handleOpenPromptForm)
    return () => {
      window.removeEventListener("openUploadForm", handleOpenUploadForm)
      window.removeEventListener("openDeleteVideoForm", handleOpenDeleteVideoForm)
      window.removeEventListener("openPromptForm", handleOpenPromptForm)
    }
  }, [])

  const quickResponses: Record<string, string> = React.useMemo(() => ({
    olá: "Olá! Como posso ajudar você hoje? Estou aqui para fornecer informações sobre a Cacilda Filmes.",
    oi: "Olá! Como posso ajudar você hoje? Estou aqui para fornecer informações sobre a Cacilda Filmes.",
    hello: "Olá! Como posso ajudar você hoje? Estou aqui para fornecer informações sobre a Cacilda Filmes.",
    contato: `Na Cacilda Filmes, criamos experiências de aprendizagem que aproximam empresas dos seus colaboradores e parceiros — as pessoas que tornam o sucesso possível. Entre em contato conosco.`,
    "quem é você": "Sou o assistente virtual da Cacilda Filmes, aqui para ajudar com informações sobre nossos serviços e portfólio.",
    "o que vocês fazem": "# Sobre a Cacilda Filmes\n\nSomos uma produtora especializada em educação corporativa, criando soluções audiovisuais completas.",
    serviços: `Produzimos videoaulas, vídeos institucionais, documentários, animações, e muito mais, pensando sempre na personalização e na excelência.`,
    portfolio: "",
    sobre: `Somos muito mais do que vídeos – entregamos experiências que transformam o aprendizado nas empresas.`,
  }), [])

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

  useEffect(() => {
    for (const key in quickResponses) {
      if (!quickResponses[key].match(/[áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/)) {
        console.warn(`A resposta para "${key}" pode não estar em português.`)
      }
    }
  }, [quickResponses])

  const shouldUseAssistant = useCallback(
    (message: string) => {
      const lowercaseMessage = message.toLowerCase()
      return (
        complexQueryKeywords.some((keyword) => lowercaseMessage.includes(keyword)) ||
        message.length > 100 ||
        message.includes("?")
      )
    },
    [complexQueryKeywords],
  )

  const validarEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validarTelefone = (telefone: string): boolean => /^(\$?\d{2}\$?\s?)?(\d{4,5})[-.\s]?(\d{4})$/.test(telefone)
  const formatarTelefone = (telefone: string): string => {
    const numeros = telefone.replace(/\D/g, "")
    if (numeros.length === 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
    else if (numeros.length === 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
    else if (numeros.length === 9) return `${numeros.slice(0, 5)}-${numeros.slice(5)}`
    else if (numeros.length === 8) return `${numeros.slice(0, 4)}-${numeros.slice(4)}`
    return telefone
  }

  const salvarClienteNoSupabase = async (data: ClienteInfo) => {
    try {
      const response = await fetch("/api/salvar-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro ao salvar cliente:", errorData)
        return false
      }
      const result = await response.json()
      return result.success === true
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      return false
    }
  }

  const iniciarCadastroCliente = useCallback(() => {
    const dadosSalvos = localStorage.getItem("cacilda_cliente_info")
    if (!dadosSalvos) {
      setColetandoDados(true)
      setClienteInfo({})
      setEtapaCadastro("nome_completo")
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: camposCadastro["nome_completo"], id: uuidv4() },
      ])
      scrollToBottom()
    } else {
      const info = JSON.parse(dadosSalvos)
      setClienteInfo(info)
    }
  }, [scrollToBottom])

  useEffect(() => {
    if (isClient) {
      try {
        const dadosSalvos = localStorage.getItem("cacilda_cliente_info")
        if (dadosSalvos) {
          setClienteInfo(JSON.parse(dadosSalvos))
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error)
      }
    }
  }, [isClient])

  const handleMessageSent = useCallback(
    async (message: string) => {
      const event = new Event("chatInteraction")
      window.dispatchEvent(event)

      // Se estiver em fluxo de cadastro, trate a resposta e retorne
      if (coletandoDados && etapaCadastro) {
        const novaInfo = { ...clienteInfo, [etapaCadastro]: message }
        const chaves = Object.keys(camposCadastro)
        const proximaChave = chaves[chaves.indexOf(etapaCadastro as string) + 1]
        setClienteInfo(novaInfo)
        if (proximaChave) {
          setEtapaCadastro(proximaChave as keyof ClienteInfo)
          setMessages((prev) => [
            ...prev,
            { role: "user", content: message, id: uuidv4() },
            { role: "assistant", content: camposCadastro[proximaChave as keyof typeof camposCadastro], id: uuidv4() },
          ])
          setTimeout(scrollToBottom, 100)
          return  // Importante: encerra o processamento para cadastro
        } else {
          // Etapa final: validações
          if (etapaCadastro === "email" && !validarEmail(message)) {
            setMessages((prev) => [
              ...prev,
              { role: "user", content: message, id: uuidv4() },
              { role: "assistant", content: "O email informado parece inválido. Por favor, informe um email válido:", id: uuidv4() },
            ])
            setTimeout(scrollToBottom, 100)
            return
          }
          if (etapaCadastro === "telefone") {
            if (!validarTelefone(message)) {
              setMessages((prev) => [
                ...prev,
                { role: "user", content: message, id: uuidv4() },
                { role: "assistant", content: "O telefone informado parece inválido. Por favor, informe um telefone válido, como (11) 91234-5678:", id: uuidv4() },
              ])
              setTimeout(scrollToBottom, 100)
              return
            }
            const telefoneFormatado = formatarTelefone(message)
            novaInfo["telefone"] = telefoneFormatado
            setMessages((prev) => [
              ...prev,
              { role: "user", content: telefoneFormatado, id: uuidv4() },
              { role: "assistant", content: "Perfeito! Obrigado pelos dados. Podemos seguir com a criação da videoaula agora 😊", id: uuidv4() },
            ])
            const novaInfoFinal = { ...novaInfo, [etapaCadastro]: telefoneFormatado }
            localStorage.setItem("cacilda_cliente_info", JSON.stringify(novaInfoFinal))
            const salvouComSucesso = await salvarClienteNoSupabase(novaInfoFinal)
            if (salvouComSucesso) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Seus dados foram salvos com sucesso! Nossa equipe entrará em contato em breve para discutir os detalhes da sua videoaula.", id: uuidv4() },
              ])
            }
            setEtapaCadastro(null)
            setColetandoDados(false)
            setClienteInfo(novaInfoFinal)
            setTimeout(scrollToBottom, 100)
            return
          }
          return
        }
      }

      // Fluxo normal: não está em cadastro
      const newUserMessage = { role: "user", content: message, id: uuidv4() }
      setMessages((prev) => [...prev, newUserMessage])
      setError(null)
      setIsThinking(true)
      try {
        const lowercaseMessage = message.toLowerCase().trim()
        if (lowercaseMessage.startsWith("/uploadcacilda")) {
          setShowUploadForm(true)
          setVideoToEdit(null)
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Formulário de upload de vídeo aberto.", id: uuidv4() },
          ])
          setIsThinking(false)
          return
        }
        if (lowercaseMessage.startsWith("/deletecacilda")) {
          setShowDeleteVideoForm(true)
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Gerenciador de vídeos aberto.", id: uuidv4() },
          ])
          setIsThinking(false)
          return
        }
        if (lowercaseMessage.startsWith("/promptcacilda")) {
          setShowPromptForm(true)
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Formulário para adicionar à base de conhecimento aberto.", id: uuidv4() },
          ])
          setIsThinking(false)
          return
        }
        if (lowercaseMessage.startsWith("/limparcliente")) {
          localStorage.removeItem("cacilda_cliente_info")
          setClienteInfo(null)
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Dados do cliente removidos com sucesso.", id: uuidv4() },
          ])
          setIsThinking(false)
          return
        }
        if (quickResponses[lowercaseMessage]) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: quickResponses[lowercaseMessage], id: uuidv4() },
            ])
            setIsThinking(false)
          }, 500)
          return
        }
        if (
          lowercaseMessage.includes("portfólio") ||
          lowercaseMessage.includes("portfolio") ||
          lowercaseMessage.includes("trabalhos") ||
          lowercaseMessage.includes("projetos") ||
          lowercaseMessage.includes("vídeos") ||
          lowercaseMessage.includes("videos")
        ) {
          try {
            const portfolioResponse = await fetch("/api/portfolio-response", {
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            if (portfolioResponse.ok) {
              const data = await portfolioResponse.json()
              if (data.success && data.response) {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: data.response, id: uuidv4(), cardType: "portfolio" },
                ])
                setIsThinking(false)
                return
              }
            }
            console.log("Falha ao buscar resposta de portfólio atualizada, usando fallback")
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: quickResponses["portfolio"], id: uuidv4(), cardType: "portfolio" },
              ])
              setIsThinking(false)
            }, 800)
            return
          } catch (error) {
            console.error("Erro ao buscar resposta de portfólio:", error)
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: quickResponses["portfolio"], id: uuidv4(), cardType: "portfolio" },
              ])
              setIsThinking(false)
            }, 800)
            return
          }
        }
        if (
          lowercaseMessage.includes("serviço") ||
          lowercaseMessage.includes("servico") ||
          lowercaseMessage.includes("oferecem") ||
          lowercaseMessage.includes("fazem")
        ) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: quickResponses["serviços"], id: uuidv4(), cardType: "servicos" },
            ])
            setIsThinking(false)
          }, 800)
          return
        }
        if (
          (lowercaseMessage.includes("videoaula") ||
            lowercaseMessage.includes("video aula") ||
            lowercaseMessage.includes("criar video") ||
            lowercaseMessage.includes("fazer video") ||
            lowercaseMessage.includes("produzir video") ||
            lowercaseMessage.includes("produção de video")) &&
          !coletandoDados &&
          !clienteInfo
        ) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "Ótimo! Para criarmos uma videoaula personalizada, precisamos de algumas informações suas. Vamos começar?", id: uuidv4() },
            ])
            setTimeout(() => { iniciarCadastroCliente() }, 1000)
            setIsThinking(false)
          }, 800)
          return
        }
        if (
          (lowercaseMessage.includes("videoaula") ||
            lowercaseMessage.includes("video aula") ||
            lowercaseMessage.includes("criar video")) &&
          !coletandoDados &&
          clienteInfo
        ) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `Olá ${clienteInfo?.nome_completo}! Já temos seus dados salvos. Podemos continuar trabalhando na sua videoaula sobre "${clienteInfo?.tema_desejado}". Como posso ajudar hoje?`, id: uuidv4() },
            ])
            setIsThinking(false)
          }, 800)
          return
        }
        if (shouldUseAssistant(message)) {
          console.log("Usando Assistant API para resposta complexa")
          const assistantMessageId = uuidv4()
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Processando sua solicitação...", id: assistantMessageId },
          ])

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 45000)

          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [...messages, { role: "user", content: message, id: uuidv4() }],
                timestamp: Date.now(),
              }),
              signal: controller.signal,
            })
            clearTimeout(timeoutId)
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              if (errorData && errorData.fallbackResponse) {
                setMessages((prev) => {
                  const index = prev.findIndex((m) => m.id === assistantMessageId)
                  if (index === -1) return prev
                  const newMessages = [...prev]
                  newMessages[index] = { role: "assistant", content: errorData.fallbackResponse, id: assistantMessageId }
                  return newMessages
                })
                setIsThinking(false)
                return
              }
              throw new Error(`Server error: ${response.status} ${response.statusText}`)
            }

            // Extrair dados extras sem consumir o body
            const responseClone = response.clone()
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              try {
                const data = await responseClone.json()
                if (data.threadId) {
                  localStorage.setItem("threadId", data.threadId)
                  console.log("Thread ID salvo:", data.threadId)
                }
              } catch (err) {
                console.error("Erro ao parsear JSON do clone:", err)
              }
            } else {
              try {
                const text = await responseClone.text()
                console.log("Resposta (texto):", text)
              } catch (err) {
                console.error("Erro ao ler resposta como texto:", err)
              }
            }

            // Streaming da resposta original
            const reader = response.body?.getReader()
            if (!reader) throw new Error("Não foi possível ler a resposta")
            const decoder = new TextDecoder()
            let assistantMessage = ""
            while (true) {
              const { value, done } = await reader.read()
              if (done) break
              const chunk = decoder.decode(value, { stream: true })
              const cleanedChunk = chunk
                .replace(/Gerando resposta\.\.\./g, "")
                .replace(/Aguardando na fila\.\.\./g, "")
                .replace(/Processando sua solicitação\.\.\./g, "")
              if (cleanedChunk.trim()) assistantMessage += cleanedChunk
              setMessages((prev) => {
                const index = prev.findIndex((m) => m.id === assistantMessageId)
                if (index === -1) return prev
                const newMessages = [...prev]
                newMessages[index] = { role: "assistant", content: assistantMessage, id: assistantMessageId }
                return newMessages
              })
              scrollToBottom()
            }
          } catch (error: any) {
            console.error("Error:", error)
            if (error.name === "AbortError") {
              setMessages((prev) => {
                const index = prev.findIndex((m) => m.id === assistantMessageId)
                if (index === -1) return prev
                const newMessages = [...prev]
                newMessages[index] = { role: "assistant", content: "Desculpe, a resposta está demorando mais do que o esperado. Por favor, tente uma pergunta mais simples ou entre em contato pelo email atendimento@cacildafilmes.com.", id: assistantMessageId }
                return newMessages
              })
            } else {
              try {
                setMessages((prev) => {
                  const index = prev.findIndex((m) => m.id === assistantMessageId)
                  if (index === -1) return prev
                  const newMessages = [...prev]
                  newMessages[index] = { role: "assistant", content: "Processando com método alternativo...", id: assistantMessageId }
                  return newMessages
                })
                const fallbackResponse = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    messages: [{ role: "user", content: message, id: uuidv4() }],
                    useSimpleModel: true,
                    timestamp: Date.now(),
                  }),
                })
                if (!fallbackResponse.ok) {
                  throw new Error("Falha no método alternativo")
                }
                const reader = fallbackResponse.body?.getReader()
                if (!reader) throw new Error("Não foi possível ler a resposta alternativa")
                const decoder = new TextDecoder()
                let fallbackContent = ""
                while (true) {
                  const { value, done } = await reader.read()
                  if (done) break
                  const chunk = decoder.decode(value, { stream: true })
                  fallbackContent += chunk
                  setMessages((prev) => {
                    const index = prev.findIndex((m) => m.id === assistantMessageId)
                    if (index === -1) return prev
                    const newMessages = [...prev]
                    newMessages[index] = { role: "assistant", content: fallbackContent, id: assistantMessageId }
                    return newMessages
                  })
                  scrollToBottom()
                }
              } catch (fallbackError) {
                console.error("Fallback error:", fallbackError)
                setMessages((prev) => {
                  const index = prev.findIndex((m) => m.id === assistantMessageId)
                  if (index === -1) return prev
                  const newMessages = [...prev]
                  newMessages[index] = { role: "assistant", content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato pelo email atendimento@cacildafilmes.com.", id: assistantMessageId }
                  return newMessages
                })
              }
            } finally {
              clearTimeout(timeoutId)
            }
          } else {
            console.log("Usando resposta local para pergunta simples")
            let bestMatch = null
            let bestMatchScore = 0
            for (const [key, response] of Object.entries(quickResponses)) {
              if (key.length < 4) continue
              const keyWords = key.split(" ")
              let matchScore = 0
              for (const word of keyWords) {
                if (word.length > 3 && lowercaseMessage.includes(word)) {
                  matchScore += 1
                }
              }
              if (matchScore > bestMatchScore) {
                bestMatch = response
                bestMatchScore = matchScore
              }
            }
            if (bestMatch && bestMatchScore > 0) {
              setTimeout(() => {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: bestMatch as string, id: uuidv4() },
                ])
                setIsThinking(false)
                scrollToBottom()
              }, 800)
            } else {
              console.log("Nenhuma correspondência local encontrada, usando Assistant API")
              const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [...messages, { role: "user", content: message, id: uuidv4() }],
                  timestamp: Date.now(),
                }),
              })
              if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`)
              }
              const responseClone = response.clone()
              const contentType = response.headers.get("content-type")
              if (contentType && contentType.includes("application/json")) {
                try {
                  const data = await responseClone.json()
                  if (data.threadId) {
                    localStorage.setItem("threadId", data.threadId)
                    console.log("Thread ID salvo:", data.threadId)
                  }
                } catch (err) {
                  console.error("Erro ao parsear JSON do clone:", err)
                }
              } else {
                try {
                  const text = await responseClone.text()
                  console.log("Resposta (texto):", text)
                } catch (err) {
                  console.error("Erro ao ler resposta como texto:", err)
                }
              }
              const reader = response.body?.getReader()
              if (!reader) throw new Error("Não foi possível ler a resposta")
              const assistantMessageId = uuidv4()
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "", id: assistantMessageId },
              ])
              const decoder = new TextDecoder()
              let assistantMessage = ""
              while (true) {
                const { value, done } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })
                const cleanedChunk = chunk
                  .replace(/Gerando resposta\.\.\./g, "")
                  .replace(/Aguardando na fila\.\.\./g, "")
                  .replace(/Processando sua solicitação\.\.\./g, "")
                if (cleanedChunk.trim()) {
                  assistantMessage += cleanedChunk
                }
                setMessages((prev) => {
                  const index = prev.findIndex((m) => m.id === assistantMessageId)
                  if (index === -1) return prev
                  const newMessages = [...prev]
                  newMessages[index] = { role: "assistant", content: assistantMessage, id: assistantMessageId }
                  return newMessages
                })
                scrollToBottom()
              }
            }
          }
        } catch (error) {
          console.error("Error:", error)
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.", id: uuidv4() },
          ])
        } finally {
          setIsThinking(false)
          setTimeout(scrollToBottom, 100)
        }
      }
    },
    [messages, quickResponses, shouldUseAssistant, scrollToBottom, clienteInfo, coletandoDados, etapaCadastro, camposCadastro]
  )

  const handleQuickAccessClick = useCallback(
    (topic: string) => {
      const event = new Event("chatInteraction")
      window.dispatchEvent(event)
      setIsInitialPositionn(false)
      const newUserMessage = { role: "user", content: topic, id: uuidv4() }
      setMessages((prev) => [...prev, newUserMessage])
      const topicMap: Record<string, string> = {
        portfolio: "portfolio",
        servicos: "serviços",
        sobre: "sobre",
        contato: "contato",
      }
      const mappedTopic = topicMap[topic] || topic
      let cardType: CardType | undefined
      let content = ""
      switch (mappedTopic) {
        case "portfolio":
          cardType = "portfolio"
          content = ""
          break
        case "servicos":
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
          handleMessageSent(topic)
          return
      }
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: content, id: uuidv4(), cardType: cardType },
        ])
        setTimeout(scrollToBottom, 100)
      }, 500)
    },
    [handleMessageSent, quickResponses, scrollToBottom],
  )

  const handleError = useCallback((error: string) => {
    console.error("Error:", error)
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

  const handleFirstInteraction = useCallback(() => {
    const event = new Event("chatInteraction")
    window.dispatchEvent(event)
    setIsChatCentered(false)
    setIsInitialPosition(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)
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

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!input.trim() || isThinking) return
      setIsInitialPosition(false)
      const message = input.trim()
      setInput("")
      await handleMessageSent(message)
    },
    [input, isThinking, handleMessageSent],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  useEffect(() => {
    if (isClient) {
      try {
        const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")
        if (!hasVisitedBefore && !tutorialCompleted) {
          const timer = setTimeout(() => setShowTutorial(true), 1500)
          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error("Erro ao acessar localStorage:", error)
      }
    }
  }, [tutorialCompleted, isClient])

  const handleTutorialComplete = () => {
    setTutorialCompleted(true)
    setShowTutorial(false)
    if (isClient) {
      try {
        localStorage.setItem("hasVisitedBefore", "true")
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error)
      }
    }
  }

  const handleUploadFormSubmit = async (data: any) => {
    try {
      if (data.id) {
        const response = await fetch("/api/update-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        if (!response.ok) throw new Error("Falha ao atualizar o vídeo")
        toast.success("Vídeo atualizado com sucesso!")
      } else {
        const response = await fetch("/api/upload-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        if (!response.ok) throw new Error("Falha ao fazer upload do vídeo")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error("Falha ao deletar o vídeo")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      })
      if (!response.ok) throw new Error("Falha ao adicionar à base de conhecimento")
      toast.success("Informação adicionada à base de conhecimento com sucesso!")
      setShowPromptForm(false)
    } catch (error) {
      console.error("Erro ao adicionar à base de conhecimento:", error)
      toast.error("Erro ao adicionar à base de conhecimento. Por favor, tente novamente.")
      throw error
    }
  }

  const getVimeoId = (vimeoLink: string): string => {
    const parts = vimeoLink.split("/")
    return parts[parts.length - 1].split("?")[0]
  }

  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message])
      if (!isAtBottom && message.role === "assistant") setUnreadCount((prev) => prev + 1)
      if (message.role === "assistant") setIsThinking(false)
    },
    [isAtBottom],
  )

  useEffect(() => {
    const container = chatContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkIfAtBottom)
      return () => container.removeEventListener("scroll", checkIfAtBottom)
    }
  }, [checkIfAtBottom])

  useEffect(() => {
    iniciarCadastroCliente()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Header chatInteracted={chatInteracted} />
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
              style={{ maxHeight: "calc(100vh - 180px)" }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      id={message.id}
                      className={`mb-4 sm:mb-6 md:mb-8 message-item ${message.role === "user" ? "pl-1 sm:pl-4 md:pl-8" : ""}`}
                    >
                      {message.role === "user" && (
                        <div className="uppercase text-white mb-1 sm:mb-2 tracking-wider text-xs sm:text-sm">VOCÊ:</div>
                      )}
                      {message.role === "assistant" && (
                        <div className="uppercase text-white mb-1 sm:mb-2 tracking-wider text-xs sm:text-sm">CACILDA:</div>
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
                          <MessageContent content={message.content} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isThinking && (
                  <div className="mb-4 sm:mb-6 md:mb-8 message-item">
                    <div className="uppercase text-white mb-1 sm:mb-2 tracking-wider text-xs sm:text-sm">CACILDA:</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
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
        <motion.div
          className="fixed left-0 right-0 p-2 sm:p-4 border-t border-gray-800 bg-black"
          initial={{ bottom: 0 }}
          animate={{ bottom: isInitialPosition ? "calc(50vh - 180px)" : 0, transition: { duration: 0.6, ease: "easeInOut" } }}
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
                  className="w-full bg-black text-white border border-gray-800 rounded-lg pr-14 min-h-[50px] max-h-[100px] resize-none text-sm sm:text-base"
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
                            if (textareaRef.current) textareaRef.current.focus()
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
                    className={`p-2 rounded-full ${!input.trim() || isThinking ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"} transition-colors duration-300 flex items-center justify-center`}
                    aria-label="Enviar mensagem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-2 sm:mt-4 flex justify-center">
              <QuickAccessButtons onButtonClick={handleQuickAccessClick} />
            </div>
          </div>
        </motion.div>
      </div>
      <GuidedTour isOpen={showTutorial} onClose={() => setShowTutorial(false)} onComplete={handleTutorialComplete} />
      {tutorialCompleted && (
        <button onClick={() => setShowTutorial(true)} className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors z-40" aria-label="Abrir tutorial">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
      {showUploadForm && (
        <UploadForm onClose={() => setShowUploadForm(false)} onSubmit={handleUploadFormSubmit} videoToEdit={videoToEdit} />
      )}
      {showDeleteVideoForm && (
        <DeleteVideoPopup onClose={() => setShowDeleteVideoForm(false)} onDelete={handleDeleteVideo} onEdit={handleEditVideo} />
      )}
      {showPromptForm && <PromptPopup onClose={() => setShowPromptForm(false)} onSubmit={handlePromptSubmit} />}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  )
}
