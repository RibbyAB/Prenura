"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, Circle, AlertCircle, Clock, Mail, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TimelineEvent {
  week: number
  title: string
  description: string
  status: "completed" | "upcoming" | "current"
  type: "checkup" | "milestone" | "alert"
  date?: string
}

interface MonitoringTimelineProps {
  currentWeek: number
  maxWeek?: number
  type?: "hamil" | "postpartum"
  userEmail?: string
}

export default function MonitoringTimeline({ currentWeek, maxWeek = 24, type = "postpartum", userEmail }: MonitoringTimelineProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [reminderEmail, setReminderEmail] = useState(userEmail || "")
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [reminderError, setReminderError] = useState<string>("")
  const [reminderSuccess, setReminderSuccess] = useState<string>("")

  // Generate timeline events berdasarkan type
  const timelineEvents: TimelineEvent[] = type === "hamil" ? [
    {
      week: 0,
      title: "Konfirmasi Kehamilan",
      description: "Pemeriksaan awal kehamilan, USG pertama, penentuan HPHT",
      status: currentWeek >= 0 ? "completed" : "upcoming",
      type: "milestone",
    },
    {
      week: 12,
      title: "Kontrol Trimester 1",
      description: "Pemeriksaan lengkap: tekanan darah, hemoglobin, skrining kelainan janin",
      status: currentWeek >= 12 ? (currentWeek === 12 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 20,
      title: "USG Anatomi",
      description: "Pemeriksaan USG untuk melihat anatomi janin, deteksi kelainan",
      status: currentWeek >= 20 ? (currentWeek === 20 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 28,
      title: "Kontrol Trimester 3",
      description: "Pemeriksaan rutin, skrining diabetes gestasional, posisi janin",
      status: currentWeek >= 28 ? (currentWeek === 28 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 32,
      title: "Persiapan Persalinan",
      description: "Pemeriksaan posisi janin, persiapan persalinan, edukasi tanda bahaya",
      status: currentWeek >= 32 ? (currentWeek === 32 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 36,
      title: "Kontrol Mingguan",
      description: "Kontrol mingguan hingga persalinan, monitoring kondisi ibu dan janin",
      status: currentWeek >= 36 ? (currentWeek === 36 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 40,
      title: "Hari Perkiraan Lahir",
      description: "Hari perkiraan lahir (HPL), monitoring tanda persalinan",
      status: currentWeek >= 40 ? "completed" : currentWeek >= 38 ? "current" : "upcoming",
      type: "milestone",
    },
  ] : [
    {
      week: 0,
      title: "Persalinan",
      description: "Hari pertama setelah persalinan - monitoring perdarahan, tekanan darah, suhu",
      status: currentWeek >= 0 ? "completed" : "upcoming",
      type: "milestone",
    },
    {
      week: 1,
      title: "Kontrol Minggu Pertama",
      description: "Pemeriksaan luka persalinan, kondisi umum, status menyusui",
      status: currentWeek >= 1 ? (currentWeek === 1 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 2,
      title: "Kontrol 2 Minggu",
      description: "Evaluasi pemulihan, tanda infeksi, status emosional",
      status: currentWeek >= 2 ? (currentWeek === 2 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 4,
      title: "Kontrol 1 Bulan",
      description: "Pemeriksaan lengkap: hemoglobin, tekanan darah, evaluasi laktasi",
      status: currentWeek >= 4 ? (currentWeek === 4 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 6,
      title: "Kontrol 6 Minggu",
      description: "Kontrol postpartum standar - evaluasi pemulihan rahim, kontrasepsi",
      status: currentWeek >= 6 ? (currentWeek === 6 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 12,
      title: "Kontrol 3 Bulan",
      description: "Evaluasi jangka panjang, status kesehatan umum, dukungan psikososial",
      status: currentWeek >= 12 ? (currentWeek === 12 ? "current" : "completed") : "upcoming",
      type: "checkup",
    },
    {
      week: 24,
      title: "Kontrol 6 Bulan",
      description: "Kontrol akhir periode postpartum - evaluasi lengkap kesehatan ibu",
      status: currentWeek >= 24 ? "completed" : currentWeek >= 20 ? "current" : "upcoming",
      type: "checkup",
    },
  ]

  const progressPercentage = (currentWeek / maxWeek) * 100

  const getStatusIcon = (status: string, type: string) => {
    if (status === "completed") {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    }
    if (status === "current") {
      return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
    }
    if (type === "alert") {
      return <AlertCircle className="w-5 h-5 text-amber-600" />
    }
    return <Circle className="w-5 h-5 text-gray-400" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200"
      case "current":
        return "bg-blue-50 border-blue-300 shadow-md"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const handleWeekClick = (week: number, status: string) => {
    // Only allow reminder for upcoming weeks (not completed)
    if (status === "upcoming" || status === "current") {
      setSelectedWeek(selectedWeek === week ? null : week)
    } else {
      setSelectedWeek(selectedWeek === week ? null : week)
    }
  }

  const handleSetReminder = (event: TimelineEvent) => {
    if (event.status === "completed") {
      return // Can't set reminder for completed events
    }
    setReminderEmail(userEmail || "")
    setReminderError("")
    setReminderSuccess("")
    setShowReminderDialog(true)
    setSelectedWeek(event.week)
  }

  const handleSendReminder = async () => {
    if (!selectedWeek && selectedWeek !== 0) {
      setReminderError("Pilih week terlebih dahulu")
      return
    }

    if (!reminderEmail.trim()) {
      setReminderError("Email harus diisi")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reminderEmail)) {
      setReminderError("Format email tidak valid")
      return
    }

    setIsSendingReminder(true)
    setReminderError("")
    setReminderSuccess("")

    try {
      const selectedEvent = timelineEvents.find((e) => e.week === selectedWeek)
      if (!selectedEvent) {
        throw new Error("Event tidak ditemukan")
      }

      const response = await fetch("/api/appointments/reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: reminderEmail.trim(),
          week: selectedWeek,
          type,
          title: selectedEvent.title,
          description: selectedEvent.description,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim email reminder")
      }

      setReminderSuccess(`Email reminder berhasil dikirim ke ${reminderEmail}`)
      setTimeout(() => {
        setShowReminderDialog(false)
        setReminderSuccess("")
      }, 2000)
    } catch (err) {
      setReminderError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim email")
    } finally {
      setIsSendingReminder(false)
    }
  }

  return (
    <Card className="p-6 border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-pink-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Timeline Monitoring {type === "hamil" ? "Kehamilan" : "Postpartum"}
            </h3>
          </div>
          <Badge className="bg-pink-100 text-pink-700">
            Minggu {currentWeek}/{maxWeek}
          </Badge>
        </div>
        <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
          <span>Progres Monitoring</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <Card
            key={event.week}
            className={`p-4 border-2 cursor-pointer transition-all ${getStatusColor(event.status)} ${
              selectedWeek === event.week ? "ring-2 ring-pink-500" : ""
            }`}
            onClick={() => handleWeekClick(event.week, event.status)}
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">{getStatusIcon(event.status, event.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          event.type === "checkup"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : event.type === "alert"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-pink-50 text-pink-700 border-pink-200"
                        }`}
                      >
                        {event.type === "checkup" ? "Pemeriksaan" : event.type === "alert" ? "Peringatan" : "Tonggak"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    <p className="text-xs text-gray-500">
                      {event.status === "completed"
                        ? "✓ Selesai"
                        : event.status === "current"
                          ? "● Sedang berlangsung"
                          : `○ Akan datang (Minggu ${event.week})`}
                    </p>
                    {event.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs border-pink-200 text-pink-700 hover:bg-pink-100 hover:border-pink-300 hover:text-pink-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetReminder(event)
                        }}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Set Email Reminder
                      </Button>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-pink-600">W{event.week}</div>
                    <div className="text-xs text-gray-500">Minggu</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Email Reminder</DialogTitle>
            <DialogDescription>
              Kirim email pengingat untuk kontrol pada Minggu {selectedWeek}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="reminder-email">Email Tujuan</Label>
              <Input
                id="reminder-email"
                type="email"
                value={reminderEmail}
                onChange={(e) => {
                  setReminderEmail(e.target.value)
                  setReminderError("")
                }}
                placeholder="your-email@example.com"
                className="mt-1"
              />
            </div>

            {reminderError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{reminderError}</AlertDescription>
              </Alert>
            )}

            {reminderSuccess && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{reminderSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReminderDialog(false)
                  setReminderError("")
                  setReminderSuccess("")
                }}
                disabled={isSendingReminder}
              >
                Batal
              </Button>
              <Button
                onClick={handleSendReminder}
                disabled={isSendingReminder}
                className="bg-pink-600 hover:bg-pink-700 text-white transition-colors"
              >
                {isSendingReminder ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Kirim Reminder
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Catatan:</strong> Timeline ini adalah panduan umum. Jadwal kontrol dapat disesuaikan berdasarkan
          kondisi kesehatan dan rekomendasi dokter atau fasilitas kesehatan Anda.
        </p>
      </div>
    </Card>
  )
}

