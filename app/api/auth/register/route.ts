import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { findUserByEmail, createUser } from "@/lib/storage"

// Schema validasi untuk register
const registerSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email harus berakhiran @gmail.com",
    }),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  umur: z.string().min(1, "Umur harus diisi"),
  nomorHp: z
    .string()
    .min(1, "Nomor HP harus diisi")
    .refine((hp) => hp.startsWith("+62") || hp.startsWith("62") || hp.startsWith("0"), {
      message: "Nomor HP harus diawali dengan +62, 62, atau 0",
    })
    .transform((hp) => {
      // Normalize ke format +62
      if (hp.startsWith("0")) {
        return "+62" + hp.substring(1)
      }
      if (hp.startsWith("62")) {
        return "+" + hp
      }
      return hp
    }),
  role: z.literal("ibu-hamil").default("ibu-hamil"),
  hpht: z.string().optional(), // HPHT untuk ibu hamil
  tanggalLahir: z.string().optional(), // Tanggal lahir
})

export async function POST(request: NextRequest) {
  try {
    console.log("[Register] Starting registration process")
    const body = await request.json()
    console.log("[Register] Request body:", { ...body, password: "***", confirmPassword: "***" })

    // Validasi dengan Zod
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      console.log("[Register] Validation failed:", validationResult.error.errors)
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validasi password match
    if (data.password !== data.confirmPassword) {
      console.log("[Register] Password mismatch")
      return NextResponse.json(
        {
          error: "Password dan konfirmasi password tidak cocok",
        },
        { status: 400 }
      )
    }

    // Cek apakah email sudah ada
    const existingUser = await findUserByEmail(data.email)
    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
        },
        { status: 400 }
      )
    }

    // Simpan user ke storage
    let user
    try {
      user = await createUser({
        email: data.email,
        password: data.password, // In production, hash this password
        nama: data.nama,
        umur: data.umur,
        nomorHp: data.nomorHp,
        role: "ibu-hamil",
        hpht: data.hpht,
        tanggalLahir: data.tanggalLahir,
        pregnancyData: null,
      })
    } catch (error: any) {
      if (error.message === "Email already exists") {
        return NextResponse.json(
          {
            error: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Return success (tanpa password)
    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          umur: user.umur,
          nomorHp: user.nomorHp,
          role: user.role,
          hpht: user.hpht,
          tanggalLahir: user.tanggalLahir,
          pregnancyData: user.pregnancyData,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat registrasi",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
