"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Send, Plus, MessageCircle, Loader2, Sparkles, Stethoscope, X, ArrowLeft, History, Trash2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatHistory {
  id: string
  preview: string
  timestamp: Date
}

const MAX_CONVERSATION_HISTORY = 8

const OFF_TOPIC_MESSAGE =
  "Maaf, saya hanya dapat membantu pertanyaan seputar kesehatan ibu hamil dan pasca melahirkan. Silakan tanyakan hal terkait kehamilan, nutrisi, atau gejala yang Anda rasakan."

const maternalKeywords = [
  "hamil",
  "postpartum",
  "pasca melahirkan",
  "nifas",
  "ibu",
  "bayi",
  "asi",
  "pusing",
  "bengkak",
  "perdarahan",
  "nutrisi",
  "gizi",
  "tekanan darah",
  "hemoglobin",
  "kontrol",
  "puskesmas",
  "rujukan",
]

const quickPrompts = [
  "Pusing dan bengkak kaki, apa yang harus dilakukan?",
  "Menu tinggi zat besi untuk ibu menyusui",
  "Kapan kontrol lagi pasca melahirkan?",
  "Tanda bahaya tekanan darah naik",
]

const riskGuides = [
  "Gejala bahaya: perdarahan banyak, kejang, demam tinggi, napas sesak.",
  "Rujukan cepat: hubungi layanan kesehatan terdekat, siapkan transportasi, catat lokasi puskesmas/RS.",
  "Nutrisi anemia: perbanyak protein hewani, sayur hijau, vitamin C untuk penyerapan besi.",
]

