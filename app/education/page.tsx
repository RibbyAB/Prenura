"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, UtensilsCrossed, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EducationPage() {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null)
  const [nutritionData, setNutritionData] = useState<any>(null)
  const [loadingNutrition, setLoadingNutrition] = useState(false)

  const educationArticles = [
    {
      id: 1,
      title: "Nutrisi Penting Selama Postpartum",
      category: "Nutrisi",
      duration: "5 min",
      source: "Panduan WHO & Kementerian Kesehatan RI",
      shortDescription: "Kebutuhan nutrisi yang tepat mendukung pemulihan ibu dan produksi ASI.",
      fullContent: `
        Nutrisi yang adekuat sangat penting untuk pemulihan ibu postpartum dan produksi ASI yang optimal.

        Protein
        - Dibutuhkan untuk pemulihan jaringan dan produksi ASI
        - Sumber: Telur, ikan, daging, tempe, tahu, kacang-kacangan
        - Kebutuhan: 71 gram/hari untuk ibu menyusui

        Zat Besi
        - Mengganti kehilangan darah saat persalinan
        - Mencegah anemia postpartum
        - Sumber: Daging merah, hati ayam, ikan, bayam, kacang-kacangan
        - Kebutuhan: 15-18 mg/hari (dengan suplemen jika diperlukan)

        Kalsium
        - Penting untuk kesehatan tulang ibu dan pertumbuhan bayi
        - Sumber: Susu, yogurt, keju, ikan teri, sayuran hijau
        - Kebutuhan: 1000-1300 mg/hari untuk ibu menyusui

        Asam Folat
        - Tetap penting untuk kesehatan ibu dan bayi
        - Sumber: Sayuran hijau, kacang-kacangan, sereal yang difortifikasi
        - Kebutuhan: 500 mcg/hari

        Vitamin D
        - Penting untuk penyerapan kalsium
        - Sumber: Ikan berlemak, telur, paparan sinar matahari pagi
        - Kebutuhan: 600-800 IU/hari

        Tips: Makan dalam porsi kecil tapi sering (5-6 kali sehari), minum air putih minimal 2-3 liter per hari, hindari makanan pedas berlebihan yang dapat mempengaruhi ASI.
      `,
    },
    {
      id: 2,
      title: "Pemeriksaan Kesehatan Rutin Postpartum",
      category: "Pemeriksaan",
      duration: "6 min",
      source: "ACOG & Kementerian Kesehatan",
      shortDescription: "Jadwal pemeriksaan berkala membantu mendeteksi dini komplikasi postpartum.",
      fullContent: `
        Pemeriksaan berkala sangat penting untuk memastikan pemulihan yang optimal dan mendeteksi komplikasi dini.

        48 Jam Pertama
        - Monitoring perdarahan, tekanan darah, suhu tubuh
        - Evaluasi luka persalinan (jika ada jahitan)
        - Status menyusui dan bonding dengan bayi
        - Frekuensi: Setiap 4-6 jam

        Minggu 1-2
        - Pemeriksaan luka persalinan untuk tanda infeksi
        - Evaluasi perdarahan (lochia)
        - Status emosional dan dukungan keluarga
        - Frekuensi: 1-2 kali kunjungan

        Minggu 3-6
        - Pemeriksaan lengkap: tekanan darah, hemoglobin
        - Evaluasi pemulihan rahim
        - Status laktasi dan masalah menyusui
        - Diskusi kontrasepsi
        - Frekuensi: Minimal 1 kali

        Minggu 6-12
        - Evaluasi kesehatan umum
        - Status psikososial (depresi postpartum)
        - Kembali ke aktivitas normal
        - Frekuensi: 1 kali

        Minggu 12-24
        - Kontrol jangka panjang
        - Evaluasi komplikasi yang mungkin muncul
        - Dukungan kesehatan mental
        - Frekuensi: Sesuai kebutuhan

        Konsultasikan dengan tenaga kesehatan tentang jadwal pemeriksaan yang sesuai dengan kondisi kesehatan Anda.
      `,
    },
    {
      id: 3,
      title: "Mengatasi Keluhan Umum Postpartum",
      category: "Kesehatan",
      duration: "7 min",
      source: "Mayo Clinic & Kementerian Kesehatan RI",
      shortDescription: "Cara mengatasi nyeri, kelelahan, dan keluhan umum setelah melahirkan.",
      fullContent: `
        Banyak ibu postpartum mengalami keluhan umum. Berikut cara mengatasinya:

        Nyeri Perineum/Luka Jahitan
        - Kompres dingin untuk mengurangi bengkak (24-48 jam pertama)
        - Kompres hangat setelah 48 jam untuk meningkatkan sirkulasi
        - Duduk di bantal donat atau bantal empuk
        - Cuci dengan air hangat setelah BAK/BAB
        - Hindari duduk terlalu lama

        Perdarahan Postpartum (Lochia)
        - Normal: Merah terang 3-4 hari, kemudian merah muda, lalu putih/kuning selama 4-6 minggu
        - Gunakan pembalut yang sering diganti
        - Hubungi tenaga kesehatan jika: perdarahan banyak, berbau tidak sedap, atau disertai demam

        Kelelahan
        - Tidur saat bayi tidur
        - Minta bantuan keluarga untuk tugas rumah tangga
        - Makan makanan bergizi dan terhidrasi
        - Batasi tamu di minggu pertama

        Nyeri Payudara (Menyusui)
        - Kompres hangat sebelum menyusui
        - Pastikan posisi menyusui benar
        - Peras sedikit ASI sebelum menyusui jika payudara terlalu penuh
        - Gunakan bra yang nyaman dan supportive

        Sembelit
        - Minum banyak air (2-3 liter/hari)
        - Makan makanan tinggi serat
        - Olahraga ringan (jalan kaki)
        - Konsultasi untuk pelunak feses jika diperlukan

        Kapan Harus Hubungi Dokter
        - Perdarahan banyak atau tiba-tiba meningkat
        - Demam >38°C
        - Nyeri perut parah atau semakin memburuk
        - Tanda infeksi luka (bengkak, merah, bernanah)
        - Kesulitan bernapas atau nyeri dada
        - Perasaan sedih yang berkelanjutan atau pikiran menyakiti diri/bayi
      `,
    },
    {
      id: 4,
      title: "Menyusui: Panduan Lengkap untuk Ibu Baru",
      category: "Menyusui",
      duration: "7 min",
      source: "WHO & La Leche League International",
      shortDescription: "Tips sukses menyusui dan manfaatnya bagi ibu dan bayi.",
      fullContent: `
        Menyusui adalah cara terbaik untuk memberikan nutrisi kepada bayi dan membangun ikatan dengan si kecil.

        Manfaat Menyusui
        Untuk Bayi:
        - Nutrisi lengkap dan sesuai kebutuhan
        - Antibodi untuk melindungi dari infeksi
        - Mengurangi risiko alergi dan asma
        - Menurunkan risiko SIDS (Sudden Infant Death Syndrome)
        - Perkembangan optimal otak dan mata

        Untuk Ibu:
        - Membantu rahim kembali ke ukuran normal
        - Mengurangi perdarahan postpartum
        - Menurunkan risiko kanker payudara dan ovarium
        - Pemberian jarak alami antara kehamilan
        - Ikatan emosional dengan bayi

        Teknik Menyusui yang Benar
        - Posisi: Bayi seharusnya menghadap ibu dengan mulut sejajar dengan puting
        - Hisapan: Bayi harus menghisap areola (bagian gelap di sekitar puting)
        - Frekuensi: Menyusui 8-12 kali per hari untuk bayi baru lahir
        - Tanda bayi cukup ASI: Popok basah, BAB berkala, berat badan naik

        Mengatasi Masalah Menyusui
        - Puting sakit: Periksa posisi, gunakan lanolin, warm compress
        - Payudara bengkak: Kompres hangat, menyusui lebih sering
        - Mastitis: Infeksi payudara, butuh antibiotik dari dokter
        - Puting datar/masuk: Gunakan breast shield, peras ASI sebelum menyusui
        - ASI sedikit: Menyusui lebih sering, tetap terhidrasi, istirahat cukup

        Produksi ASI
        - Supply mengikuti demand: Semakin sering menyusui, semakin banyak ASI
        - Hindari susu formula terlalu dini kecuali ada indikasi medis
        - Makanan yang meningkatkan ASI: Oatmeal, kacang-kacangan, sayuran hijau
        - Tetap terhidrasi: Minum minimal 2-3 liter air per hari

        Lamanya Menyusui
        - WHO merekomendasikan ASI eksklusif hingga 6 bulan
        - Dilanjutkan dengan makanan pendamping sampai 2 tahun atau lebih
        - Berhenti menyusui secara bertahap untuk mencegah komplikasi
      `,
    },
    {
      id: 5,
      title: "Kesehatan Mental Postpartum",
      category: "Kesehatan Mental",
      duration: "8 min",
      source: "RCOG & Kementerian Kesehatan",
      shortDescription: "Mengenali dan mengatasi baby blues dan depresi postpartum.",
      fullContent: `
        Perubahan emosional setelah melahirkan adalah hal yang normal, tetapi penting untuk mengenali tanda-tanda yang memerlukan bantuan profesional.

        Baby Blues (Normal)
        - Terjadi pada 50-80% ibu baru
        - Gejala: Perubahan mood, mudah menangis, kecemasan ringan
        - Durasi: 2-3 minggu pertama setelah melahirkan
        - Penanganan: Dukungan keluarga, istirahat cukup, komunikasi dengan pasangan

        Depresi Postpartum
        - Terjadi pada 10-15% ibu baru
        - Gejala: Perasaan sedih yang berkelanjutan, kehilangan minat, kelelahan ekstrem, kesulitan bonding dengan bayi
        - Durasi: Dapat berlangsung berbulan-bulan jika tidak ditangani
        - Penanganan: Konseling, terapi, atau obat-obatan (dengan resep dokter)

        Tanda-Tanda Perlu Bantuan Profesional
        - Perasaan sedih atau cemas yang berlangsung lebih dari 2 minggu
        - Kesulitan merawat diri sendiri atau bayi
        - Pikiran menyakiti diri sendiri atau bayi
        - Kehilangan minat pada aktivitas yang biasanya disukai
        - Perubahan pola tidur atau makan yang ekstrem
        - Perasaan tidak berharga atau bersalah yang berlebihan

        Cara Mendapatkan Bantuan
        - Bicara dengan dokter kandungan atau tenaga kesehatan
        - Konsultasi dengan psikolog atau psikiater
        - Bergabung dengan kelompok dukungan ibu postpartum
        - Hotline kesehatan mental: 119 (ext. 8) atau 021-500-454

        Dukungan Keluarga
        - Suami dan keluarga berperan penting dalam pemulihan
        - Bantu dengan tugas rumah tangga dan perawatan bayi
        - Dengarkan dan dukung tanpa menghakimi
        - Dorong ibu untuk istirahat dan merawat diri

        Ingat: Meminta bantuan adalah tanda kekuatan, bukan kelemahan. Kesehatan mental ibu sama pentingnya dengan kesehatan fisik.
      `,
    },
  ]

  const getPersonalizedNutrition = async () => {
    setLoadingNutrition(true)
    try {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const pregnancyData = user?.pregnancyData || {}

      // Ambil data kesehatan terbaru dari dashboard user (jika ada)
      let latestHealth: any = null
      if (user?.id) {
        try {
          const res = await fetch(`/api/data-kesehatan/list?ibu_hamil_id=${user.id}`)
          const data = await res.json()
          if (data.success && data.data.length > 0) {
            latestHealth = data.data[0]
          }
        } catch (err) {
          console.warn("Gagal memuat data kesehatan terbaru, gunakan fallback nutrisi.")
        }
      }

      const hemoglobin = latestHealth?.hemoglobin ?? pregnancyData?.hemoglobin ?? null
      const tekananSistol = latestHealth?.tekanan_darah_sistolik
      const tekananDiastol = latestHealth?.tekanan_darah_diastolik
      const beratBadan = latestHealth?.berat_badan ?? pregnancyData?.beratBadan ?? null
      const mood = latestHealth?.mood ?? pregnancyData?.mood ?? null
      const energi = latestHealth?.energi ?? pregnancyData?.energi ?? null
      const kondisiKesehatan =
        hemoglobin !== null && hemoglobin < 11
          ? "Anemia, mudah lelah"
          : energi || mood
            ? `${mood || "Mood baik"}, energi ${energi || "cukup"}`
            : "Baik"
      const defisiensiNutrisi = hemoglobin !== null && hemoglobin < 11 ? ["Zat besi"] : []
      
      if (!latestHealth && !pregnancyData?.hemoglobin && !pregnancyData?.beratBadan && !pregnancyData?.mood && !pregnancyData?.energi) {
        setNutritionData({ error: "masukkan data dahulu di dashboard" })
        return
      }

      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mingguPostpartum: pregnancyData.mingguPostpartum || 0,
          menyusui: true,
          kondisiKesehatan,
          defisiensiNutrisi,
          preferensiMakanan: ["Makanan Indonesia"],
          ketersediaanLokal: ["Ikan", "Sayuran hijau", "Tempe", "Tahu"],
          biomarker: {
            hemoglobin,
            tekananDarah: tekananSistol && tekananDiastol ? `${tekananSistol}/${tekananDiastol}` : null,
            beratBadan,
            mood,
            energi,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNutritionData(data)
      } else {
        throw new Error("Failed to fetch nutrition data")
      }
    } catch (error) {
      console.error("Error fetching nutrition:", error)
      setNutritionData({
        dailyMealPlan: {
          sarapan: { menu: "Oat + telur rebus + pisang", porsi: "1 porsi", nutrisi: ["Protein", "Serat", "Zat besi"] },
          makanSiang: { menu: "Nasi merah + ikan kembung + bayam", porsi: "1 porsi", nutrisi: ["Protein", "Zat besi"] },
          makanMalam: { menu: "Sup ayam + tahu kukus + pepaya", porsi: "1 porsi", nutrisi: ["Protein", "Vitamin"] },
          camilan: ["Kacang rebus", "Jus jambu tanpa gula"],
        },
        shoppingList: ["Oat", "Telur", "Ikan kembung", "Bayam", "Nasi merah", "Tahu"],
        tips: [
          "Minum air 2-3 liter per hari",
          "Kombinasikan zat besi dengan vitamin C",
          "Batasi kopi/teh agar penyerapan besi optimal",
        ],
      })
    } finally {
      setLoadingNutrition(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-pink-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Edukasi Kesehatan Postpartum</h1>
          <p className="text-gray-600 text-lg">
            Panduan lengkap berdasarkan jurnal terpercaya dari WHO, ACOG, CDC, dan Kementerian Kesehatan RI
          </p>
        </div>
      </section>

      {/* Personalized Nutrition Section */}
      <section className="py-8 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-pink-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-6 h-6 text-pink-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Rekomendasi Nutrisi Personal</h2>
                  <p className="text-sm text-gray-600">Dapatkan rekomendasi menu harian berdasarkan kondisi Anda</p>
                </div>
              </div>
              <Button
                onClick={getPersonalizedNutrition}
                disabled={loadingNutrition}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                {loadingNutrition ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Dapatkan Rekomendasi"
                )}
              </Button>
            </div>

            {nutritionData?.error && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertDescription>{nutritionData.error}</AlertDescription>
              </Alert>
            )}

            {nutritionData && !nutritionData.error && (
              <div className="mt-6 space-y-4">
                {nutritionData.dailyMealPlan && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Rencana Makan Harian</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {["sarapan", "makanSiang", "makanMalam"].map((meal) => {
                        const mealData = nutritionData.dailyMealPlan[meal]
                        if (!mealData) return null
                        return (
                          <Card key={meal} className="p-4 bg-pink-50 border-pink-200">
                            <h4 className="font-semibold text-gray-900 mb-2 capitalize">{meal}</h4>
                            <p className="text-sm font-medium text-gray-800 mb-1">{mealData.menu}</p>
                            <p className="text-xs text-gray-600 mb-2">{mealData.porsi}</p>
                            <div className="flex flex-wrap gap-1">
                              {mealData.nutrisi?.map((nut: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-white">
                                  {nut}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                    {nutritionData.dailyMealPlan.camilan && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Camilan</h4>
                        <div className="flex flex-wrap gap-2">
                          {nutritionData.dailyMealPlan.camilan.map((snack: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-pink-50 text-pink-700">
                              {snack}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {nutritionData.shoppingList && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Daftar Belanja</h3>
                    <div className="flex flex-wrap gap-2">
                      {nutritionData.shoppingList.map((item: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {nutritionData.tips && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tips Nutrisi</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {nutritionData.tips.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {nutritionData?.error && (
              <Alert className="bg-red-50 border-red-200 text-red-800 mt-4">
                <AlertDescription>{nutritionData.error}</AlertDescription>
              </Alert>
            )}
          </Card>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {educationArticles.map((article) => (
              <Card
                key={article.id}
                className="border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer overflow-hidden"
                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                          {article.category}
                        </Badge>
                        <span className="text-sm text-gray-500">{article.duration}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{article.title}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        expandedArticle === article.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <p className="text-gray-600 mb-3">{article.shortDescription}</p>
                  <p className="text-sm text-gray-500 mb-3">Sumber: {article.source}</p>

                  {/* Expanded Content */}
                  {expandedArticle === article.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                        {article.fullContent}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <Card className="mt-8 bg-blue-50 border-blue-200 p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Disclaimer Penting</h4>
            <p className="text-blue-800 text-sm">
              Informasi di halaman ini adalah untuk tujuan edukasi dan tidak menggantikan konsultasi dengan profesional
              kesehatan. Setiap ibu postpartum memiliki kondisi unik yang memerlukan penanganan khusus. Selalu
              konsultasikan dengan tenaga kesehatan sebelum mengambil keputusan kesehatan. Jika Anda mengalami
              gejala yang mengkhawatirkan, segera hubungi layanan kesehatan terdekat.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
