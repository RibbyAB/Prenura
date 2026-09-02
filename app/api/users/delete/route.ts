import { NextRequest, NextResponse } from "next/server"
import { deleteUser } from "@/lib/storage"

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id diperlukan" }, { status: 400 })
    }

    // Note: In production, verify admin role from session/JWT
    // For now, we assume the request comes from authenticated admin

    const result = await deleteUser(userId)

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil dihapus",
        deletedData: result.deletedData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat menghapus user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

