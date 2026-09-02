"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Home, MessageCircle, BookOpen, Hospital, Menu, X, Settings, Bell, AlertTriangle } from "lucide-react"

export default function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard/ibu-hamil", label: "Dashboard", icon: Home },
    { href: "/chatbot", label: "Chatbot", icon: MessageCircle },
    { href: "/education", label: "Edukasi", icon: BookOpen },
    { href: "/notifications", label: "Notifikasi", icon: Bell },
    { href: "/emergency", label: "Darurat", icon: AlertTriangle },
    { href: "/hospitals", label: "Rumah Sakit", icon: Hospital },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-pink-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-6 transition-transform duration-300 z-30 md:z-0`}
      >
        {/* Logo - Left aligned */}
        <Link href="/" className="flex items-center mb-6 pb-6 border-b border-gray-200 w-full">
          <img 
            src="/prenura-logo.png" 
            alt="Prenura" 
            className="h-28 md:h-32 w-full max-w-full object-contain" 
            style={{ objectFit: 'contain' }}
          />
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href) ? "bg-pink-100 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
