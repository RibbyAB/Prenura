import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assessRisk } from "@/services/hybridRiskService"
import { addRiskAssessment } from "@/lib/storage"

const inputSchema = z.object({
  user_id: z.string().min(1, "user_id wajib diisi"),
  tekanan_darah: z
    .object({
      systolic: z.number().min(0),
      diastolic: z.number().min(0),
    })
    .optional(),
  hemoglobin: z.number().min(0).optional(),
  berat_badan: z.number().min(0).optional(),
  mood_energi: z.enum(["Baik", "Sedang", "Buruk"]).optional(),
  gejala: z.array(z.string()).optional(),
  jarak_faskes: z.number().min(0).optional(),
  usia_kehamilan: z.number().min(0).optional(),
  postpartum_minggu: z.number().min(0).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validasi gagal", details: parsed.error.errors }, { status: 400 })
    }

    const data = parsed.data

    const result = await assessRisk({
      tekanan_darah: data.tekanan_darah,
      hemoglobin: data.hemoglobin,
      berat_badan: data.berat_badan,
      mood_energi: data.mood_energi,
      gejala: data.gejala,
      jarak_faskes: data.jarak_faskes,
      usia_kehamilan: data.usia_kehamilan,
      postpartum_minggu: data.postpartum_minggu,
    })

    // Simpan ke persistent storage
    const saved = await addRiskAssessment({
      user_id: data.user_id,
      method: result.method,
      risiko_level: result.risikoLevel,
      skor_poin:
        result.result?.skorPoin ??
        result.ruleBasedResult?.skorPoin ??
        result.aiResult?.skorPoin ??
        (typeof result.result?.skorPoin === "number" ? result.result.skorPoin : 0),
      faktor_risiko:
        result.result?.faktorRisiko ||
        result.ruleBasedResult?.faktorRisiko ||
        result.aiResult?.faktorRisiko ||
        [],
      penjelasan: result.aiResult?.penjelasan || null,
      rekomendasi: result.aiResult?.rekomendasi || [],
      peringatan_darurat: result.aiResult?.peringatanDarurat || result.result?.isDarurat || false,
      pesan_darurat: result.aiResult?.pesanDarurat || null,
      confidence: result.confidence || "medium",
      input_data: data,
      rule_based_result: result.result || result.ruleBasedResult || null,
      ai_result: result.aiResult || null,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: saved.id,
          method: saved.method,
          risikoLevel: saved.risiko_level,
          skorPoin: saved.skor_poin,
          faktorRisiko: saved.faktor_risiko,
          penjelasan: saved.penjelasan,
          rekomendasi: saved.rekomendasi,
          peringatanDarurat: saved.peringatan_darurat,
          pesanDarurat: saved.pesan_darurat,
          confidence: saved.confidence,
          timestamp: saved.created_at,
          skipAI: result.skipAI,
          note: (result as any).note,
          reason: (result as any).reason,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[RiskAssessment] Error:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat melakukan risk assessment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}







