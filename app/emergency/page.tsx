"use client"

import { useState } from "react"
import { Phone, AlertTriangle, MapPin, Clock, Heart, Ambulance, User, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DashboardNavbar from "@/components/dashboard-navbar"
import DashboardSidebar from "@/components/dashboard-sidebar"

interface EmergencyContact {
  id: string
  name: string
  role: string
  phone: string
  available: boolean
}

interface DangerSign {
  id: string
  title: string
  description: string
  urgent: boolean
}

export default function EmergencyPage() {
  const [showContacts, setShowContacts] = useState(false)

  const emergencyContacts: EmergencyContact[] = [
    {
      id: "1",
      name: "Dokter On-Call",
      role: "Dokter Kandungan",
      phone: "081234567890",
      available: true,
    },
    {
      id: "2",
      name: "Ambulans",
      role: "Layanan Darurat",
      phone: "118",
      available: true,
    },
    {
      id: "3",
      name: "RS Terdekat",
      role: "Rumah Sakit",
      phone: "0274123456",
      available: true,
    },
    {
      id: "4",
      name: "Keluarga - Suami",
      role: "Keluarga",
      phone: "081987654321",
      available: true,
    },
  ]

  const dangerSigns: DangerSign[] = [
    {
      id: "1",
      title: "Perdarahan Berlebihan",
      description: "Perdarahan lebih dari 500ml atau lebih banyak dari haid normal, disertai pusing atau lemas",
      urgent: true,
    },
    {
      id: "2",
      title: "Demam Tinggi",
      description: "Suhu tubuh >38°C yang berlangsung lebih dari 24 jam setelah persalinan",
      urgent: true,
    },
    {
      id: "3",
      title: "Nyeri Perut Parah",
      description: "Nyeri perut yang tidak tertahankan atau semakin memburuk",
      urgent: true,
    },
    {
      id: "4",
      title: "Tekanan Darah Tinggi",
      description: "Tekanan darah >140/90 mmHg dengan sakit kepala atau gangguan penglihatan",
      urgent: true,
    },
    {
      id: "5",
      title: "Tanda Infeksi Luka",
      description: "Luka persalinan bengkak, merah, bernanah, atau berbau tidak sedap",
      urgent: true,
    },
    {
      id: "6",
      title: "Kesulitan Bernapas",
      description: "Sesak napas, nyeri dada, atau batuk darah",
      urgent: true,
    },
    {
      id: "7",
      title: "Depresi Berat",
      description: "Perasaan sedih yang berkelanjutan, kehilangan minat, pikiran menyakiti diri atau bayi",
      urgent: true,
    },
    {
      id: "8",
      title: "Masalah Menyusui",
      description: "Payudara sangat bengkak dan keras, demam, atau puting sangat sakit",
      urgent: false,
    },
  ]

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleEmergencyCall = () => {
    // Panggil nomor darurat 118 untuk ambulans
    handleCall("118")
  }

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />

        <div className="flex-1 overflow-auto bg-gradient-to-b from-red-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Emergency Button */}
            <Card className="mb-8 bg-red-600 border-red-700 shadow-xl">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Phone className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">DARURAT?</h1>
                <p className="text-red-100 mb-6 text-lg">
                  Jika Anda mengalami tanda bahaya, segera hubungi bantuan medis
                </p>
                <Button
                  onClick={handleEmergencyCall}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-red-50 text-xl px-8 py-6 font-bold shadow-lg"
                >
                  <Phone className="w-6 h-6 mr-2" />
                  PANGGIL DARURAT
                </Button>
                <p className="text-red-100 text-sm mt-4">Atau hubungi ambulans: 118</p>
              </div>
            </Card>

            {/* Danger Signs */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">Tanda Bahaya Postpartum</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Jika Anda mengalami salah satu tanda berikut, segera hubungi dokter atau pergi ke rumah sakit terdekat:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dangerSigns.map((sign) => (
                  <Card
                    key={sign.id}
                    className={`p-4 border-2 ${
                      sign.urgent ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          sign.urgent ? "text-red-600" : "text-amber-600"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{sign.title}</h3>
                          {sign.urgent && <Badge className="bg-red-600 text-white text-xs">URGENT</Badge>}
                        </div>
                        <p className="text-sm text-gray-700">{sign.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Kontak Darurat</h2>
                </div>
                <Button
                  onClick={() => setShowContacts(!showContacts)}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {showContacts ? "Sembunyikan" : "Tampilkan"}
                </Button>
              </div>

              {showContacts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyContacts.map((contact) => (
                    <Card key={contact.id} className="p-4 border-gray-200 hover:border-pink-300 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                            {contact.available && (
                              <Badge className="bg-green-100 text-green-700 text-xs">Tersedia</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                          <p className="text-lg font-semibold text-pink-600">{contact.phone}</p>
                        </div>
                        <Button
                          onClick={() => handleCall(contact.phone)}
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                          size="sm"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Nearest Health Facility */}
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Fasilitas Kesehatan Terdekat</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4 p-3 bg-white rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Puskesmas Wilayah Utara</h3>
                      <p className="text-sm text-gray-600">Jl. Gajah Mada No. 78, Yogyakarta</p>
                      <p className="text-sm text-gray-500 mt-1">Jarak: 2.5 km</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = "/hospitals")}
                      className="flex-shrink-0"
                    >
                      Lihat Peta
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 bg-white"
                    onClick={() => (window.location.href = "/hospitals")}
                  >
                    Lihat Semua Fasilitas Kesehatan
                  </Button>
                </div>
              </div>
            </Card>

            {/* Important Info */}
            <Card className="bg-amber-50 border-amber-200">
              <div className="p-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Informasi Penting</h3>
                    <ul className="text-amber-800 text-sm space-y-2 list-disc list-inside">
                      <li>
                        Jangan ragu untuk menghubungi dokter atau pergi ke rumah sakit jika Anda merasa khawatir tentang
                        kondisi kesehatan Anda
                      </li>
                      <li>
                        Dalam keadaan darurat, hubungi ambulans (118) atau pergi langsung ke rumah sakit terdekat
                      </li>
                      <li>
                        Bawa kartu kesehatan, hasil pemeriksaan terakhir, dan catatan kehamilan saat pergi ke rumah
                        sakit
                      </li>
                      <li>
                        Jika memungkinkan, ajak pendamping (suami/keluarga) saat pergi ke fasilitas kesehatan
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

