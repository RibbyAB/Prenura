import { assessRiskWithGemini, GeminiRiskResult } from "./geminiRiskService"
import { quickRiskCheck, QuickCheckInput, QuickCheckResult, RisikoLevel } from "./ruleBasedRiskService"

type Confidence = "high" | "medium" | "low"

function levelToScore(level: RisikoLevel) {
  switch (level) {
    case "RENDAH":
      return 1
    case "SEDANG":
      return 2
    case "TINGGI":
      return 3
    case "SANGAT_TINGGI":
      return 4
    default:
      return 1
  }
}

function pickHigherLevel(a: RisikoLevel, b: RisikoLevel): RisikoLevel {
  return levelToScore(a) >= levelToScore(b) ? a : b
}

export function validateResults(ruleResult: QuickCheckResult, aiResult: GeminiRiskResult) {
  const ruleLevelScore = levelToScore(ruleResult.risikoLevel)
  const aiLevelScore = levelToScore(aiResult.risikoLevel)

  let finalLevel: RisikoLevel = ruleResult.risikoLevel
  let confidence: Confidence = "medium"
  let note = "Konsisten"

  if (Math.abs(ruleLevelScore - aiLevelScore) >= 2) {
    finalLevel = pickHigherLevel(ruleResult.risikoLevel, aiResult.risikoLevel)
    confidence = "low"
    note = "Perbedaan besar antara rule-based dan AI, mengambil level lebih tinggi (konservatif)"
  } else if (ruleResult.risikoLevel !== aiResult.risikoLevel) {
    finalLevel = pickHigherLevel(ruleResult.risikoLevel, aiResult.risikoLevel)
    confidence = "medium"
    note = "Perbedaan minor, memilih level lebih tinggi"
  } else {
    finalLevel = ruleResult.risikoLevel
    confidence = "high"
    note = "Hasil konsisten antara rule-based dan AI"
  }

  return { finalLevel, confidence, note }
}

export async function assessRisk(userData: QuickCheckInput) {
  const quick = quickRiskCheck(userData)

  // Untuk kondisi darurat, langsung return tanpa AI
  if (quick.isDarurat) {
    return {
      method: "rule-based-urgent" as const,
      risikoLevel: "SANGAT_TINGGI" as RisikoLevel,
      result: quick,
      skipAI: true,
      reason: "Kondisi darurat memerlukan respons cepat",
      confidence: "high" as Confidence,
    }
  }

  // Selalu gunakan Gemini untuk analisis risiko yang lebih akurat
  // Gemini akan menganalisis kombinasi gejala, umur kehamilan/postpartum, dan data kesehatan
  try {
    const aiResult = await assessRiskWithGemini(userData, quick)
    if (aiResult) {
      // Gunakan hasil Gemini sebagai hasil utama
      return {
        method: "hybrid-ai" as const,
        risikoLevel: aiResult.risikoLevel, // Langsung gunakan hasil Gemini
        ruleBasedResult: quick,
        aiResult,
        confidence: "high" as Confidence,
        note: "Assessment menggunakan AI Gemini berdasarkan kombinasi gejala, umur kehamilan/postpartum, dan data kesehatan",
        skipAI: false,
      }
    }
  } catch (error) {
    console.error("[HybridRisk] AI failed:", error)
  }

  // Fallback hanya jika AI benar-benar tidak tersedia
  return {
    method: "rule-based-fallback" as const,
    risikoLevel: quick.risikoLevel,
    result: quick,
    confidence: "medium" as Confidence,
    skipAI: true,
    note: "Assessment menggunakan metode standar (AI unavailable)",
  }
}







