"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, AlertCircle, Loader2 } from "lucide-react"

interface Hospital {
  id: number
  name: string
  address: string
  phone: string
  hours: string
  services: string[]
  distance: number
  latitude: number
  longitude: number
  rating: number
  hasMaternityWard: boolean
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Mock hospitals data - dalam produksi, ini akan dari database/API
  const mockHospitals: Hospital[] = [
    {
      id: 1,
      name: "RSUD Dr. Sardjito",
      address: "Jl. Kesehatan No. 1, Yogyakarta",
      phone: "(0274) 514400",
      hours: "24 jam",
      services: ["Obstetri", "Kandungan", "Perinatalogi", "USG 4D"],
      distance: 2.5,
      latitude: -7.7956,
      longitude: 110.3889,
      rating: 4.8,
      hasMaternityWard: true,
    },
    {
      id: 2,
      name: "RS Bersalin Hermina",
      address: "Jl. Diponegoro No. 45, Yogyakarta",
      phone: "(0274) 562020",
      hours: "24 jam",
      services: ["Persalinan Normal", "Seksio Sesarea", "Konsultasi Kandungan"],
      distance: 3.8,
      latitude: -7.8057,
      longitude: 110.4004,
      rating: 4.6,
      hasMaternityWard: true,
    },
    {
      id: 3,
      name: "Klinik Bersalin Ibu & Anak",
      address: "Jl. Sudirman No. 12, Yogyakarta",
      phone: "(0274) 513456",
      hours: "07:00 - 21:00",
      services: ["Pemeriksaan Hamil", "Persalinan", "Vaksinasi Bayi"],
      distance: 1.2,
      latitude: -7.7935,
      longitude: 110.3754,
      rating: 4.7,
      hasMaternityWard: true,
    },
    {
      id: 4,
      name: "RS Akademik UGM",
      address: "Jl. Farmako No. 1, Yogyakarta",
      phone: "(0274) 553001",
      hours: "24 jam",
      services: ["Obstetri Spesialis", "Neonatologi", "Riset Obstetri"],
      distance: 5.2,
      latitude: -7.7715,
      longitude: 110.3927,
      rating: 4.9,
      hasMaternityWard: true,
    },
    {
      id: 5,
      name: "Puskesmas Wilayah Utara",
      address: "Jl. Gajah Mada No. 78, Yogyakarta",
      phone: "(0274) 524567",
      hours: "06:00 - 21:00",
      services: ["Pemeriksaan Ibu Hamil", "Imunisasi", "KB"],
      distance: 4.1,
      latitude: -7.7645,
      longitude: 110.3823,
      rating: 4.5,
      hasMaternityWard: false,
    },
  ]

  // Hitung jarak dari user location ke hospital
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    // Request geolocation dari browser
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })

          // Update jarak untuk setiap hospital
          const hospitalsWithDistance = mockHospitals.map((hospital) => ({
            ...hospital,
            distance: calculateDistance(latitude, longitude, hospital.latitude, hospital.longitude),
          }))

          // Urutkan berdasarkan jarak terdekat
          hospitalsWithDistance.sort((a, b) => a.distance - b.distance)

          setHospitals(hospitalsWithDistance)
          setLoading(false)
        },
        (err) => {
          console.log("[v0] Geolocation error:", err)
          // Jika user menolak lokasi, tampilkan semua hospital tanpa sorting jarak
          setHospitals(mockHospitals)
          setError("Izin lokasi ditolak. Menampilkan semua fasilitas kesehatan.")
          setLoading(false)
        },
      )
    } else {
      setError("Browser Anda tidak mendukung geolocation.")
      setHospitals(mockHospitals)
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-pink-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-pink-600" />
            <h1 className="text-4xl font-bold text-gray-800">Fasilitas Kesehatan Terdekat</h1>
          </div>
          <p className="text-gray-600 text-lg">Temukan rumah sakit dan klinik bersalin terpercaya di sekitar Anda</p>
        </div>
      </section>

      {/* Location Status */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
              <span>Mencari lokasi Anda...</span>
            </div>
          ) : userLocation ? (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-pink-600" />
              <span>
                Lokasi Anda:{" "}
                <span className="font-semibold">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              <span>Aktifkan lokasi untuk menemukan fasilitas kesehatan terdekat</span>
            </div>
          )}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="py-4 px-4">
          <div className="max-w-6xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-800">{error}</p>
          </div>
        </section>
      )}

      {/* Hospitals List */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6">
            {hospitals.map((hospital, index) => (
              <Card
                key={hospital.id}
                className="border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all p-6"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-800">{hospital.name}</h3>
                        {hospital.hasMaternityWard && (
                          <Badge className="bg-pink-100 text-pink-700 border-pink-200">Layanan Ibu & Bayi</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 text-pink-600" />
                        <span>{hospital.address}</span>
                      </div>
                      {userLocation && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-semibold text-pink-600">{hospital.distance.toFixed(1)} km</span>
                          <span>dari lokasi Anda</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold text-pink-600">{hospital.rating}</div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-gray-200">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Telepon</p>
                        <p className="font-semibold text-gray-800">{hospital.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Jam Operasional</p>
                        <p className="font-semibold text-gray-800">{hospital.hours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Layanan Tersedia:</p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                      onClick={() => (window.location.href = `tel:${hospital.phone}`)}
                    >
                      Hubungi
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-pink-200 text-gray-700 bg-transparent"
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`
                        window.open(url, "_blank")
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Lihat Lokasi
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          {hospitals.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">Tidak ada fasilitas kesehatan yang ditemukan</p>
              <p className="text-gray-500">Periksa koneksi internet Anda dan coba lagi</p>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="mt-8 bg-blue-50 border-blue-200 p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Informasi Penting</h4>
            <p className="text-blue-800 text-sm mb-3">
              Data fasilitas kesehatan ditampilkan berdasarkan lokasi Anda saat ini. Dalam keadaan darurat obstetri,
              hubungi ambulans (118) atau pergi langsung ke rumah sakit terdekat dengan fasilitas obstetri/kandungan.
            </p>
            <p className="text-blue-800 text-sm">
              Untuk ibu hamil dengan risiko tinggi, sebaiknya berkonsultasi dengan dokter spesialis kandungan untuk
              menentukan tempat persalinan yang paling sesuai.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
