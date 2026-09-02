import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getUserById, updateUser } from "@/lib/storage"

const updateUserSchema = z.object({
  user_id: z.string().min(1, "user_id wajib diisi"),
  nama: z.string().min(3, "Nama minimal 3 karakter").optional(),
  umur: z.string().optional(),
  nomorHp: z
    .string()
    .optional()
    .refine(
      (hp) => !hp || hp.startsWith("+62") || hp.startsWith("62") || hp.startsWith("0"),
      {
        message: "Nomor HP harus diawali dengan +62, 62, atau 0",
      }
    )
    .transform((hp) => {
      if (!hp) return hp
      // Normalize ke format +62
      if (hp.startsWith("0")) {
        return "+62" + hp.substring(1)
      }
      if (hp.startsWith("62")) {
        return "+" + hp
      }
      return hp
    }),
  hpht: z.string().optional(),
  tanggalLahir: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = updateUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const userId = data.user_id

    // Get existing user
    const existingUser = await getUserById(userId)
    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User tidak ditemukan",
        },
        { status: 404 }
      )
    }

    // Prepare updates
    const updates: any = {}
    if (data.nama !== undefined) updates.nama = data.nama
    if (data.umur !== undefined) updates.umur = data.umur
    if (data.nomorHp !== undefined) updates.nomorHp = data.nomorHp
    if (data.hpht !== undefined) updates.hpht = data.hpht
    if (data.tanggalLahir !== undefined) updates.tanggalLahir = data.tanggalLahir

    // Update user
    const updatedUser = await updateUser(userId, updates)

    // Return updated user (tanpa password)
    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil diperbarui",
        user: {
          id: updatedUser.id,
          nama: updatedUser.nama,
          email: updatedUser.email,
          umur: updatedUser.umur,
          nomorHp: updatedUser.nomorHp,
          role: updatedUser.role,
          hpht: updatedUser.hpht,
          tanggalLahir: updatedUser.tanggalLahir,
          pregnancyData: updatedUser.pregnancyData,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[UpdateUser] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memperbarui profil",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