export default function ChatbotPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo! 👋 Saya Prenura AI Assistant. Saya fokus pada kesehatan ibu hamil dan pasca melahirkan (0-24 minggu). Tanyakan gejala, nutrisi, jadwal kontrol, atau tanda bahaya.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([])

  // Load chat sessions from API
  const loadChatSessions = useCallback(async (uid: string) => {
    try {
      const response = await fetch(`/api/chat/sessions?user_id=${uid}`)
      if (response.ok) {
        const data = await response.json()
        setChatHistory(
          data.sessions.map((s: any) => ({
            id: s.session_id,
            preview: s.preview,
            timestamp: new Date(s.updated_at),
          }))
        )
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error)
    }
  }, [])

  // Check login and get user ID from localStorage
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.id) {
      console.log("[Chatbot] User ID loaded:", user.id)
      setUserId(user.id)
      loadChatSessions(user.id)
    } else {
      console.warn("[Chatbot] No user found in localStorage")
      router.push("/auth/login")
    }
  }, [loadChatSessions, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isMaternalTopic = useMemo(
    () => (text: string) => maternalKeywords.some((kw) => text.toLowerCase().includes(kw)),
    []
  )

  const handleSendMessage = async (text?: string) => {
    const messageText = typeof text === "string" ? text : inputValue
    console.log("[Chatbot] handleSendMessage called", { hasText: !!text, messageLength: messageText.length, isLoading })

    if (!messageText.trim()) {
      console.log("[Chatbot] Message is empty")
      return
    }

    if (isLoading) {
      console.log("[Chatbot] Already loading, ignoring")
      return
    }

    // Get userId if not already loaded
    let uid = userId
    if (!uid) {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.id) {
        uid = user.id
        setUserId(uid)
        console.log("[Chatbot] User ID loaded from localStorage:", uid)
      } else {
        console.error("[Chatbot] User not found. Please login first.")
        alert("Silakan login terlebih dahulu untuk menggunakan chatbot.")
        router.push("/auth/login")
        return
      }
    }

    // Create new session if this is the first message
    let sessionId = currentSessionId
    if (!sessionId) {
      try {
        const createSessionResponse = await fetch("/api/chat/messages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: uid,
            preview: messageText.substring(0, 50),
          }),
        })
        if (createSessionResponse.ok) {
          const sessionData = await createSessionResponse.json()
          sessionId = sessionData.session_id
          setCurrentSessionId(sessionId)
          await loadChatSessions(uid)
        }
      } catch (error) {
        console.error("Error creating session:", error)
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!text) {
      setInputValue("")
    }
    setIsLoading(true)

    try {
      // Save user message to backend
      if (sessionId) {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: uid,
            role: "user",
            message: messageText,
          }),
        })
      }

      // Gunakan conversation history dari ref untuk context
      const conversationHistory = conversationHistoryRef.current

      // Panggil Gemini API with retry logic
      let response: Response | null = null
      let data: any = null
      let lastError: Error | null = null
      const maxRetries = 3
      const timeoutMs = 30000 // 30 seconds
      
      // Create timeout controller
      const createTimeoutController = () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        return { controller, timeoutId }
      }
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const { controller, timeoutId } = createTimeoutController()
        try {
          response = await fetch("/api/gemini", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: messageText,
              conversationHistory,
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `API returned status ${response.status}`)
          }

          data = await response.json()
          break // Success, exit retry loop
        } catch (error: any) {
          clearTimeout(timeoutId)
          lastError = error
          console.error(`[Chatbot] Attempt ${attempt} failed:`, error)
          
          // Don't retry on certain errors
          if (error.name === "AbortError" || error.message?.includes("timeout") || error.message?.includes("aborted")) {
            throw new Error("Waktu tunggu habis. Silakan coba lagi.")
          }
          
          // Don't retry on client errors (4xx)
          if (response && response.status >= 400 && response.status < 500) {
            throw error
          }
          
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          } else {
            throw lastError || new Error("Gagal mendapatkan respons dari server")
          }
        }
      }

      if (!data || !data.response) {
        throw new Error("Tidak ada respons dari server")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message to backend
      if (sessionId) {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: uid,
            role: "assistant",
            message: assistantMessage.content,
          }),
        })
        await loadChatSessions(uid)
      }

      // Update conversation history untuk context berikutnya
      conversationHistoryRef.current = [
        ...conversationHistory,
        { role: "user", content: messageText },
        { role: "assistant", content: assistantMessage.content },
      ].slice(-MAX_CONVERSATION_HISTORY) // Keep limited history to avoid exceeding model shape

      console.log("[Chatbot] Message sent successfully")
    } catch (error) {
      console.error("[Chatbot] Error in handleSendMessage:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Pastikan koneksi internet Anda stabil dan coba lagi. Jika masalah berlanjut, hubungi dokter Anda atau fasilitas kesehatan terdekat.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      console.log("[Chatbot] handleSendMessage finished")
    }
  }

  const handleNewChat = async () => {
    // Reset messages ke welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Halo! 👋 Saya Prenura AI Assistant. Saya fokus pada kesehatan ibu hamil dan pasca melahirkan (0-24 minggu). Tanyakan gejala, nutrisi, jadwal kontrol, atau tanda bahaya.",
        timestamp: new Date(),
      },
    ])
    setInputValue("")
    setCurrentSessionId(null)
    // Reset conversation history untuk memulai sesi baru dengan backend
    conversationHistoryRef.current = []

    // Reload chat sessions
    if (userId) {
      await loadChatSessions(userId)
    }
  }

  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const loadedMessages: Message[] = [
          {
            id: "welcome",
            role: "assistant",
            content:
              "Halo! 👋 Saya Prenura AI Assistant. Saya fokus pada kesehatan ibu hamil dan pasca melahirkan (0-24 minggu). Tanyakan gejala, nutrisi, jadwal kontrol, atau tanda bahaya.",
            timestamp: new Date(),
          },
          ...data.messages.map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.message,
            timestamp: new Date(m.created_at),
          })),
        ]
        setMessages(loadedMessages)
        setCurrentSessionId(sessionId)
        setShowHistory(false)

        // Restore conversation history from messages
        conversationHistoryRef.current = data.messages
          .map((m: any) => ({ role: m.role, content: m.message }))
          .slice(-MAX_CONVERSATION_HISTORY)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const deleteChatHistory = async (sessionId: string) => {
    try {
      if (!userId) return
      const response = await fetch(`/api/chat/sessions?user_id=${userId}&session_id=${sessionId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        console.error("Failed to delete session:", data?.error || data)
        alert(data?.error || "Gagal menghapus riwayat chat")
        return
      }

      const updatedHistory = chatHistory.filter((h) => h.id !== sessionId)
      setChatHistory(updatedHistory)
      if (currentSessionId === sessionId) {
        handleNewChat()
      }
      await loadChatSessions(userId)
    } catch (error) {
      console.error("Error deleting chat session:", error)
      alert("Terjadi kesalahan saat menghapus riwayat chat.")
    }
  }

  const deleteAllChatHistory = async () => {
    try {
      if (!userId) return
      const confirmed = confirm("Hapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.")
      if (!confirmed) return

      const response = await fetch(`/api/chat/sessions?user_id=${userId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        console.error("Failed to delete all sessions:", data?.error || data)
        alert(data?.error || "Gagal menghapus semua riwayat chat")
        return
      }

      setChatHistory([])
      handleNewChat()
    } catch (error) {
      console.error("Error deleting all chat sessions:", error)
      alert("Terjadi kesalahan saat menghapus semua riwayat chat.")
    }
  }

  const handleExit = () => {
    // Kembalikan ke dashboard atau halaman sebelumnya
    router.push("/dashboard/ibu-hamil")
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex w-72 bg-pink-50 border-r border-pink-100 flex-col">
        <div className="p-4 space-y-2">
          <Button onClick={handleNewChat} className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Chat Baru
          </Button>
          <Button onClick={handleExit} variant="outline" className="w-full border-pink-200 text-pink-700 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Keluar
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="p-3 border-pink-100 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">Riwayat Chat</p>
              <div className="flex items-center gap-2">
                {chatHistory.length > 0 && (
                  <button
                    onClick={deleteAllChatHistory}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    title="Hapus semua riwayat"
                  >
                    <Trash2 className="w-3 h-3" />
                    Hapus semua
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-pink-600 hover:text-pink-700"
                >
                  {showHistory ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>
            {showHistory && (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">Belum ada riwayat chat</p>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        currentSessionId === chat.id
                          ? "bg-pink-100 border-pink-300"
                          : "bg-gray-50 border-gray-200 hover:bg-pink-50"
                      }`}
                    >
                      <button
                        onClick={() => loadChatHistory(chat.id)}
                        className="flex-1 text-left text-xs text-gray-700 whitespace-normal break-words"
                      >
                        <p className="font-medium">{chat.preview || "Chat baru"}</p>
                        <p className="text-gray-500 text-xs">
                          {chat.timestamp.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChatHistory(chat.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
          <Card className="p-3 border-pink-100 bg-white">
            <p className="text-sm font-semibold text-gray-900 mb-2">Contoh cepat</p>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg bg-pink-50 border border-pink-100 text-sm text-gray-800 hover:bg-pink-100 transition-colors disabled:opacity-50"
                  onClick={() => {
                    console.log("[Chatbot] Quick prompt clicked:", prompt)
                    handleSendMessage(prompt)
                  }}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-3 border-pink-100 bg-white space-y-2">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-600" />
              Panduan Cepat
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              {riskGuides.map((guide) => (
                <li key={guide}>• {guide}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-pink-100 p-4 flex items-center gap-3">
          <Button
            onClick={handleExit}
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Prenura AI Assistant</h1>
            <p className="text-sm text-gray-500">Bahasa Indonesia • Fokus kesehatan ibu</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNewChat}
              variant="ghost"
              size="sm"
              className="hidden md:flex text-gray-600 hover:text-gray-900"
              title="Chat Baru"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleExit}
              variant="ghost"
              size="sm"
              className="hidden md:flex text-gray-600 hover:text-gray-900"
              title="Keluar"
            >
              <X className="w-4 h-4" />
            </Button>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">24/7</Badge>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-pink-600 text-white rounded-br-none"
                    : "bg-pink-50 text-gray-900 border border-pink-200 rounded-bl-none"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="ml-2">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <p className={`text-xs mt-1 ${message.role === "user" ? "text-pink-100" : "text-gray-500"}`}>
                  {message.timestamp.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-pink-50 border border-pink-200 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-pink-600 animate-spin" />
                <span className="text-xs text-gray-700">AI sedang menyusun jawaban...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-pink-100 p-4 space-y-2">
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <Stethoscope className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Prenura memberi saran awal. Untuk kondisi darurat, segera hubungi dokter atau RS terdekat.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault()
                  console.log("[Chatbot] Enter pressed")
                  handleSendMessage()
                }
              }}
              placeholder="Tanyakan gejala, nutrisi, atau jadwal kontrol..."
              className="flex-1 px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 text-sm"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={() => {
                console.log("[Chatbot] Send button clicked")
                if (!isLoading) {
                  handleSendMessage()
                }
              }}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 text-white gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Topik yang didukung: gejala ibu, nutrisi, tekanan darah, hemoglobin, jadwal kontrol, rujukan darurat.
          </p>
        </div>
      </div>
    </div>
  )
}
