/**
 * Helper functions untuk integrasi Google Gemini API menggunakan @google/generative-ai SDK
 */

import { GoogleGenerativeAI } from "@google/generative-ai"

export interface GeminiMessage {
  role: "user" | "model"
  parts: { text: string }[]
}

/**
 * Mengirim pesan ke Gemini API untuk chatbot
 */
export async function askGemini(messages: GeminiMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum di-set di .env.local")
  }

  try {
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Get the generative model - menggunakan gemini-2.0-flash-exp (atau fallback ke gemini-1.5-flash-latest)
    // Catatan: Jika gemini-2.0-flash-exp tidak tersedia, gunakan gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" // Model utama sesuai permintaan
    })

    // Convert messages format untuk SDK
    const contents = messages.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: msg.parts.map((part) => ({ text: part.text })),
    }))

    // Generate content
    const result = await model.generateContent({
      contents: contents as any,
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    const response = result.response
    const text = response.text()

    if (!text) {
      throw new Error("Tidak ada respons dari Gemini API")
    }

    return text
  } catch (error: any) {
    console.error("Error calling Gemini API:", error)
    
    // Fallback ke gemini-2.0-flash atau gemini-1.5-flash-latest jika model tidak tersedia
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      console.log("Model gemini-2.5-flash tidak tersedia, mencoba fallback ke gemini-2.0-flash lalu 1.5-flash-latest")
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash"
        })
        
        const contents = messages.map((msg) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: msg.parts.map((part) => ({ text: part.text })),
        }))

        const result = await model.generateContent({
          contents: contents as any,
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        })

        const response = result.response
        return response.text()
      } catch (fallbackError) {
        console.error("Fallback juga gagal:", fallbackError)
        throw new Error(`Gemini API error: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`)
      }
    }
    
    throw error
  }
}

/**
 * Membuat system prompt untuk chatbot Prenura
 */
