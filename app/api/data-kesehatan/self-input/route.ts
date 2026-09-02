import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { addHealthData } from "@/lib/storage"

const healthDataSchema = z.object({
  ibu_hamil_id: z.string().min(1, "User ID harus diisi"),
  tekanan_darah_sistolik: z.number().min(60).max(250, "Tekanan darah sistolik tidak valid"),
  tekanan_darah_diastolik: z.number().min(40).max(150, "Tekanan darah diastolik tidak valid"),
  hemoglobin: z.number().min(5).max(20, "Hemoglobin tidak valid"),
  berat_badan: z.number().min(30).max(200, "Berat badan tidak valid"),
  mood: z.enum(["Baik", "Sedang", "Buruk"]),
  energi: z.enum(["Baik", "Sedang", "Buruk"]),
  tanggal_pemeriksaan: z.string().min(1, "Tanggal pemeriksaan harus diisi"), // Format: YYYY-MM-DD atau YYYY-MM-DDTHH:mm
  catatan: z.string().optional(),
  usia_kehamilan: z.number().min(0).max(42).optional(),
  postpartum_minggu: z.number().min(0).max(24).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = healthDataSchema.safeParse(body)
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

    // Note: In production, verify user role from session/JWT
    // For now, we assume the request comes from authenticated ibu-hamil

    // Save health data
    const healthData = await addHealthData({
      ibu_hamil_id: data.ibu_hamil_id,
      tekanan_darah_sistolik: data.tekanan_darah_sistolik,
      tekanan_darah_diastolik: data.tekanan_darah_diastolik,
      hemoglobin: data.hemoglobin,
      berat_badan: data.berat_badan,
      mood: data.mood,
      energi: data.energi,
      tanggal_pemeriksaan: data.tanggal_pemeriksaan,
      catatan: data.catatan || "",
      usia_kehamilan: data.usia_kehamilan || 0,
      postpartum_minggu: data.postpartum_minggu || 0,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Data kesehatan berhasil disimpan",
        data: healthData,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in self-input health data route:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menyimpan data kesehatan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}







