"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Bell, Heart, MapPin, MessageCircle, Plus, RefreshCw, ShieldAlert, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import DashboardNavbar from "@/components/dashboard-navbar"
import DashboardSidebar from "@/components/dashboard-sidebar"
import MonitoringTimeline from "@/components/monitoring-timeline"
import SymptomReportForm from "@/components/symptom-report-form"
import HealthDataInputForm from "@/components/health-data-input-form"

type Notification = {
  id: number
  title: string
  type: "Kontrol" | "Risiko" | "Nutrisi"
  time: string
  read: boolean
}

export default function IbuHamilDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"ringkasan" | "pantau" | "edukasi" | "rujukan">("ringkasan")
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Kontrol minggu ini - 09.00", type: "Kontrol", time: "Besok", read: false },
    { id: 2, title: "Risiko meningkat: pusing + bengkak", type: "Risiko", time: "Baru saja", read: false },
    { id: 3, title: "Menu kaya zat besi untuk anemia", type: "Nutrisi", time: "Hari ini", read: true },
  ])
  const [showSymptomForm, setShowSymptomForm] = useState(false)
  const [showHealthDataForm, setShowHealthDataForm] = useState(false)
  const [gejala, setGejala] = useState<string[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [healthData, setHealthData] = useState<any[]>([])
  const [latestHealthData, setLatestHealthData] = useState<any>(null)
  const [riskAssessment, setRiskAssessment] = useState<any>(null)
  const [isLoadingRisk, setIsLoadingRisk] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }

    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    
    setUserData(user)

    // Load health data and symptoms
    if (user?.id) {
      // Load health data
      fetch(`/api/data-kesehatan/list?ibu_hamil_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHealthData(data.data)
            if (data.data.length > 0) {
              setLatestHealthData(data.data[0])
            }
          }
        })
        .catch((error) => {
          console.error("Error loading health data:", error)
        })

      // Load saved symptoms
      fetch(`/api/symptoms/get?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.gejala.length > 0) {
            setGejala(data.gejala)
          }
        })
        .catch((error) => {
          console.error("Error loading symptoms:", error)
        })
    }
  }, [router])

  // Use user data or latest health data
  const isHamil = latestHealthData?.usia_kehamilan && latestHealthData.usia_kehamilan > 0
  const isPostpartum = latestHealthData?.postpartum_minggu && latestHealthData.postpartum_minggu > 0
  
  const ibuData = {
    nama: userData?.nama || "",
    mingguPostpartum: isPostpartum ? latestHealthData.postpartum_minggu : 0,
    usiaKehamilan: isHamil ? latestHealthData.usia_kehamilan : 0,
    status: isHamil ? "hamil" : isPostpartum ? "postpartum" : "unknown",
    totalMinggu: isHamil ? 42 : 24, // 42 minggu untuk hamil, 24 minggu untuk postpartum
    currentWeek: isHamil ? latestHealthData.usia_kehamilan : isPostpartum ? latestHealthData.postpartum_minggu : 0,
    terakhirKontrol: latestHealthData?.tanggal_pemeriksaan
      ? new Date(latestHealthData.tanggal_pemeriksaan).toLocaleDateString("id-ID")
      : "Belum ada",
    tekananDarah: latestHealthData
      ? `${latestHealthData.tekanan_darah_sistolik}/${latestHealthData.tekanan_darah_diastolik}`
      : "Belum diukur",
    hemoglobin: latestHealthData?.hemoglobin || 0,
    beratBadan: latestHealthData?.berat_badan || 0,
    mood: latestHealthData?.mood || "Belum dilaporkan",
    energi: latestHealthData?.energi || "Belum dilaporkan",
    inputBy: "",
  }

  // Calculate risk using API with debouncing
  const calculateRisk = useCallback(async () => {
    if (!userData?.id || !latestHealthData) {
      setRiskAssessment(null)
      return
    }

    setIsLoadingRisk(true)
    try {
      const response = await fetch("/api/risk-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          tekanan_darah: {
            systolic: latestHealthData.tekanan_darah_sistolik,
            diastolic: latestHealthData.tekanan_darah_diastolik,
          },
          hemoglobin: latestHealthData.hemoglobin,
          berat_badan: latestHealthData.berat_badan,
          mood_energi: latestHealthData.mood === latestHealthData.energi ? latestHealthData.mood : "Sedang",
          gejala: gejala,
          usia_kehamilan: latestHealthData.usia_kehamilan || 0,
          postpartum_minggu: latestHealthData.postpartum_minggu || 0,
        }),
      })

      const data = await response.json()
      if (data.success && data.data) {
        setRiskAssessment(data.data)
      } else {
        console.error("Risk assessment failed:", data)
      }
    } catch (error) {
      console.error("Error calculating risk:", error)
      // Don't clear risk assessment on error, keep previous value
    } finally {
      setIsLoadingRisk(false)
    }
  }, [userData?.id, latestHealthData, gejala])

  // Debounce risk calculation to prevent too frequent calls
  useEffect(() => {
    if (!userData?.id || !latestHealthData) {
      setRiskAssessment(null)
      return
    }

    const timeoutId = setTimeout(() => {
      calculateRisk()
    }, 500) // Wait 500ms after last change

    return () => clearTimeout(timeoutId)
  }, [userData?.id, latestHealthData?.id, latestHealthData?.tekanan_darah_sistolik, latestHealthData?.tekanan_darah_diastolik, latestHealthData?.hemoglobin, latestHealthData?.berat_badan, latestHealthData?.mood, latestHealthData?.energi, latestHealthData?.usia_kehamilan, latestHealthData?.postpartum_minggu, JSON.stringify(gejala), calculateRisk])

  const risk = useMemo(() => {
    if (riskAssessment) {
      const levelMap: Record<string, string> = {
        RENDAH: "Rendah",
        SEDANG: "Sedang",
        TINGGI: "Tinggi",
        SANGAT_TINGGI: "Tinggi",
      }
      const level = levelMap[riskAssessment.risikoLevel] || "Rendah"
      const color =
        riskAssessment.risikoLevel === "SANGAT_TINGGI" || riskAssessment.risikoLevel === "TINGGI"
          ? "bg-red-100 text-red-700"
          : riskAssessment.risikoLevel === "SEDANG"
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
      return { level, color, assessment: riskAssessment }
    }
    // Fallback to simple calculation
    let score = 0
    if (ibuData.tekananDarah && Number(ibuData.tekananDarah.split("/")[0]) >= 140) score += 2
    if (ibuData.hemoglobin < 11) score += 2
    if (gejala.some((g) => g.toLowerCase().includes("bengkak"))) score += 2
    const level = score >= 5 ? "Tinggi" : score >= 3 ? "Sedang" : "Rendah"
    const color =
      level === "Tinggi" ? "bg-red-100 text-red-700" : level === "Sedang" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
    return { level, color }
  }, [riskAssessment, gejala, ibuData.hemoglobin, ibuData.tekananDarah])

  const handleSymptomSubmit = async (newSymptoms: string[]) => {
    if (!userData?.id) return

    const updatedGejala = [...gejala, ...newSymptoms]
    const seen = new Set<string>()
    const uniqueGejala = updatedGejala.filter((sym) => {
      const normalized = sym.trim().toLowerCase()
      if (!normalized) return false
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })

    setGejala(uniqueGejala)

    // Save to database
    try {
      await fetch("/api/symptoms/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          gejala: uniqueGejala,
        }),
      })
    } catch (error) {
      console.error("Error saving symptoms:", error)
    }
    // Risk will be recalculated automatically via useEffect
  }

  const handleSymptomDelete = async (symptom: string) => {
    if (!userData?.id) return

    const updatedGejala = gejala.filter((g) => g !== symptom)
    setGejala(updatedGejala)

    // Save to database
    try {
      await fetch("/api/symptoms/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          gejala: updatedGejala,
        }),
      })
    } catch (error) {
      console.error("Error saving symptoms:", error)
    }
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const badgeByType = (type: Notification["type"]) => {
    if (type === "Risiko") return "bg-red-100 text-red-700"
    if (type === "Kontrol") return "bg-blue-100 text-blue-700"
    return "bg-amber-100 text-amber-700"
  }

  // Notifikasi popup dihapus - hanya di halaman notifikasi

  const uniqueGejala = useMemo(() => {
    const seen = new Set<string>()
    return gejala.filter((g) => {
      const normalized = g.trim().toLowerCase()
      if (!normalized || seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
  }, [gejala])

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-7 h-7 text-pink-600" />
                  Halo, {ibuData.nama}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {ibuData.status === "hamil" 
                    ? `Kehamilan minggu ke-${ibuData.usiaKehamilan} dari ${ibuData.totalMinggu} minggu`
                    : ibuData.status === "postpartum"
                    ? `Monitoring postpartum minggu ke-${ibuData.mingguPostpartum} dari ${ibuData.totalMinggu} minggu`
                    : "Belum ada data kehamilan/postpartum"}
                </p>
                <p className="text-xs text-gray-500">Terakhir kontrol: {ibuData.terakhirKontrol}</p>
              </div>
              {isLoadingRisk ? (
                <Badge className="bg-gray-100 text-gray-700">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin inline" />
                  Menghitung...
                </Badge>
              ) : (
                <Badge className={risk.color}>Risiko {risk.level}</Badge>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-5 border-pink-100 bg-pink-50">
                <p className="text-xs text-gray-600">Tekanan darah</p>
                <p className="text-2xl font-bold text-gray-900">{ibuData.tekananDarah} <span className="text-sm font-normal">mmHg</span></p>
                <p className="text-xs text-gray-500 mt-1">
                  Pantau 2x/hari bila pusing atau bengkak.
                </p>
              </Card>
              <Card className="p-5 border-amber-100 bg-amber-50/80">
                <p className="text-xs text-gray-600">Hemoglobin</p>
                <p className="text-2xl font-bold text-gray-900">{ibuData.hemoglobin || "-"} <span className="text-sm font-normal">g/dL</span></p>
                <p className="text-xs text-gray-500 mt-1">
                  Anjurkan menu tinggi zat besi + vitamin C.
                </p>
              </Card>
              <Card className="p-5 border-green-100 bg-green-50/80">
                <p className="text-xs text-gray-600">Berat Badan</p>
                <p className="text-2xl font-bold text-gray-900">{ibuData.beratBadan || "-"} <span className="text-sm font-normal">kg</span></p>
                <p className="text-xs text-gray-500 mt-1">
                  Pengukuran terakhir
                </p>
              </Card>
              <Card className="p-5 border-blue-100 bg-blue-50/80">
                <p className="text-xs text-gray-600">Mood & energi</p>
                <p className="text-sm font-semibold text-gray-900">{ibuData.mood}</p>
                <p className="text-xs text-gray-500 mt-1">Energi: {ibuData.energi || "-"}</p>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-pink-200 text-pink-700 gap-1"
                onClick={() => setShowHealthDataForm(true)}
              >
                <Plus className="w-4 h-4" />
                Input Data Kesehatan
              </Button>
            </div>

            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
              {(["ringkasan", "pantau", "edukasi", "rujukan"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab ? "border-pink-600 text-pink-600" : "border-transparent text-gray-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "ringkasan" && (
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="p-5 border-pink-100 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-pink-600" />
                        <p className="font-semibold text-gray-900">Tindak lanjut terdekat</p>
                      </div>
                      <Badge className="bg-pink-50 text-pink-700 border-pink-100">Dalam 2 hari</Badge>
                    </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Card className="p-3 bg-pink-50 border-pink-100">
                    <p className="text-xs text-gray-600">Kontrol kesehatan</p>
                    <p className="font-semibold text-gray-900 text-sm">Besok • 09.00</p>
                  </Card>
                  <Card className="p-3 bg-pink-50 border-pink-100">
                    <p className="text-xs text-gray-600">Evaluasi tekanan darah</p>
                    <p className="font-semibold text-gray-900 text-sm">Catat pagi & malam</p>
                  </Card>
                  <Card className="p-3 bg-pink-50 border-pink-100">
                    <p className="text-xs text-gray-600">Nutrisi</p>
                    <p className="font-semibold text-gray-900 text-sm">Menu tinggi zat besi</p>
                  </Card>
                </div>
                  </Card>

                  <Card className="p-5 border-pink-100 bg-white space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-pink-600" />
                      <p className="font-semibold text-gray-900">Gejala yang dilaporkan</p>
                    </div>
                    {uniqueGejala.length === 0 ? (
                      <p className="text-sm text-gray-600">Belum ada gejala yang dilaporkan.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {uniqueGejala.map((g) => (
                          <Badge key={g} className="bg-pink-50 text-pink-700 border-pink-100 flex items-center gap-1">
                            <span>{g}</span>
                            <button
                              type="button"
                              onClick={() => handleSymptomDelete(g)}
                              className="text-pink-700 hover:text-pink-900"
                              aria-label={`Hapus ${g}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-pink-200 text-pink-700 w-fit gap-1"
                      onClick={() => setShowSymptomForm(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Laporkan gejala baru
                    </Button>
                  </Card>

                  <MonitoringTimeline 
                    currentWeek={ibuData.currentWeek} 
                    maxWeek={ibuData.totalMinggu}
                    type={ibuData.status === "hamil" ? "hamil" : "postpartum"}
                    userEmail={userData?.email}
                  />
                </div>

                <div className="space-y-4">
                  <Card className="p-5 border-red-100 bg-red-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      <p className="font-semibold text-gray-900">Darurat</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Tekan jika perdarahan banyak, kejang, demam tinggi, atau sesak napas.
                    </p>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white w-full"
                      onClick={() => (window.location.href = "/emergency")}
                    >
                      Lihat Halaman Darurat
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <MapPin className="w-4 h-4 text-red-600" />
                      Puskesmas terdekat: 2.1 km • 7 menit motor
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "pantau" && (
              <Card className="p-6 border-pink-100 bg-white space-y-3">
                <p className="font-semibold text-gray-900">Pantau harian</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {["Tekanan darah", "Suhu", "Jumlah perdarahan", "Mood", "Luka jahitan", "ASI"].map((item) => (
                    <Card key={item} className="p-3 bg-pink-50 border-pink-100">
                      <p className="text-sm font-semibold text-gray-900">{item}</p>
                      <p className="text-xs text-gray-600 mt-1">Catat 1-2x per hari</p>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "edukasi" && (
              <Card className="p-6 border-pink-100 bg-white space-y-3">
                <p className="font-semibold text-gray-900">Edukasi Nutrisi & Perawatan</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                  <li>Menu kaya zat besi: hati ayam, ikan kembung, bayam, jeruk.</li>
                  <li>Hindari kopi/teh berlebih agar penyerapan besi optimal.</li>
                  <li>Jaga kebersihan luka jahitan, segera cek jika ada demam/nyeri hebat.</li>
                </ul>
              </Card>
            )}

            {activeTab === "rujukan" && (
              <Card className="p-6 border-pink-100 bg-white space-y-3">
                <p className="font-semibold text-gray-900">Kontak Darurat</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Layanan kesehatan terdekat: 2.1 km • Jalan Mawar No. 12</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <SymptomReportForm
        isOpen={showSymptomForm}
        onClose={() => setShowSymptomForm(false)}
        onSubmit={handleSymptomSubmit}
      />

      {userData?.id && (
        <HealthDataInputForm
          isOpen={showHealthDataForm}
          onClose={() => setShowHealthDataForm(false)}
          onSuccess={() => {
            // Reload health data and trigger risk recalculation
            fetch(`/api/data-kesehatan/list?ibu_hamil_id=${userData.id}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  setHealthData(data.data)
                  if (data.data.length > 0) {
                    setLatestHealthData(data.data[0])
                    // Risk will be recalculated automatically via useEffect
                  } else {
                    setLatestHealthData(null)
                  }
                }
              })
              .catch((error) => {
                console.error("Error loading health data:", error)
              })
          }}
          userId={userData.id}
          latestData={latestHealthData ? {
            tekanan_darah_sistolik: latestHealthData.tekanan_darah_sistolik,
            tekanan_darah_diastolik: latestHealthData.tekanan_darah_diastolik,
            hemoglobin: latestHealthData.hemoglobin,
            berat_badan: latestHealthData.berat_badan,
            mood: latestHealthData.mood,
            energi: latestHealthData.energi,
            tanggal_pemeriksaan: latestHealthData.tanggal_pemeriksaan,
            catatan: latestHealthData.catatan,
            usia_kehamilan: latestHealthData.usia_kehamilan,
            postpartum_minggu: latestHealthData.postpartum_minggu,
          } : undefined}
        />
      )}
    </div>
  )
}
