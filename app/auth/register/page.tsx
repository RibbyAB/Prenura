"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    umur: "",
    nomorHp: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string): boolean => {
    return email.endsWith("@gmail.com")
  }

  const validatePhone = (phone: string): boolean => {
    return phone.startsWith("+62") || phone.startsWith("62") || phone.startsWith("0")
  }

  const normalizePhone = (phone: string): string => {
    if (phone.startsWith("0")) {
      return "+62" + phone.substring(1)
    }
    if (phone.startsWith("62")) {
      return "+" + phone
    }
    return phone
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error saat user mengetik
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Validasi frontend
    const newErrors: Record<string, string> = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = "Email harus berakhiran @gmail.com"
    }

    if (!validatePhone(formData.nomorHp)) {
      newErrors.nomorHp = "Nomor HP harus diawali dengan +62, 62, atau 0"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password dan konfirmasi password tidak cocok"
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const normalizedPhone = normalizePhone(formData.nomorHp)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          nomorHp: normalizedPhone,
          role: "ibu-hamil",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors dari backend
        if (data.details && Array.isArray(data.details)) {
          const backendErrors: Record<string, string> = {}
          data.details.forEach((err: any) => {
            backendErrors[err.path[0]] = err.message
          })
          setErrors(backendErrors)
        } else {
          setErrors({ general: data.error || "Terjadi kesalahan saat registrasi" })
        }
        setLoading(false)
        return
      }

      // Registrasi berhasil, redirect ke login
      alert("Registrasi berhasil! Silakan login dengan email dan password Anda.")
      router.push("/auth/login")
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ general: "Terjadi kesalahan saat registrasi. Silakan coba lagi." })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke beranda
        </Button>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar</h1>
          <p className="text-gray-600 text-sm mt-1">Sebagai Ibu Hamil</p>
        </div>

        {errors.general && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <Label htmlFor="nama" className="text-sm font-medium text-gray-700">
              Nama Lengkap
            </Label>
            <Input
              id="nama"
              name="nama"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChange={handleChange}
              required
              className={`mt-1 border-gray-300 ${errors.nama ? "border-red-500" : ""}`}
            />
            {errors.nama && <p className="text-xs text-red-600 mt-1">{errors.nama}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email (@gmail.com)
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={`mt-1 border-gray-300 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-500 mt-1">Email harus berakhiran @gmail.com</p>
          </div>

          {/* Umur */}
          <div>
            <Label htmlFor="umur" className="text-sm font-medium text-gray-700">
              Umur
            </Label>
            <Input
              id="umur"
              name="umur"
              type="number"
              placeholder="Masukkan umur"
              value={formData.umur}
              onChange={handleChange}
              required
              className={`mt-1 border-gray-300 ${errors.umur ? "border-red-500" : ""}`}
            />
            {errors.umur && <p className="text-xs text-red-600 mt-1">{errors.umur}</p>}
          </div>

          {/* Nomor HP */}
          <div>
            <Label htmlFor="nomorHp" className="text-sm font-medium text-gray-700">
              Nomor HP (+62)
            </Label>
            <Input
              id="nomorHp"
              name="nomorHp"
              type="tel"
              placeholder="+628123456789 atau 08123456789"
              value={formData.nomorHp}
              onChange={handleChange}
              required
              className={`mt-1 border-gray-300 ${errors.nomorHp ? "border-red-500" : ""}`}
            />
            {errors.nomorHp && <p className="text-xs text-red-600 mt-1">{errors.nomorHp}</p>}
            <p className="text-xs text-gray-500 mt-1">Nomor HP harus diawali dengan +62, 62, atau 0</p>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                className={`border-gray-300 pr-10 ${errors.password ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Konfirmasi Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Masukkan ulang password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`mt-1 border-gray-300 ${errors.confirmPassword ? "border-red-500" : ""}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-pink-600 font-semibold hover:text-pink-700">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
