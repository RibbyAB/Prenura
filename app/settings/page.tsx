"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, User, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardNavbar from "@/components/dashboard-navbar"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profil")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

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
  }, [router])

  // Profile data - use dynamic data from user
  const [profileData, setProfileData] = useState({
    nama: "",
    umur: "",
    nomorHp: "",
    email: "",
  })

  useEffect(() => {
    if (userData) {
      setProfileData({
        nama: userData.nama || "",
        umur: userData.umur || "",
        nomorHp: userData.nomorHp || "",
        email: userData.email || "",
      })
    }
  }, [userData])

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotification: true,
    appNotification: true,
    reminderKesehatanNotification: true,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: name === "umur" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!userData?.id) {
      alert("User ID tidak ditemukan. Silakan login ulang.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          nama: profileData.nama,
          umur: profileData.umur,
          nomorHp: profileData.nomorHp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Gagal memperbarui profil")
        setIsLoading(false)
        return
      }

      // Update localStorage dengan data terbaru
      const updatedUser = {
        ...userData,
        ...data.user,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUserData(updatedUser)

      setIsEditing(false)
      alert("Profil berhasil diperbarui!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")
      router.push("/")
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-8 h-8 text-pink-600" />
                Pengaturan
              </h1>
              <p className="text-gray-600 text-sm mt-1">Kelola profil dan preferensi Anda</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {[
                { key: "profil", label: "Profil", icon: User },
                { key: "notifikasi", label: "Notifikasi", icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "border-pink-600 text-pink-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profil" && (
              <div className="space-y-6">
                {/* Profile Information Card */}
                <Card className="p-6 border-gray-200">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Informasi Profil</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {isEditing ? "Edit data diri Anda" : "Lihat dan kelola data diri Anda"}
                      </p>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} className="bg-pink-600 hover:bg-pink-700 text-white">
                        Edit Profil
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Nama */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <Input
                        type="text"
                        name="nama"
                        value={profileData.nama}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="border-gray-300 disabled:bg-gray-50"
                      />
                    </div>

                    {/* Umur */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Umur</label>
                      <Input
                        type="number"
                        name="umur"
                        value={profileData.umur}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="border-gray-300 disabled:bg-gray-50"
                      />
                    </div>

                    {/* Nomor HP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor HP</label>
                      <Input
                        type="tel"
                        name="nomorHp"
                        value={profileData.nomorHp}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="border-gray-300 disabled:bg-gray-50"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="border-gray-300 disabled:bg-gray-50"
                      />
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                          Batal
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

              </div>
            )}

            {/* Notification Tab */}
            {activeTab === "notifikasi" && (
              <div className="space-y-6">
                <Card className="p-6 border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferensi Notifikasi</h2>
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotification",
                        label: "Notifikasi Email",
                        description: "Terima pembaruan dan pengingat melalui email",
                      },
                      {
                        key: "appNotification",
                        label: "Notifikasi Aplikasi",
                        description: "Terima notifikasi push di aplikasi",
                      },
                      {
                        key: "reminderKesehatanNotification",
                        label: "Pengingat Kesehatan",
                        description: "Pengingat jadwal pemeriksaan dan nutrisi",
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{setting.label}</p>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[setting.key as keyof typeof notifications]}
                          onChange={() => handleNotificationChange(setting.key as keyof typeof notifications)}
                          className="w-5 h-5 text-pink-600 rounded cursor-pointer"
                        />
                      </div>
                    ))}

                    <Button className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white">
                      Simpan Preferensi Notifikasi
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Logout Card */}
            <Card className="p-6 border-gray-200 mt-8 bg-red-50 border-red-200">
              <h2 className="text-xl font-semibold text-red-900 mb-2">Keluar dari Akun</h2>
              <p className="text-sm text-red-800 mb-4">Anda akan diminta untuk login kembali di perangkat ini.</p>
              <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Keluar
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
