"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Send, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestEmailPage() {
  const [formData, setFormData] = useState({
    appointment_date: "",
    appointment_time: "",
    location: "",
    email: "test@gmail.com", // Default email
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear messages saat user mengetik
    if (error) setError("")
    if (success) setSuccess("")
  }

  const validateForm = (): boolean => {
    if (!formData.appointment_date || !formData.appointment_time || !formData.location.trim() || !formData.email.trim()) {
      setError("Semua field harus diisi")
      return false
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid")
      return false
    }

    // Validasi tanggal tidak boleh masa lalu
    const selectedDate = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
    const now = new Date()
    if (selectedDate < now) {
      setError("Tanggal dan waktu tidak boleh di masa lalu")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/appointments/test-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim email")
      }

      setSuccess(data.message || `Email berhasil dikirim! Cek inbox ${formData.email}`)
      // Reset form (tapi keep email)
      setFormData({
        appointment_date: "",
        appointment_time: "",
        location: "",
        email: formData.email, // Keep email yang sudah diisi
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      {/* Logo Header */}
      <Link href="/" className="mb-6">
        <div className="relative w-48 h-20 md:w-56 md:h-24">
          <Image
            src="/prenura-logo.png"
            alt="Prenura Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>

      <Card className="w-full max-w-md shadow-2xl bg-white">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Test Email Appointment</CardTitle>
          <CardDescription className="text-gray-600">
            Kirim email reminder untuk test
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Tujuan */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Tujuan
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="test@gmail.com"
                required
                className="w-full"
              />
            </div>

            {/* Tanggal Kontrol */}
            <div className="space-y-2">
              <Label htmlFor="appointment_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Kontrol
              </Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={handleChange}
                required
                className="w-full"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Waktu */}
            <div className="space-y-2">
              <Label htmlFor="appointment_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Waktu
              </Label>
              <Input
                id="appointment_time"
                name="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Lokasi */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lokasi
              </Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Contoh: RS Siloam, Jl. Sudirman No. 123"
                required
                className="w-full"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Test Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

