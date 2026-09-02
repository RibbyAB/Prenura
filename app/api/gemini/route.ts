import { NextRequest, NextResponse } from "next/server"
import { askGemini, createPrenuraSystemPrompt, isRelevantTopic, type GeminiMessage } from "@/lib/gemini"

// export const runtime = "edge" // Disabled untuk kompatibilitas environment variables

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Cek apakah pertanyaan relevan dengan topik kesehatan ibu/postpartum
    if (!isRelevantTopic(message)) {
      return NextResponse.json(
        {
          response:
            "Maaf, saya hanya dapat membantu pertanyaan seputar kesehatan ibu hamil dan pasca melahirkan. Silakan tanyakan hal terkait kehamilan, nutrisi, atau gejala yang Anda rasakan.",
        },
        { status: 200 }
      )
    }

    // Buat conversation history dengan system prompt
    const systemPrompt = createPrenuraSystemPrompt()
    const messages: GeminiMessage[] = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ]

    // Tambahkan history conversation (maksimal 10 pesan terakhir untuk efisiensi)
    const recentHistory = conversationHistory.slice(-10)
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })
      }
    }

    // Tambahkan pesan terbaru
    messages.push({
      role: "user",
      parts: [{ text: message }],
    })

    // Panggil Gemini API
    const response = await askGemini(messages)

    return NextResponse.json({ response }, { status: 200 })
  } catch (error) {
    console.error("Error in Gemini API route:", error)
    
    // Provide more specific error messages
    let errorMessage = "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi."
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("GEMINI_API_KEY")) {
        errorMessage = "Konfigurasi API tidak valid. Silakan hubungi administrator."
      } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
        errorMessage = "Server sedang sibuk. Silakan coba lagi dalam beberapa saat."
      } else if (error.message.includes("timeout") || error.message.includes("network")) {
        errorMessage = "Koneksi timeout. Pastikan koneksi internet Anda stabil dan coba lagi."
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

