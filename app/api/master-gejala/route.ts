import { NextRequest, NextResponse } from "next/server"

// Master data gejala dari jurnal terpercaya
// In production, this should come from database
const MASTER_GEJALA = [
  // Gejala Umum
  { id: "gejala-001", nama_gejala: "Sakit Kepala", kategori: "Umum", tingkat_bahaya: "Ringan" },
  { id: "gejala-002", nama_gejala: "Kram Ringan", kategori: "Umum", tingkat_bahaya: "Ringan" },
  { id: "gejala-003", nama_gejala: "Mual Berlebihan", kategori: "Umum", tingkat_bahaya: "Sedang" },
  { id: "gejala-004", nama_gejala: "Pusing", kategori: "Umum", tingkat_bahaya: "Sedang" },
  { id: "gejala-005", nama_gejala: "Bengkak Kaki", kategori: "Umum", tingkat_bahaya: "Sedang" },
  { id: "gejala-006", nama_gejala: "Nyeri Punggung", kategori: "Umum", tingkat_bahaya: "Ringan" },
  { id: "gejala-007", nama_gejala: "Kelelahan", kategori: "Umum", tingkat_bahaya: "Ringan" },
  
  // Gejala Sensitif/Berbahaya
  { id: "gejala-008", nama_gejala: "Perdarahan Ringan", kategori: "Sensitif", tingkat_bahaya: "Sedang" },
  { id: "gejala-009", nama_gejala: "Perdarahan Berlebihan", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-010", nama_gejala: "Tekanan Darah Tinggi", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-011", nama_gejala: "Demam", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-012", nama_gejala: "Sesak Napas", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-013", nama_gejala: "Nyeri Perut Parah", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-014", nama_gejala: "Penglihatan Kabur", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-015", nama_gejala: "Nyeri Dada", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-016", nama_gejala: "Kejang", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-017", nama_gejala: "Tanda Infeksi Luka", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-018", nama_gejala: "Tidak Bisa Buang Air Kecil", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-019", nama_gejala: "Nyeri Kepala Hebat", kategori: "Sensitif", tingkat_bahaya: "Berat" },
  { id: "gejala-020", nama_gejala: "Muntah Berlebihan", kategori: "Sensitif", tingkat_bahaya: "Sedang" },
]

// GET: Get all available gejala
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        gejala: MASTER_GEJALA,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in master-gejala route:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat mengambil daftar gejala",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST: Validate gejala IDs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gejala_ids } = body

    if (!gejala_ids || !Array.isArray(gejala_ids)) {
      return NextResponse.json({ error: "gejala_ids harus berupa array" }, { status: 400 })
    }

    // Validate that all gejala_ids exist
    const validIds = MASTER_GEJALA.map((g) => g.id)
    const invalidIds = gejala_ids.filter((id: string) => !validIds.includes(id))

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          error: "Beberapa gejala tidak valid",
          invalid_ids: invalidIds,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Semua gejala valid",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error validating gejala:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat validasi gejala",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}









