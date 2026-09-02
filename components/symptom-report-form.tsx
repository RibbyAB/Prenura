"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"

interface SymptomReportFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (symptoms: string[]) => void
}

interface Symptom {
  id: string
  nama_gejala: string
  kategori: string
  tingkat_bahaya: string
}

export default function SymptomReportForm({ isOpen, onClose, onSubmit }: SymptomReportFormProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [predefinedSymptoms, setPredefinedSymptoms] = useState<Symptom[]>([])
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Load symptoms from API
      setIsLoadingSymptoms(true)
      fetch("/api/master-gejala")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPredefinedSymptoms(data.gejala)
          } else {
            setError("Gagal memuat daftar gejala. Silakan coba lagi.")
          }
        })
        .catch((err) => {
          console.error("Error loading symptoms:", err)
          setError("Terjadi kesalahan saat memuat daftar gejala.")
        })
        .finally(() => {
          setIsLoadingSymptoms(false)
        })
    }
  }, [isOpen])

  const handleToggleSymptom = (symptomId: string) => {
    try {
      setError("")
      setSelectedSymptoms((prev) =>
        prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
      )
    } catch (err) {
      setError("Terjadi kesalahan saat memilih gejala. Silakan coba lagi.")
      console.error("Error toggling symptom:", err)
    }
  }

  const handleSubmit = async () => {
    try {
      setError("")
      setIsSubmitting(true)

      if (selectedSymptoms.length === 0) {
        setError("Pilih minimal satu gejala untuk dilaporkan.")
        setIsSubmitting(false)
        return
      }

      // Validate that all selected symptoms exist in predefined list
      const invalidSymptoms = selectedSymptoms.filter(
        (id) => !predefinedSymptoms.find((s) => s.id === id)
      )

      if (invalidSymptoms.length > 0) {
        setError("Gejala yang dipilih tidak valid. Silakan pilih ulang.")
        setIsSubmitting(false)
        return
      }

      const symptomLabels = selectedSymptoms.map((id) => {
        const symptom = predefinedSymptoms.find((s) => s.id === id)
        if (!symptom) {
          throw new Error(`Gejala dengan ID ${id} tidak ditemukan`)
        }
        return symptom.nama_gejala
      })

      await onSubmit(symptomLabels)
      setSelectedSymptoms([])
      setError("")
      onClose()
    } catch (err) {
      setError("Terjadi kesalahan saat melaporkan gejala. Silakan coba lagi atau hubungi dokter.")
      console.error("Error submitting symptoms:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const symptomsByCategory = predefinedSymptoms.reduce(
    (acc, symptom) => {
      const category = symptom.kategori
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(symptom)
      return acc
    },
    {} as Record<string, Symptom[]>
  )

  const hasSensitiveSymptoms = selectedSymptoms.some((id) => {
    const symptom = predefinedSymptoms.find((s) => s.id === id)
    return symptom?.kategori === "Sensitif"
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Laporkan Gejala Baru</DialogTitle>
          <DialogDescription>
            Pilih gejala yang Anda alami. Gejala sensitif akan memerlukan evaluasi medis segera.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isLoadingSymptoms ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Memuat daftar gejala...</p>
            </div>
          ) : predefinedSymptoms.length === 0 ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <div className="text-sm text-yellow-800">Daftar gejala tidak tersedia. Silakan coba lagi.</div>
            </Alert>
          ) : (
            Object.entries(symptomsByCategory).map(([category, symptoms]) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {category === "Sensitif" && <AlertCircle className="w-4 h-4 text-red-600" />}
                  {category}
                  {category === "Sensitif" && (
                    <span className="text-xs text-red-600 font-normal">(Memerlukan evaluasi medis)</span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedSymptoms.includes(symptom.id)
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300"
                      } ${symptom.kategori === "Sensitif" ? "bg-red-50/30" : ""}`}
                      onClick={() => handleToggleSymptom(symptom.id)}
                    >
                      <Checkbox
                        id={symptom.id}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => handleToggleSymptom(symptom.id)}
                        className="border-pink-300"
                      />
                      <Label
                        htmlFor={symptom.id}
                        className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                      >
                        {symptom.nama_gejala}
                        {symptom.tingkat_bahaya === "Berat" && " ⚠️"}
                        {symptom.tingkat_bahaya === "Sedang" && " ⚠"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div className="text-sm text-red-800">{error}</div>
            </Alert>
          )}

          {hasSensitiveSymptoms && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div className="text-sm text-red-800">
                <strong>Peringatan:</strong> Gejala sensitif yang Anda pilih memerlukan evaluasi medis segera.
                Setelah melaporkan, segera hubungi dokter kandungan terdekat.
              </div>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedSymptoms.length === 0 || isSubmitting}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isSubmitting ? "Mengirim..." : `Laporkan Gejala (${selectedSymptoms.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

