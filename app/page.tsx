"use client"

import Link from "next/link"
import { AlertCircle, ShieldCheck } from "lucide-react"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {

  const handleMulaiPemantauan = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (localStorage.getItem("isLoggedIn") === "true" && user?.id) {
      window.location.href = "/dashboard/ibu-hamil"
    } else {
      window.location.href = "/auth/login"
    }
  }

  return (
    <main className="bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-pink-700">
                <ShieldCheck className="w-4 h-4" />
                Prenura - Pendamping Kesehatan Ibu Pasca Melahirkan
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                AI Postpartum Risk & Monitoring untuk Ibu di Indonesia
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Prenura memprediksi risiko komplikasi 0-24 minggu pasca melahirkan dan memberi edukasi nutrisi yang
                mudah dipahami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleMulaiPemantauan}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3"
                >
                  Mulai Pemantauan
                </Button>
                <Link href="/chatbot">
                  <Button variant="outline" className="border-pink-200 text-pink-700 px-6 py-3">
                    Tanya AI Prenura
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AKI Section */}
      <section className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Angka Kematian Ibu (AKI) di Indonesia
            </h2>
            <p className="text-gray-700 text-lg">
              Data aktual dari Kementerian Kesehatan Republik Indonesia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-red-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Angka Kematian Ibu</h3>
                  <p className="text-sm text-gray-600">Per 100.000 kelahiran hidup</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-red-600">305</span>
                  <span className="text-lg text-gray-600">per 100.000</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Tahun 2020</strong> - Data terbaru dari Kementerian Kesehatan RI
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Target SDGs 2030: <strong className="text-red-600">70 per 100.000</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Indonesia masih perlu upaya signifikan untuk mencapai target
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-red-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Penyebab Utama Kematian Ibu</h3>
              <div className="space-y-3">
                {[
                  { cause: "Perdarahan", percentage: 28, color: "bg-red-500" },
                  { cause: "Hipertensi dalam Kehamilan", percentage: 24, color: "bg-orange-500" },
                  { cause: "Infeksi", percentage: 11, color: "bg-yellow-500" },
                  { cause: "Penyebab Lainnya", percentage: 37, color: "bg-gray-400" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{item.cause}</span>
                      <span className="text-gray-700 font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white border-pink-200 shadow-lg md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistik Tambahan</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Prevalensi Anemia</p>
                  <p className="text-2xl font-bold text-pink-700">48,9%</p>
                  <p className="text-xs text-gray-600 mt-1">Riskesdas 2018</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Hipertensi Gestasional</p>
                  <p className="text-2xl font-bold text-pink-700">5-10%</p>
                  <p className="text-xs text-gray-600 mt-1">Dari seluruh kehamilan</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Cakupan K4</p>
                  <p className="text-2xl font-bold text-pink-700">95,6%</p>
                  <p className="text-xs text-gray-600 mt-1">Target: 100%</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Sumber:</strong> Kementerian Kesehatan Republik Indonesia, Survei Kesehatan Nasional (Riskesdas), dan Badan Pusat Statistik (BPS). Data diperbarui sesuai publikasi terbaru pemerintah.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Catatan:</strong> Data AKI dapat bervariasi antar provinsi. Konsultasikan dengan dokter atau fasilitas kesehatan untuk informasi lebih lanjut tentang program kesehatan ibu di daerah Anda.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section tambahan dihapus sesuai permintaan */}
    </main>
  )
}