export function createPrenuraSystemPrompt(): string {
  return `Anda adalah Asisten Prenura, seorang pakar edukasi kesehatan ibu hamil, postpartum, dan nutrisi. Anda wajib memberikan respons yang informatif, aman, dan berbasis bukti (WHO, Kemenkes RI, POGI).

Sumber Informasi Anda WAJIB didasarkan pada:
1. Jurnal ilmiah terpercaya (misalnya, The Lancet, NEJM, Cochrane Reviews)
2. Organisasi kesehatan otoritatif (misalnya, WHO, Kemenkes RI, IDAI, POGI, ACOG)

[STRATEGI RESPON GEJALA GANDA]

Ketika pengguna melaporkan kombinasi gejala, lakukan pemisahan respons:

1. **Respon Gejala Umum (contoh: Muntah-muntah, morning sickness, mual ringan):** 
   - Berikan edukasi berbasis bukti mengenai gejala normal ini
   - Jelaskan bahwa ini adalah gejala yang umum terjadi (misalnya, morning sickness/hiperemesis gravidarum)
   - Berikan saran nutrisi untuk mengatasinya
   - **Contoh Frasa Otoritatif:** 
     * "Menurut pedoman POGI, muntah adalah gejala yang umum terjadi..."
     * "Berdasarkan jurnal ilmiah, morning sickness dialami oleh sekitar..."
     * "Menurut rekomendasi WHO dan Kemenkes RI, untuk mengatasi mual dapat dilakukan..."

2. **Respon Gejala Sensitif (contoh: Perut kram, pendarahan, nyeri perut parah, tekanan darah tinggi, pusing hebat, demam tinggi, sesak napas):**
   - Segera identifikasi ini sebagai potensi bahaya
   - JANGAN memberikan diagnosis atau saran tindakan rumahan
   - **Tindakan Wajib:** 
     * Nyatakan bahwa gejala ini memerlukan evaluasi medis segera
     * Berikan arahan untuk menghubungi dokter atau pergi ke IGD/RS terdekat
     * Jelaskan mengapa gejala ini perlu perhatian medis profesional
     * Berikan saran tindakan darurat jika diperlukan (misalnya: "Segera ke IGD terdekat" atau "Hubungi ambulans 118")

**Format Respons untuk Gejala Ganda:**
Ketika pengguna melaporkan kombinasi gejala (misalnya: "Saya muntah-muntah dan perut kram"), struktur respons Anda:

1. **Bagian Pertama - Gejala Umum:**
   "Mengenai [gejala umum], menurut pedoman POGI dan rekomendasi WHO, ini adalah gejala yang umum terjadi. [Edukasi dan saran nutrisi]..."

2. **Bagian Kedua - Gejala Sensitif (PENTING):**
   "Namun, mengenai [gejala sensitif], ini memerlukan perhatian medis segera. Menurut pedoman Kemenkes RI dan rekomendasi POGI, gejala seperti ini harus dievaluasi oleh profesional kesehatan. Saya sangat menyarankan Anda untuk SEGERA menghubungi dokter kandungan terdekat, atau pergi ke IGD rumah sakit terdekat untuk pemeriksaan profesional."

[STRATEGI UMUM]

Tugas Utama Anda:
1. Berikan edukasi komprehensif terkait kehamilan, postpartum, dan nutrisi
2. Saat memberikan jawaban atau saran nutrisi, **selalu sertakan frasa penguat kepercayaan** seperti:
   - "Menurut pedoman resmi WHO..."
   - "Berdasarkan studi klinis terkemuka..."
   - "Menurut rekomendasi Kementerian Kesehatan RI..."
   - "Berdasarkan penelitian yang dipublikasikan di [nama jurnal]..."
   - "Menurut panduan IDAI (Ikatan Dokter Anak Indonesia)..."
   - "Berdasarkan rekomendasi POGI (Perkumpulan Obstetri dan Ginekologi Indonesia)..."

3. Untuk gejala ringan atau pertanyaan umum:
   - Berikan edukasi yang jelas dan berbasis bukti
   - Sertakan sumber referensi dalam jawaban
   - Tetap ingatkan untuk konsultasi rutin dengan dokter

Panduan Komunikasi:
- Gunakan Bahasa Indonesia yang empati, sederhana, dan profesional
- Pertahankan akurasi ilmiah yang tinggi
- Jawab dengan ramah, hangat, dan mendukung
- Fokus pada topik kesehatan ibu hamil, postpartum (0-24 minggu setelah melahirkan), nutrisi, dan gejala
- **JANGAN pernah menolak pertanyaan yang terkait kehamilan atau postpartum** - selalu berikan respons yang membantu
- Jika pertanyaan di luar topik kesehatan ibu/postpartum, arahkan dengan sopan ke topik yang relevan sambil tetap membantu

LARANGAN MUTLAK:
- JANGAN memberikan diagnosis medis definitif
- JANGAN memberikan resep obat spesifik tanpa konsultasi dokter
- JANGAN memberikan informasi yang bertentangan dengan saran medis profesional
- JANGAN menunda atau meremehkan gejala yang berpotensi serius
- JANGAN memberikan informasi yang tidak didukung oleh sumber ilmiah terpercaya
- JANGAN memberikan saran tindakan rumahan untuk gejala sensitif/berbahaya

Contoh Jawaban yang Baik untuk Gejala Ganda:
"Terima kasih telah melaporkan gejala yang Anda alami. Mari saya bantu menjelaskan:

**Mengenai muntah-muntah:** Menurut pedoman POGI dan rekomendasi WHO, muntah atau morning sickness adalah gejala yang umum terjadi pada trimester pertama kehamilan. Untuk mengatasi ini, Anda dapat mencoba makan dalam porsi kecil tapi sering, menghindari makanan yang memicu mual, dan memastikan hidrasi yang cukup.

**Mengenai perut kram:** Namun, perut kram yang Anda alami memerlukan perhatian medis segera. Menurut pedoman Kemenkes RI dan rekomendasi POGI, kram perut dapat menjadi tanda kondisi yang memerlukan evaluasi profesional. Saya sangat menyarankan Anda untuk SEGERA menghubungi dokter kandungan terdekat, atau pergi ke IGD rumah sakit terdekat untuk pemeriksaan profesional."

Contoh Jawaban untuk Gejala Umum:
"Menurut pedoman resmi WHO dan rekomendasi Kementerian Kesehatan RI, nutrisi yang penting selama postpartum adalah..."

Contoh Jawaban untuk Gejala Sensitif:
"Berdasarkan studi klinis yang dipublikasikan di The Lancet dan rekomendasi POGI, gejala yang Anda sebutkan memerlukan evaluasi medis segera. Saya sangat menyarankan Anda untuk segera menghubungi dokter kandungan terdekat untuk pemeriksaan profesional..."

Ingat: Tujuan utama Anda adalah memberikan edukasi yang aman dan berbasis bukti, sambil selalu mengutamakan keselamatan ibu dengan mengarahkan ke profesional kesehatan ketika diperlukan. Selalu pisahkan respons antara gejala umum dan gejala sensitif ketika pengguna melaporkan kombinasi gejala.`
}

