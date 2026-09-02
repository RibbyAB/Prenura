import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

export async function GET(request: NextRequest) {
  try {
    // Read users file directly
    let users: any[] = []
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8")
      if (data && data.trim() !== "") {
        users = JSON.parse(data)
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // File doesn't exist yet
        return NextResponse.json(
          {
            success: true,
            data: [],
            message: "Belum ada user yang terdaftar",
          },
          { status: 200 }
        )
      }
      throw error
    }

    // Remove password from response for security
    const usersWithoutPassword = users.map(({ password, ...user }) => ({
      ...user,
      password: "***hidden***", // Show that password exists but hidden
    }))

    return NextResponse.json(
      {
        success: true,
        data: usersWithoutPassword,
        count: usersWithoutPassword.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat mengambil data user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

