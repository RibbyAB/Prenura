import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { saveUserSymptoms } from "@/lib/storage"

const saveSymptomsSchema = z.object({
  user_id: z.string().min(1, "user_id wajib diisi"),
  gejala: z.array(z.string()).min(0, "Gejala harus berupa array"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = saveSymptomsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { user_id, gejala } = validationResult.data

    // Save symptoms
    const saved = await saveUserSymptoms(user_id, gejala)

    return NextResponse.json(
      {
        success: true,
        message: "Gejala berhasil disimpan",
        data: saved,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving symptoms:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menyimpan gejala",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