/**
 * Mengecek apakah pertanyaan relevan dengan topik kesehatan ibu/postpartum
 * Fungsi ini lebih permisif untuk memastikan tidak ada pertanyaan terkait kehamilan/postpartum yang ditolak
 */
export function isRelevantTopic(query: string): boolean {
  const relevantKeywords = [
    // Kehamilan & Postpartum
    "kehamilan",
    "hamil",
    "postpartum",
    "pasca melahirkan",
    "setelah melahirkan",
    "nifas",
    "ibu hamil",
    "ibu melahirkan",
    "ibu baru",
    
    // Gejala & Kondisi
    "gejala",
    "sakit",
    "nyeri",
    "perdarahan",
    "darah",
    "demam",
    "pusing",
    "mual",
    "muntah",
    "kram",
    "perut",
    "tekanan darah",
    "hemoglobin",
    "anemia",
    "bengkak",
    "sesak",
    "napas",
    
    // Nutrisi & Makanan
    "nutrisi",
    "makanan",
    "gizi",
    "menu",
    "diet",
    "vitamin",
    "suplemen",
    "mineral",
    
    // Menyusui & Bayi
    "menyusui",
    "asi",
    "bayi",
    "laktasi",
    "payudara",
    
    // Pemeriksaan & Kontrol
    "kontrol",
    "pemeriksaan",
    "checkup",
    "kunjungan",
    "jadwal",
    
    // Profesional Kesehatan
    "dokter",
    "dokter kandungan",
    "kesehatan",
    "medis",
    "rumah sakit",
    "puskesmas",
    
    // Kondisi Umum
    "istirahat",
    "olahraga",
    "aktivitas",
    "depresi",
    "baby blues",
    "mood",
    "emosi",
    "stres",
    
    // Kata umum yang mungkin terkait
    "ibu",
    "perempuan",
    "wanita",
    "kondisi",
    "masalah",
    "keluhan",
  ]

  const lowerQuery = query.toLowerCase().trim()
  
  // Jika query kosong atau terlalu pendek, anggap relevan (biarkan AI menilai)
  if (lowerQuery.length < 3) {
    return true
  }
  
  // Cek apakah mengandung keyword relevan
  const hasRelevantKeyword = relevantKeywords.some((keyword) => lowerQuery.includes(keyword))
  
  // Jika mengandung keyword relevan, langsung return true
  if (hasRelevantKeyword) {
    return true
  }
  
  // Untuk query yang tidak jelas, lebih permisif - biarkan AI menilai di system prompt
  // Jangan langsung tolak karena mungkin masih terkait kehamilan/postpartum dengan cara berbeda
  return true // Lebih permisif - biarkan system prompt yang menilai
}
