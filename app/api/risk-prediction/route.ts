import { NextRequest, NextResponse } from "next/server"
import { askGemini, type GeminiMessage } from "@/lib/gemini"

// export const runtime = "edge" // Disabled untuk kompatibilitas environment variables

interface RiskPredictionInput {
  usiaKehamilan?: number
  tekananDarah?: string
  kadarHemoglobin?: number
  riwayatKehamilan?: string
  jarakFasilitas?: number
  gejalaAwal?: string[]
  usiaIbu?: number
  mingguPostpartum?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: RiskPredictionInput = await request.json()

    // Validasi input
    if (!body.mingguPostpartum && !body.usiaKehamilan) {
      return NextResponse.json({ error: "Minggu postpartum atau usia kehamilan diperlukan" }, { status: 400 })
    }

    // Buat prompt untuk prediksi risiko
    const prompt = `Sebagai ahli kesehatan ibu postpartum, analisis data berikut dan berikan prediksi risiko komplikasi postpartum:

Data Ibu:
- ${body.mingguPostpartum ? `Minggu postpartum: ${body.mingguPostpartum}` : `Usia kehamilan: ${body.usiaKehamilan} minggu`}
- ${body.tekananDarah ? `Tekanan darah: ${body.tekananDarah}` : "Tekanan darah: Tidak tersedia"}
- ${body.kadarHemoglobin ? `Kadar hemoglobin: ${body.kadarHemoglobin} g/dL` : "Kadar hemoglobin: Tidak tersedia"}
- ${body.riwayatKehamilan ? `Riwayat kehamilan: ${body.riwayatKehamilan}` : "Riwayat kehamilan: Tidak tersedia"}
- ${body.jarakFasilitas ? `Jarak ke fasilitas kesehatan: ${body.jarakFasilitas} km` : "Jarak ke fasilitas: Tidak tersedia"}
- ${body.gejalaAwal && body.gejalaAwal.length > 0 ? `Gejala yang dialami: ${body.gejalaAwal.join(", ")}` : "Gejala: Tidak ada"}
- ${body.usiaIbu ? `Usia ibu: ${body.usiaIbu} tahun` : "Usia ibu: Tidak tersedia"}

Berikan respons dalam format JSON berikut:
{
  "riskLevel": "Rendah" | "Sedang" | "Tinggi",
  "riskScore": 0-100,
  "factors": ["faktor risiko 1", "faktor risiko 2"],
  "recommendations": ["rekomendasi 1", "rekomendasi 2"],
  "urgency": "Rutin" | "Segera" | "Darurat",
  "nextCheckup": "Jumlah hari dari sekarang untuk kontrol berikutnya"
}

Fokus pada risiko komplikasi postpartum seperti:
- Perdarahan sekunder
- Infeksi postpartum
- Hipertensi postpartum
- Depresi postpartum
- Masalah laktasi
- Komplikasi luka persalinan`

    const messages: GeminiMessage[] = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ]

    const response = await askGemini(messages)

    // Parse JSON dari response
    try {
      // Cari JSON dalam response (kadang Gemini menambahkan teks di luar JSON)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed, { status: 200 })
      } else {
        // Fallback jika tidak ada JSON
        return NextResponse.json(
          {
            riskLevel: "Sedang",
            riskScore: 50,
            factors: ["Data tidak lengkap"],
            recommendations: ["Lengkapi data kesehatan untuk prediksi yang lebih akurat"],
            urgency: "Rutin",
            nextCheckup: 7,
          },
          { status: 200 }
        )
      }
    } catch (parseError) {
      // Fallback jika parsing gagal
      return NextResponse.json(
        {
          riskLevel: "Sedang",
          riskScore: 50,
          factors: ["Tidak dapat menganalisis data"],
          recommendations: ["Konsultasikan dengan dokter atau fasilitas kesehatan"],
          urgency: "Rutin",
          nextCheckup: 7,
          rawResponse: response,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error in risk prediction route:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memproses prediksi risiko",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

