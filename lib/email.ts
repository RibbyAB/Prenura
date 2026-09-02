/**
 * Email service menggunakan SendGrid
 */

import sgMail from "@sendgrid/mail"

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY

if (apiKey) {
  sgMail.setApiKey(apiKey)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Get verified sender email from environment or use default
 * SendGrid memerlukan sender email yang sudah terverifikasi
 */
function getVerifiedSenderEmail(): string {
  // Cek apakah ada SENDGRID_FROM_EMAIL di env
  const envFromEmail = process.env.SENDGRID_FROM_EMAIL
  
  if (envFromEmail) {
    return envFromEmail
  }
  
  // Default: gunakan email yang mungkin sudah terverifikasi
  // Untuk test, bisa gunakan email yang sama dengan akun SendGrid
  return "noreply@prenura.com"
}

/**
 * Mengirim email menggunakan SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY belum di-set di .env.local")
  }

  const { to, subject, html, from = getVerifiedSenderEmail() } = options

  try {
    await sgMail.send({
      to,
      from,
      subject,
      html,
    })
  } catch (error: any) {
    console.error("Error sending email:", error)
    
    // Handle SendGrid specific errors
    if (error.response) {
      const { statusCode, body } = error.response
      console.error("SendGrid error details:", { statusCode, body })
      
      // Error 403 Forbidden - biasanya karena sender email tidak terverifikasi
      if (statusCode === 403) {
        throw new Error(
          `Forbidden: Email sender "${from}" belum terverifikasi di SendGrid. ` +
          `Silakan verifikasi email sender di SendGrid Dashboard (Settings > Sender Authentication) ` +
          `atau gunakan email yang sudah terverifikasi.`
        )
      }
      
      // Error 401 Unauthorized - API key tidak valid
      if (statusCode === 401) {
        throw new Error(
          `Unauthorized: SendGrid API key tidak valid. ` +
          `Pastikan SENDGRID_API_KEY di .env.local sudah benar.`
        )
      }
      
      // Error lainnya
      const errorMessage = body?.errors?.[0]?.message || error.message
      throw new Error(`Gagal mengirim email (${statusCode}): ${errorMessage}`)
    }
    
    throw new Error(`Gagal mengirim email: ${error.message}`)
  }
}

/**
 * Format tanggal ke Bahasa Indonesia
 */
export function formatDateIndonesian(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${dayName}, ${day} ${month} ${year}`
}

