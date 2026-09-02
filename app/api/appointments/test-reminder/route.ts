import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmail, formatDateIndonesian } from "@/lib/email"

// Schema validasi
const testReminderSchema = z.object({
  appointment_date: z.string().min(1, "Tanggal harus diisi"),
  appointment_time: z.string().min(1, "Waktu harus diisi"),
  location: z.string().min(1, "Lokasi harus diisi"),
  email: z.string().email("Format email tidak valid").min(1, "Email harus diisi"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validasi dengan Zod
    const validationResult = testReminderSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { appointment_date, appointment_time, location, email } = validationResult.data

    // Validasi tanggal tidak boleh masa lalu
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`)
    const now = new Date()

    if (appointmentDateTime < now) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal dan waktu tidak boleh di masa lalu",
        },
        { status: 400 }
      )
    }

    // Format tanggal ke Bahasa Indonesia
    const formattedDate = formatDateIndonesian(appointmentDateTime)

    // Format waktu (HH:MM)
    const timeString = appointment_time.slice(0, 5)

    // Template email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengingat Janji Temu - Prenura</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Pengingat Janji Temu</h1>
              <div style="display: inline-block; margin-top: 12px; padding: 6px 16px; background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; backdrop-filter: blur(10px);">
                <span style="color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">TEST EMAIL</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Halo,
              </p>
              <p style="margin: 0 0 32px; color: #374151; font-size: 16px; line-height: 1.6;">
                Ini adalah pengingat untuk janji temu kontrol kesehatan Anda.
              </p>

              <!-- Info Box -->
              <div style="background-color: #f9fafb; border-left: 4px solid #9333ea; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; background-color: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <span style="color: #9333ea; font-size: 20px;">📅</span>
                        </div>
                        <div>
                          <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Tanggal</div>
                          <div style="color: #111827; font-size: 16px; font-weight: 600;">${formattedDate}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; background-color: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <span style="color: #9333ea; font-size: 20px;">🕐</span>
                        </div>
                        <div>
                          <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Waktu</div>
                          <div style="color: #111827; font-size: 16px; font-weight: 600;">${timeString} WIB</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center;">
                        <div style="width: 40px; height: 40px; background-color: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <span style="color: #9333ea; font-size: 20px;">📍</span>
                        </div>
                        <div>
                          <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Lokasi</div>
                          <div style="color: #111827; font-size: 16px; font-weight: 600;">${location}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Catatan Penting -->
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <div style="display: flex; align-items: start;">
                  <div style="margin-right: 12px; color: #d97706; font-size: 20px;">⚠️</div>
                  <div>
                    <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Catatan Penting:</div>
                    <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                      <li>Pastikan Anda datang tepat waktu</li>
                      <li>Bawa dokumen yang diperlukan (KTP, kartu BPJS jika ada)</li>
                      <li>Jika ada perubahan jadwal, harap hubungi kami segera</li>
                      <li>Gunakan masker dan ikuti protokol kesehatan</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Jika Anda memiliki pertanyaan atau perlu mengubah jadwal, silakan hubungi kami.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                <strong style="color: #9333ea;">Prenura</strong> - Platform Kesehatan Ibu Hamil & Postpartum
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Prenura. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Kirim email ke email yang diinput user
    await sendEmail({
      to: email,
      subject: "Pengingat Janji Temu - Prenura (TEST)",
      html: emailHtml,
    })

    return NextResponse.json(
      {
        success: true,
        message: `Email berhasil dikirim ke ${email}`,
        details: {
          appointment_date: formattedDate,
          appointment_time: timeString,
          location,
          email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in test-reminder route:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim email",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

