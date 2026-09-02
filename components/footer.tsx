import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-foreground/5 border-t border-border py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-semibold text-foreground">Prenura</span>
            </div>
            <p className="text-sm text-foreground/70">
              Platform kesehatan ibu hamil berbasis AI dengan dukungan komunitas.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Fitur Utama
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Harga
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Keamanan
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Sumber Daya</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Panduan Pengguna
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Syarat Layanan
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                  Kontak
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
          <p>© 2025 Prenura. Semua hak dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart size={16} className="text-accent" /> untuk kesehatan ibu
          </p>
        </div>
      </div>
    </footer>
  )
}
