"use server"

import { RisikoLevel, QuickCheckResult, QuickCheckInput } from "./ruleBasedRiskService"

type GeminiFactor = { kategori: string; deskripsi: string; tingkatBahaya: RisikoLevel }
type GeminiRecommendation = {
  prioritas: "URGENT" | "TINGGI" | "SEDANG"
  kategori: "Nutrisi" | "Kontrol" | "Darurat" | "Monitoring" | "Aktivitas"
  tindakan: string
  alasan: string
}

export interface GeminiRiskResult {
  risikoLevel: RisikoLevel
  skorPoin: number
  faktorRisiko: GeminiFactor[]
  penjelasan: string
  rekomendasi: GeminiRecommendation[]
  peringatanDarurat: boolean
  pesanDarurat: string | null
}

const stripBackticks = (text: string) => text.replace(/```[a-zA-Z]*\n?/, "").replace(/```$/, "")

function buildPrompt(userData: QuickCheckInput, quick: QuickCheckResult) {
  const systolic = userData.tekanan_darah?.systolic ?? 0
  const diastolic = userData.tekanan_darah?.diastolic ?? 0
  const gejalaList = (userData.gejala || []).join(", ") || "Tidak ada"
  const usiaKehamilan = userData.usia_kehamilan ?? 0
  const postpartumMinggu = userData.postpartum_minggu ?? 0
  const status = usiaKehamilan > 0 ? "Hamil" : postpartumMinggu > 0 ? "Postpartum" : "Tidak diketahui"

  return `
Analisis data kesehatan ibu ${status.toLowerCase()}:

STATUS:
- Status: ${status}
${usiaKehamilan > 0 ? `- Usia Kehamilan: ${usiaKehamilan} minggu` : ""}
${postpartumMinggu > 0 ? `- Minggu Postpartum: ${postpartumMinggu} minggu` : ""}

DATA KESEHATAN:
- Tekanan Darah: ${systolic}/${diastolic} mmHg
- Hemoglobin: ${userData.hemoglobin ?? "-"} g/dL
- Berat Badan: ${userData.berat_badan ?? "-"} kg
- Mood & Energi: ${userData.mood_energi ?? "-"}

GEJALA YANG DILAPORKAN:
${gejalaList}

LOKASI:
- Jarak ke Faskes: ${userData.jarak_faskes ?? "-"} km

KONTEKS TAMBAHAN:
- Quick check rule-based menunjukkan skor ${quick.skorPoin} poin (kategori: ${quick.risikoLevel})

PENTING: Analisis risiko dengan mempertimbangkan KOMBINASI dari:
1. Gejala yang dilaporkan (prioritas tinggi)
2. Umur kehamilan/postpartum (faktor risiko berbeda untuk setiap fase)
3. Data kesehatan (tekanan darah, hemoglobin, berat badan, mood & energi)
4. Interaksi antar faktor (contoh: gejala berat + usia kehamilan/postpartum tertentu = risiko lebih tinggi)

Berikan assessment risiko dengan mempertimbangkan KOMBINASI faktor dan interaksi antar parameter. Response JSON only.`
}

export async function assessRiskWithGemini(
  userData: QuickCheckInput,
  quick: QuickCheckResult
): Promise<GeminiRiskResult | null> {
  if (process.env.ENABLE_AI_ASSESSMENT === "false") return null
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT || 10000)
  if (!apiKey) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: buildPrompt(userData, quick),
          },
        ],
      },
    ],
    system_instruction: {
      role: "system",
      parts: [
        {
          text: `Kamu adalah AI asisten kesehatan ibu hamil dan postpartum ahli risk assessment berdasarkan Kemenkes RI dan WHO.
Analisis data kesehatan dan tentukan tingkat risiko: RENDAH, SEDANG, TINGGI, atau SANGAT_TINGGI.

PANDUAN PENILAIAN (sebagai referensi, tapi analisis harus holistik):
- Tekanan Darah: Normal (90-120/60-80)=0, Hipotensi (<90/<60)=+2, Hipertensi (140-159/90-99)=+3, Berat (≥160/≥100)=+5
- Hemoglobin: Normal (≥11)=0, Anemia ringan (10-10.9)=+1, Sedang (8-9.9)=+2, Berat (<8)=+4
- Berat Badan: Normal (45-70)=0, Underweight (40-44)=+2, Sangat underweight (<40)=+3
- Mood & Energi: Baik=0, Sedang=+1, Buruk=+2
- Gejala (PRIORITAS TINGGI): Pendarahan/perdarahan=+5, Sesak napas=+5, Sakit kepala berat=+4, Bengkak wajah/tangan=+3, Bengkak kaki=+2, Pusing=+1, Demam tinggi=+3, Nyeri perut parah=+4
- Jarak Faskes: <5km=0, 5-10km=+1, >10km=+2
- Usia Kehamilan: Trimester 1 (0-12 minggu)=+1, Trimester 3 (28-42 minggu)=+1
- Postpartum: 0-2 minggu=+2, 3-6 minggu=+1

KATEGORI: 0-3=RENDAH, 4-7=SEDANG, 8-11=TINGGI, ≥12=SANGAT_TINGGI

PENTING: 
1. Analisis KOMBINASI faktor, bukan hanya jumlah. Contoh: Gejala pendarahan + postpartum 1 minggu + HB rendah = SANGAT_TINGGI
2. Gejala yang dilaporkan adalah faktor UTAMA - jika ada gejala berat, risiko harus ditingkatkan
3. Pertimbangkan fase kehamilan/postpartum - risiko berbeda untuk setiap fase
4. Kombinasi gejala + data kesehatan + fase = analisis holistik

RESPONSE FORMAT (JSON ONLY, NO MARKDOWN):
{
  "risikoLevel": "RENDAH|SEDANG|TINGGI|SANGAT_TINGGI",
  "skorPoin": <number>,
  "faktorRisiko": [{"kategori": "string", "deskripsi": "string", "tingkatBahaya": "RENDAH|SEDANG|TINGGI|SANGAT_TINGGI"}],
  "penjelasan": "2-3 kalimat kenapa risiko ini, fokus pada kombinasi faktor",
  "rekomendasi": [{"prioritas": "URGENT|TINGGI|SEDANG", "kategori": "Nutrisi|Kontrol|Darurat|Monitoring|Aktivitas", "tindakan": "string konkret", "alasan": "string"}],
  "peringatanDarurat": boolean,
  "pesanDarurat": "string atau null"
}`,
        },
      ],
    },
  }

  const run = async () => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    )
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
    if (!text) throw new Error("Gemini response empty")
    const clean = stripBackticks(text).trim()
    const parsed = JSON.parse(clean) as GeminiRiskResult
    return parsed
  }

  try {
    const result = await run()
    return result
  } catch (err) {
    // retry once
    try {
      const result = await run()
      return result
    } catch (error) {
      console.error("[GeminiRisk] failed:", error)
      return null
    }
  } finally {
    clearTimeout(timer)
  }
}





