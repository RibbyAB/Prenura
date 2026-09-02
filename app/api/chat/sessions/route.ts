import { NextRequest, NextResponse } from "next/server"
import { deleteAllChatSessionsForUser, deleteChatSession, getChatSessionsByUserId } from "@/lib/storage"

// GET: Get all chat sessions for logged-in user
export async function GET(request: NextRequest) {
  try {
    // Get user_id from query or header (in production, get from JWT/session)
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id diperlukan" }, { status: 400 })
    }

    console.log("[Chat Sessions] Getting sessions for user:", userId)
    const sessions = await getChatSessionsByUserId(userId)

    return NextResponse.json(
      {
        success: true,
        sessions: sessions.map((s) => ({
          session_id: s.session_id,
          preview: s.preview,
          created_at: s.created_at,
          updated_at: s.updated_at,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Chat Sessions] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat mengambil riwayat chat",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE: Delete a chat session (and its messages)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")
    const sessionId = searchParams.get("session_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id diperlukan" }, { status: 400 })
    }

    // If no specific sessionId provided, delete all sessions for user
    if (!sessionId) {
      console.log("[Chat Sessions] Deleting ALL sessions for user:", userId)
      const result = await deleteAllChatSessionsForUser(userId)
      return NextResponse.json(
        {
          success: true,
          deleted_sessions: result.deletedSessions,
          deleted_messages: result.deletedMessages,
        },
        { status: 200 }
      )
    }

    console.log("[Chat Sessions] Deleting session:", sessionId, "for user:", userId)
    const result = await deleteChatSession(sessionId, userId)

    if (!result.deletedSession) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        deleted_messages: result.deletedMessages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Chat Sessions] Error deleting session:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menghapus riwayat chat",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}



