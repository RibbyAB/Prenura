"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, AlertCircle, Calendar, Heart, Clock, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DashboardNavbar from "@/components/dashboard-navbar"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { toast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: "checkup" | "alert" | "reminder" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  urgent?: boolean
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "checkup" | "alert" | "reminder" | "system">("all")
  const shownToastIds = useRef<Set<string>>(new Set())

  // Mock notifications - dalam produksi akan dari API/state management
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "checkup",
        title: "Jadwal Pemeriksaan Kontrol",
        message: "Anda memiliki jadwal pemeriksaan kontrol pada tanggal 20 Januari 2025 pukul 09:00 WIB",
        timestamp: new Date("2025-01-15T10:00:00"),
        read: false,
        urgent: false,
        actionUrl: "/dashboard/ibu-hamil",
      },
      {
        id: "2",
        type: "alert",
        title: "Pengingat Minum Suplemen",
        message: "Jangan lupa minum suplemen zat besi dan asam folat hari ini",
        timestamp: new Date("2025-01-15T08:00:00"),
        read: false,
        urgent: false,
      },
      {
        id: "3",
        type: "reminder",
        title: "Kontrol 2 Minggu Postpartum",
        message: "Sudah 2 minggu sejak persalinan. Segera lakukan kontrol ke dokter untuk pemeriksaan luka dan kondisi umum.",
        timestamp: new Date("2025-01-14T14:30:00"),
        read: true,
        urgent: true,
        actionUrl: "/hospitals",
      },
      {
        id: "4",
        type: "alert",
        title: "Update Status Kesehatan",
        message: "Silakan update gejala dan kondisi kesehatan Anda hari ini di dashboard",
        timestamp: new Date("2025-01-14T09:00:00"),
        read: true,
        urgent: false,
        actionUrl: "/dashboard/ibu-hamil",
      },
      {
        id: "5",
        type: "system",
        title: "Fitur Baru: Timeline Monitoring",
        message: "Sekarang Anda dapat melihat timeline lengkap monitoring 24 minggu postpartum di dashboard",
        timestamp: new Date("2025-01-13T16:00:00"),
        read: true,
        urgent: false,
      },
    ]

    setNotifications(mockNotifications)
  }, [])

  // Popup toast bottom-right hanya sekali setelah login, hanya untuk jadwal/peringatan/pengingat, auto-dismiss 10s
  useEffect(() => {
    const already = sessionStorage.getItem("notification_toast_shown")
    if (already) return

    notifications.forEach((n) => {
      const allowed = n.type === "checkup" || n.type === "alert" || n.type === "reminder"
      if (allowed && !n.read && !shownToastIds.current.has(n.id)) {
        shownToastIds.current.add(n.id)
        toast({
          title: n.title,
          description: n.message,
          duration: 10000,
        })
      }
    })
    sessionStorage.setItem("notification_toast_shown", "true")
  }, [notifications])

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => n.type === filter)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "checkup":
        return <Calendar className="w-5 h-5 text-blue-600" />
      case "alert":
        return <AlertCircle className="w-5 h-5 text-amber-600" />
      case "reminder":
        return <Clock className="w-5 h-5 text-purple-600" />
      case "system":
        return <Bell className="w-5 h-5 text-gray-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string, urgent?: boolean) => {
    if (urgent) return "bg-red-50 border-red-200"
    switch (type) {
      case "checkup":
        return "bg-blue-50 border-blue-200"
      case "alert":
        return "bg-amber-50 border-amber-200"
      case "reminder":
        return "bg-purple-50 border-purple-200"
      case "system":
        return "bg-gray-50 border-gray-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />

        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pusat Notifikasi</h1>
                    <p className="text-sm text-gray-600">
                      {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Button onClick={markAllAsRead} variant="outline" size="sm" className="text-sm">
                    Tandai Semua Dibaca
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {[
                { key: "all", label: "Semua", count: notifications.length },
                { key: "checkup", label: "Jadwal", count: notifications.filter((n) => n.type === "checkup").length },
                { key: "alert", label: "Peringatan", count: notifications.filter((n) => n.type === "alert").length },
                { key: "reminder", label: "Pengingat", count: notifications.filter((n) => n.type === "reminder").length },
                { key: "system", label: "Sistem", count: notifications.filter((n) => n.type === "system").length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    filter === tab.key
                      ? "border-pink-600 text-pink-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge className="ml-2 bg-pink-100 text-pink-700 text-xs">{tab.count}</Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Tidak ada notifikasi</p>
                  <p className="text-gray-500 text-sm mt-2">Semua notifikasi akan muncul di sini</p>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-4 border-2 transition-all ${
                      notification.read ? getNotificationColor(notification.type) : "bg-white border-pink-300 shadow-md"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                              )}
                              {notification.urgent && (
                                <Badge className="bg-red-100 text-red-700 text-xs">Penting</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Tandai dibaca"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteNotification(notification.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                              title="Hapus"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Detail link dihilangkan sesuai permintaan */}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Info Box */}
            <Card className="mt-8 bg-blue-50 border-blue-200 p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Tentang Notifikasi</h4>
                  <p className="text-blue-800 text-sm mb-2">
                    Prenura mengirimkan notifikasi untuk mengingatkan Anda tentang:
                  </p>
                  <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                    <li>Jadwal pemeriksaan kontrol rutin</li>
                    <li>Pengingat minum suplemen dan obat</li>
                    <li>Update status kesehatan yang diperlukan</li>
                    <li>Alert penting terkait kondisi kesehatan</li>
                  </ul>
                  <p className="text-blue-800 text-sm mt-3">
                    Aktifkan notifikasi browser untuk mendapatkan pengingat real-time. Notifikasi juga akan dikirim via
                    email sebagai backup.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

