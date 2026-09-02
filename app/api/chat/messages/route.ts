import { NextRequest, NextResponse } from "next/server"
import {
  getChatMessagesBySessionId,
  saveChatMessage,
  createChatSession,
  getChatSessionsByUserId,
} from "@/lib/storage"

// GET: Get all messages in a session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "session_id diperlukan" }, { status: 400 })
    }

    console.log("[Chat Messages] Getting messages for session:", sessionId)
    const messages = await getChatMessagesBySessionId(sessionId)

    return NextResponse.json(
      {
        success: true,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          message: m.message,
          created_at: m.created_at,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Chat Messages] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat mengambil pesan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST: Save a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, user_id, role, message } = body

    if (!session_id || !user_id || !role || !message) {
      return NextResponse.json(
        { error: "session_id, user_id, role, dan message diperlukan" },
        { status: 400 }
      )
    }

    if (role !== "user" && role !== "assistant") {
      return NextResponse.json({ error: "role harus 'user' atau 'assistant'" }, { status: 400 })
    }

    console.log("[Chat Messages] Saving message:", { session_id, user_id, role, message_length: message.length })

    // Save message
    const chatMessage = await saveChatMessage(session_id, user_id, role, message)

    return NextResponse.json(
      {
        success: true,
        message: {
          id: chatMessage.id,
          session_id: chatMessage.session_id,
          role: chatMessage.role,
          message: chatMessage.message,
          created_at: chatMessage.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Chat Messages] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menyimpan pesan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// PUT: Create a new chat session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, preview } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id diperlukan" }, { status: 400 })
    }

    console.log("[Chat Messages] Creating new session for user:", user_id)
    const sessionId = await createChatSession(user_id, preview || "Chat baru")

    return NextResponse.json(
      {
        success: true,
        session_id: sessionId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Chat Messages] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat membuat session baru",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}









