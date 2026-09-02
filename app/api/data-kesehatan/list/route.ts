import { NextRequest, NextResponse } from "next/server"
import { getHealthDataByIbuHamilId } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ibuHamilId = searchParams.get("ibu_hamil_id")

    if (!ibuHamilId) {
      return NextResponse.json({ error: "ibu_hamil_id is required" }, { status: 400 })
    }

    // Get health data
    const healthDataList = await getHealthDataByIbuHamilId(ibuHamilId)

    return NextResponse.json(
      {
        success: true,
        data: healthDataList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching health data:", error)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat mengambil data kesehatan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}







