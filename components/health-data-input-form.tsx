"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"

interface HealthDataInputFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  latestData?: {
    tekanan_darah_sistolik?: number
    tekanan_darah_diastolik?: number
    hemoglobin?: number
    berat_badan?: number
    mood?: "Baik" | "Sedang" | "Buruk"
    energi?: "Baik" | "Sedang" | "Buruk"
    tanggal_pemeriksaan?: string
    catatan?: string
    usia_kehamilan?: number
    postpartum_minggu?: number
  }
}

export default function HealthDataInputForm({ isOpen, onClose, onSuccess, userId, latestData }: HealthDataInputFormProps) {
  // Get current date from device
  const getCurrentDate = () => {
    const now = new Date()
    // Format untuk date input (YYYY-MM-DD)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Initialize form with latest data if available
  const initializeFormData = () => {
    if (latestData) {
      return {
        tekanan_darah_sistolik: latestData.tekanan_darah_sistolik?.toString() || "",
        tekanan_darah_diastolik: latestData.tekanan_darah_diastolik?.toString() || "",
        hemoglobin: latestData.hemoglobin?.toString() || "",
        berat_badan: latestData.berat_badan?.toString() || "",
        mood: latestData.mood || "",
        energi: latestData.energi || "",
        tanggal_pemeriksaan: latestData.tanggal_pemeriksaan || getCurrentDate(),
        catatan: latestData.catatan || "",
        usia_kehamilan: latestData.usia_kehamilan?.toString() || "",
        postpartum_minggu: latestData.postpartum_minggu?.toString() || "",
        status: (latestData.postpartum_minggu && latestData.postpartum_minggu > 0) ? "postpartum" as const : "hamil" as const,
      }
    }
    return {
      tekanan_darah_sistolik: "",
      tekanan_darah_diastolik: "",
      hemoglobin: "",
      berat_badan: "",
      mood: "" as "Baik" | "Sedang" | "Buruk" | "",
      energi: "" as "Baik" | "Sedang" | "Buruk" | "",
      tanggal_pemeriksaan: getCurrentDate(),
      catatan: "",
      usia_kehamilan: "",
      postpartum_minggu: "",
      status: "hamil" as "hamil" | "postpartum",
    }
  }

  const [formData, setFormData] = useState(initializeFormData())
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Reset form when dialog opens/closes, but only if form is not dirty
  useEffect(() => {
    if (isOpen && !isFormDirty) {
      setFormData(initializeFormData())
      setError("")
      setIsSubmitting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Update form data when latestData changes, but only if form is not dirty
  useEffect(() => {
    if (isOpen && !isFormDirty && latestData) {
      setFormData(initializeFormData())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestData])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setIsFormDirty(true)
  }

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      return
    }

    try {
      setError("")
      setIsSubmitting(true)

      // Use latest data as base, then override with form data
      // Only validate fields that are being changed (non-empty in form)
      const sistolikStr = formData.tekanan_darah_sistolik.trim()
      const diastolikStr = formData.tekanan_darah_diastolik.trim()
      const hbStr = formData.hemoglobin.trim()
      const bbStr = formData.berat_badan.trim()

      // Use latest data if field is empty, otherwise use form data
      const sistolik = sistolikStr ? parseFloat(sistolikStr) : (latestData?.tekanan_darah_sistolik || 0)
      const diastolik = diastolikStr ? parseFloat(diastolikStr) : (latestData?.tekanan_darah_diastolik || 0)
      const hb = hbStr ? parseFloat(hbStr) : (latestData?.hemoglobin || 0)
      const bb = bbStr ? parseFloat(bbStr) : (latestData?.berat_badan || 0)

      // Validate only if value is provided
      if (sistolikStr && (isNaN(sistolik) || sistolik < 60 || sistolik > 250)) {
        setError("Tekanan darah sistolik tidak valid (60-250 mmHg)")
        setIsSubmitting(false)
        return
      }

      if (diastolikStr && (isNaN(diastolik) || diastolik < 40 || diastolik > 150)) {
        setError("Tekanan darah diastolik tidak valid (40-150 mmHg)")
        setIsSubmitting(false)
        return
      }

      if (hbStr && (isNaN(hb) || hb < 5 || hb > 20)) {
        setError("Hemoglobin tidak valid (5-20 g/dL)")
        setIsSubmitting(false)
        return
      }

      if (bbStr && (isNaN(bb) || bb < 30 || bb > 200)) {
        setError("Berat badan tidak valid (30-200 kg)")
        setIsSubmitting(false)
        return
      }

      // At least one field must be filled
      if (!sistolikStr && !diastolikStr && !hbStr && !bbStr && !formData.mood && !formData.energi) {
        setError("Minimal satu field harus diisi")
        setIsSubmitting(false)
        return
      }

      // Use latest data for fields that are empty
      const finalMood = formData.mood || latestData?.mood || "Baik"
      const finalEnergi = formData.energi || latestData?.energi || "Baik"
      const finalTanggal = formData.tanggal_pemeriksaan || latestData?.tanggal_pemeriksaan || getCurrentDate()

      // Validate pregnancy/postpartum weeks only if provided
      let finalUsiaHamil = latestData?.usia_kehamilan || 0
      let finalPostpartumMinggu = latestData?.postpartum_minggu || 0

      if (formData.status === "hamil" && formData.usia_kehamilan) {
        const usiaHamil = parseInt(formData.usia_kehamilan)
        if (isNaN(usiaHamil) || usiaHamil < 0 || usiaHamil > 42) {
          setError("Usia kehamilan tidak valid (0-42 minggu)")
          setIsSubmitting(false)
          return
        }
        finalUsiaHamil = usiaHamil
      } else if (formData.status === "postpartum" && formData.postpartum_minggu) {
        const postpartumMinggu = parseInt(formData.postpartum_minggu)
        if (isNaN(postpartumMinggu) || postpartumMinggu < 0 || postpartumMinggu > 24) {
          setError("Minggu postpartum tidak valid (0-24 minggu)")
          setIsSubmitting(false)
          return
        }
        finalPostpartumMinggu = postpartumMinggu
      }

      // Submit to API
      const response = await fetch("/api/data-kesehatan/self-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ibu_hamil_id: userId,
          tekanan_darah_sistolik: sistolik || latestData?.tekanan_darah_sistolik || 120,
          tekanan_darah_diastolik: diastolik || latestData?.tekanan_darah_diastolik || 80,
          hemoglobin: hb || latestData?.hemoglobin || 12,
          berat_badan: bb || latestData?.berat_badan || 60,
          mood: finalMood as "Baik" | "Sedang" | "Buruk",
          energi: finalEnergi as "Baik" | "Sedang" | "Buruk",
          tanggal_pemeriksaan: finalTanggal,
          catatan: formData.catatan || latestData?.catatan || "",
          usia_kehamilan: formData.status === "hamil" ? finalUsiaHamil : 0,
          postpartum_minggu: formData.status === "postpartum" ? finalPostpartumMinggu : 0,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || result.message || "Gagal menyimpan data kesehatan")
        setIsSubmitting(false)
        return
      }

      // Success - reset form state
      setError("")
      setIsFormDirty(false)
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Error submitting health data:", err)
      setError("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.")
      setIsSubmitting(false)
    } finally {
      // Ensure isSubmitting is reset even if there's an unexpected error
      setTimeout(() => {
        setIsSubmitting(false)
      }, 100)
    }
  }

  const handleCancel = () => {
    if (isSubmitting) {
      return // Prevent cancel during submission
    }
    setError("")
    setIsFormDirty(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Input Data Kesehatan</DialogTitle>
          <DialogDescription>
            {latestData 
              ? "Edit data kesehatan Anda. Isi hanya field yang ingin diubah."
              : "Catat data kesehatan Anda. Isi minimal satu field untuk menyimpan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="tekanan_darah">Tekanan Darah (mmHg)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="tekanan_darah_sistolik"
                type="number"
                min={60}
                max={250}
                value={formData.tekanan_darah_sistolik}
                onChange={(e) => {
                  const value = e.target.value
                  handleChange("tekanan_darah_sistolik", value)
                  // Auto-focus to diastolik if sistolik is complete (3 digits)
                  if (value.length >= 3) {
                    const diastolikInput = document.getElementById("tekanan_darah_diastolik") as HTMLInputElement
                    if (diastolikInput) {
                      diastolikInput.focus()
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Move to diastolik on Enter or ArrowRight
                  if (e.key === "Enter" || e.key === "ArrowRight") {
                    e.preventDefault()
                    e.stopPropagation()
                    const diastolikInput = document.getElementById("tekanan_darah_diastolik") as HTMLInputElement
                    if (diastolikInput) {
                      diastolikInput.focus()
                    }
                  }
                }}
                placeholder="120"
                className="flex-1"
              />
              <span className="text-gray-500 font-medium text-lg">/</span>
              <Input
                id="tekanan_darah_diastolik"
                type="number"
                min={40}
                max={150}
                value={formData.tekanan_darah_diastolik}
                onChange={(e) => {
                  const value = e.target.value
                  handleChange("tekanan_darah_diastolik", value)
                }}
                onKeyDown={(e) => {
                  // Prevent form submission on Enter
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }
                  // Move back to sistolik on ArrowLeft or Backspace at start
                  if (e.key === "ArrowLeft" || (e.key === "Backspace" && (e.currentTarget as HTMLInputElement).selectionStart === 0)) {
                    e.preventDefault()
                    const sistolikInput = document.getElementById("tekanan_darah_sistolik") as HTMLInputElement
                    if (sistolikInput) {
                      sistolikInput.focus()
                      sistolikInput.setSelectionRange(sistolikInput.value.length, sistolikInput.value.length)
                    }
                  }
                }}
                placeholder="80"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: Sistolik/Diastolik (contoh: 120/80). Range: 60-250/40-150 mmHg</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hemoglobin">Hemoglobin/HB (g/dL)</Label>
              <Input
                id="hemoglobin"
                type="number"
                step="0.1"
                min={5}
                max={20}
                value={formData.hemoglobin}
                onChange={(e) => handleChange("hemoglobin", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                placeholder="Contoh: 12.5"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 5-20 g/dL (normal: 11-16 g/dL)</p>
            </div>

            <div>
              <Label htmlFor="berat_badan">Berat Badan (kg)</Label>
              <Input
                id="berat_badan"
                type="number"
                step="0.1"
                min={30}
                max={200}
                value={formData.berat_badan}
                onChange={(e) => handleChange("berat_badan", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                placeholder="Contoh: 65.5"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 30-200 kg</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select value={formData.mood} onValueChange={(value) => handleChange("mood", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baik">Baik</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Buruk">Buruk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="energi">Energi</Label>
              <Select value={formData.energi} onValueChange={(value) => handleChange("energi", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih energi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baik">Baik</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Buruk">Buruk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value as "hamil" | "postpartum")}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hamil">Hamil</SelectItem>
                <SelectItem value="postpartum">Postpartum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "hamil" && (
            <div>
              <Label htmlFor="usia_kehamilan">Usia Kehamilan (minggu)</Label>
              <Input
                id="usia_kehamilan"
                type="number"
                min={0}
                max={42}
                value={formData.usia_kehamilan}
                onChange={(e) => handleChange("usia_kehamilan", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                placeholder="Contoh: 20"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 0-42 minggu</p>
              {formData.usia_kehamilan && !isNaN(parseInt(formData.usia_kehamilan)) && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress: {formData.usia_kehamilan} / 42 minggu</span>
                    <span>{Math.round((parseInt(formData.usia_kehamilan) / 42) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((parseInt(formData.usia_kehamilan) / 42) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.status === "postpartum" && (
            <div>
              <Label htmlFor="postpartum_minggu">Minggu Postpartum</Label>
              <Input
                id="postpartum_minggu"
                type="number"
                min={0}
                max={24}
                value={formData.postpartum_minggu}
                onChange={(e) => handleChange("postpartum_minggu", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                placeholder="Contoh: 4"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 0-24 minggu</p>
              {formData.postpartum_minggu && !isNaN(parseInt(formData.postpartum_minggu)) && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress: {formData.postpartum_minggu} / 24 minggu</span>
                    <span>{Math.round((parseInt(formData.postpartum_minggu) / 24) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((parseInt(formData.postpartum_minggu) / 24) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="tanggal_pemeriksaan">Tanggal Pemeriksaan</Label>
            <Input
              id="tanggal_pemeriksaan"
              type="date"
              value={formData.tanggal_pemeriksaan}
              onChange={(e) => handleChange("tanggal_pemeriksaan", e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Menggunakan tanggal dari device Anda
            </p>
          </div>

          <div>
            <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="catatan"
              value={formData.catatan}
              onChange={(e) => handleChange("catatan", e.target.value)}
              placeholder="Catatan tambahan..."
              className="mt-1"
              rows={3}
            />
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div className="text-sm text-red-800">{error}</div>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSubmitting}
              type="button"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Data Kesehatan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}









