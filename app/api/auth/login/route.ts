import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { findUserByEmail } from "@/lib/storage"

// Schema validasi untuk login
const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email harus berakhiran @gmail.com",
    }),
  password: z.string().min(1, "Password harus diisi"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[Login] Starting login process")
    const body = await request.json()
    console.log("[Login] Request body:", { email: body.email, password: "***" })

    // Validasi dengan Zod
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      console.log("[Login] Validation failed:", validationResult.error.errors)
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Cari user di storage
    const user = await findUserByEmail(email)

    if (!user) {
      console.log("[Login] User not found:", email)
      return NextResponse.json(
        {
          error: "Email atau password salah",
        },
        { status: 401 }
      )
    }

    // Cek password (dalam produksi, gunakan hash comparison)
    if (user.password !== password) {
      console.log("[Login] Password mismatch for user:", email)
      return NextResponse.json(
        {
          error: "Email atau password salah",
        },
        { status: 401 }
      )
    }

    console.log("[Login] Login successful for user:", user.id)

    // Return user data (tanpa password)
    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          umur: user.umur,
          nomorHp: user.nomorHp,
          role: "ibu-hamil",
          hpht: user.hpht,
          tanggalLahir: user.tanggalLahir,
          pregnancyData: user.pregnancyData,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Login] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat login",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
