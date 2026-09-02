export type MoodStatus = "Baik" | "Sedang" | "Buruk"

export type RisikoLevel = "RENDAH" | "SEDANG" | "TINGGI" | "SANGAT_TINGGI"

export interface QuickCheckInput {
  tekanan_darah?: { systolic?: number; diastolic?: number }
  hemoglobin?: number
  berat_badan?: number
  mood_energi?: MoodStatus
  gejala?: string[]
  jarak_faskes?: number
  usia_kehamilan?: number // minggu; 0 jika postpartum
  postpartum_minggu?: number // opsional; jika ada, gunakan untuk rule postpartum
}

export interface QuickCheckResult {
  skorPoin: number
  risikoLevel: RisikoLevel
  isDarurat: boolean
  isNormal: boolean
  faktorRisiko: string[]
  shouldUseAI: boolean
}

const gejalaMatch = (gejala: string[] = [], keywords: string[]) => {
  const lower = gejala.map((g) => g.toLowerCase())
  return keywords.some((kw) => lower.some((g) => g.includes(kw)))
}

export function quickRiskCheck(userData: QuickCheckInput): QuickCheckResult {
  let score = 0
  const factors: string[] = []
  let isDarurat = false

  const sys = userData.tekanan_darah?.systolic ?? 0
  const dia = userData.tekanan_darah?.diastolic ?? 0

  // Tekanan darah
  if (sys >= 160 || dia >= 100) {
    score += 5
    isDarurat = true
    factors.push("Tekanan darah sangat tinggi (≥160/100)")
  } else if (sys >= 140 || dia >= 90) {
    score += 3
    factors.push("Tekanan darah tinggi (140-159 / 90-99)")
  } else if (sys < 90 || dia < 60) {
    score += 2
    factors.push("Hipotensi (<90/<60)")
  }

  // Hemoglobin
  const hb = userData.hemoglobin ?? 0
  if (hb < 7) {
    score += 5
    isDarurat = true
    factors.push("Hemoglobin <7 g/dL (darurat)")
  } else if (hb < 8) {
    score += 4
    factors.push("Hemoglobin 7-7.9 g/dL")
  } else if (hb < 10) {
    score += 2
    factors.push("Hemoglobin 8-9.9 g/dL")
  } else if (hb < 11) {
    score += 1
    factors.push("Hemoglobin 10-10.9 g/dL")
  }

  // Berat badan
  const bb = userData.berat_badan ?? 0
  if (bb < 40 && bb > 0) {
    score += 3
    factors.push("Berat badan <40 kg")
  } else if (bb >= 40 && bb < 45) {
    score += 2
    factors.push("Berat badan 40-44 kg")
  } else if (bb > 90) {
    score += 2
    factors.push("Berat badan >90 kg")
  }

  // Mood & energi
  if (userData.mood_energi === "Buruk") {
    score += 2
    factors.push("Mood & energi buruk")
  } else if (userData.mood_energi === "Sedang") {
    score += 1
    factors.push("Mood & energi sedang")
  }

  const gejalaList = userData.gejala || []

  // Gejala darurat
  if (gejalaMatch(gejalaList, ["pendarahan", "perdarahan"])) {
    score += 5
    isDarurat = true
    factors.push("Pendarahan/perdarahan (darurat)")
  }
  if (gejalaMatch(gejalaList, ["sesak"])) {
    score += 5
    isDarurat = true
    factors.push("Sesak napas berat (darurat)")
  }
  if (gejalaMatch(gejalaList, ["demam"]) && gejalaMatch(gejalaList, ["berat", "tinggi"])) {
    score += 3
    isDarurat = true
    factors.push("Demam tinggi dengan gejala berat")
  }
  // Gejala lainnya
  if (gejalaMatch(gejalaList, ["sakit kepala", "kepala berat"]) && gejalaMatch(gejalaList, ["kabur", "blur"])) {
    score += 4
    factors.push("Sakit kepala berat + pandangan kabur")
  }
  if (gejalaMatch(gejalaList, ["bengkak wajah", "bengkak tangan"])) {
    score += 3
    factors.push("Bengkak wajah/tangan")
  }
  if (gejalaMatch(gejalaList, ["bengkak kaki"])) {
    score += 2
    factors.push("Bengkak kaki")
  }
  if (gejalaMatch(gejalaList, ["demam"])) {
    score += 3
    factors.push("Demam tinggi")
  }
  if (gejalaMatch(gejalaList, ["pusing"])) {
    score += 1
    factors.push("Pusing ringan")
  }
  if (gejalaMatch(gejalaList, ["mual", "muntah"])) {
    score += 1
    factors.push("Mual/muntah")
  }

  // Jarak faskes
  const jarak = userData.jarak_faskes ?? 0
  if (jarak > 10) {
    score += 2
    factors.push("Jarak ke faskes >10 km")
  } else if (jarak >= 5) {
    score += 1
    factors.push("Jarak ke faskes 5-10 km")
  }

  // Usia kehamilan/postpartum
  const minggu = userData.usia_kehamilan ?? 0
  const postpartumMinggu = userData.postpartum_minggu ?? 0
  if (postpartumMinggu > 0 && postpartumMinggu <= 2) {
    score += 2
    factors.push("Postpartum 0-2 minggu")
  } else if (minggu <= 12 && minggu > 0) {
    score += 1
    factors.push("Trimester 1")
  } else if (minggu >= 28) {
    score += 1
    factors.push("Trimester 3")
  }

  let risikoLevel: RisikoLevel = "RENDAH"
  if (score >= 12) risikoLevel = "SANGAT_TINGGI"
  else if (score >= 8) risikoLevel = "TINGGI"
  else if (score >= 4) risikoLevel = "SEDANG"

  const isNormal = score === 0 && !isDarurat
  const shouldUseAI = !isDarurat && !isNormal

  return {
    skorPoin: score,
    risikoLevel,
    isDarurat,
    isNormal,
    faktorRisiko: factors,
    shouldUseAI,
  }
}







