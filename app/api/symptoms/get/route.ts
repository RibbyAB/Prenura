import { NextRequest, NextResponse } from "next/server"
import { getUserSymptoms } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        {
          error: "user_id wajib diisi",
        },
        { status: 400 }
      )
    }

    const gejala = await getUserSymptoms(userId)

    return NextResponse.json(
      {
        success: true,
        gejala,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error getting symptoms:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat mengambil gejala",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

