import { NextRequest, NextResponse } from "next/server"
import { askGemini, type GeminiMessage } from "@/lib/gemini"

// export const runtime = "edge" // Disabled untuk kompatibilitas environment variables

interface NutritionInput {
  kondisiKesehatan?: string
  defisiensiNutrisi?: string[]
  preferensiMakanan?: string[]
  ketersediaanLokal?: string[]
  mingguPostpartum?: number
  menyusui?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: NutritionInput = await request.json()

    const prompt = `Sebagai ahli nutrisi untuk ibu postpartum di Indonesia, berikan rekomendasi nutrisi yang personal dan praktis.

Data Ibu:
- ${body.mingguPostpartum ? `Minggu postpartum: ${body.mingguPostpartum}` : "Minggu postpartum: Tidak tersedia"}
- ${body.menyusui !== undefined ? `Status menyusui: ${body.menyusui ? "Ya" : "Tidak"}` : "Status menyusui: Tidak tersedia"}
- ${body.kondisiKesehatan ? `Kondisi kesehatan: ${body.kondisiKesehatan}` : "Kondisi kesehatan: Baik"}
- ${body.defisiensiNutrisi && body.defisiensiNutrisi.length > 0 ? `Defisiensi nutrisi: ${body.defisiensiNutrisi.join(", ")}` : "Defisiensi: Tidak ada"}
- ${body.preferensiMakanan && body.preferensiMakanan.length > 0 ? `Preferensi makanan: ${body.preferensiMakanan.join(", ")}` : "Preferensi: Tidak tersedia"}
- ${body.ketersediaanLokal && body.ketersediaanLokal.length > 0 ? `Makanan lokal tersedia: ${body.ketersediaanLokal.join(", ")}` : "Makanan lokal: Umum di Indonesia"}

Berikan respons dalam format JSON berikut:
{
  "dailyMealPlan": {
    "sarapan": {
      "menu": "nama menu",
      "nutrisi": ["nutrisi utama"],
      "porsi": "deskripsi porsi"
    },
    "makanSiang": {
      "menu": "nama menu",
      "nutrisi": ["nutrisi utama"],
      "porsi": "deskripsi porsi"
    },
    "makanMalam": {
      "menu": "nama menu",
      "nutrisi": ["nutrisi utama"],
      "porsi": "deskripsi porsi"
    },
    "camilan": ["camilan 1", "camilan 2"]
  },
  "shoppingList": ["bahan 1", "bahan 2"],
  "keyNutrients": [
    {
      "nutrient": "nama nutrisi",
      "importance": "mengapa penting",
      "sources": ["sumber 1", "sumber 2"]
    }
  ],
  "tips": ["tip 1", "tip 2"],
  "avoid": ["hindari 1", "hindari 2"]
}

Fokus pada:
- Makanan lokal Indonesia yang mudah didapat
- Nutrisi untuk pemulihan postpartum
- Meningkatkan produksi ASI jika menyusui
- Mengatasi defisiensi nutrisi yang ada
- Makanan yang mudah dimasak dan praktis`

    const messages: GeminiMessage[] = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ]

    const response = await askGemini(messages)

    // Parse JSON dari response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed, { status: 200 })
      } else {
        // Fallback
        return NextResponse.json(
          {
            dailyMealPlan: {
              sarapan: {
                menu: "Nasi goreng dengan telur dan sayuran",
                nutrisi: ["Protein", "Karbohidrat", "Serat"],
                porsi: "1 piring sedang",
              },
              makanSiang: {
                menu: "Sayur bening bayam dengan ikan goreng",
                nutrisi: ["Protein", "Zat besi", "Vitamin"],
                porsi: "1 piring lengkap",
              },
              makanMalam: {
                menu: "Sup ayam dengan sayuran",
                nutrisi: ["Protein", "Vitamin", "Mineral"],
                porsi: "1 mangkuk sedang",
              },
              camilan: ["Buah pisang", "Kacang rebus"],
            },
            shoppingList: ["Beras", "Telur", "Ikan", "Sayuran hijau", "Buah"],
            keyNutrients: [
              {
                nutrient: "Protein",
                importance: "Untuk pemulihan jaringan dan produksi ASI",
                sources: ["Ikan", "Ayam", "Telur", "Tempe", "Tahu"],
              },
            ],
            tips: ["Makan dalam porsi kecil tapi sering", "Minum air putih cukup"],
            avoid: ["Makanan pedas berlebihan", "Makanan mentah"],
          },
          { status: 200 }
        )
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Tidak dapat memproses rekomendasi nutrisi",
          rawResponse: response,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error in nutrition route:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memproses rekomendasi nutrisi",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

