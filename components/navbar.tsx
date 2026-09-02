"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Heart, ChevronDown, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const user = loggedIn ? JSON.parse(localStorage.getItem("user") || "{}") : null
    setIsLoggedIn(loggedIn)
    setUserData(user)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    sessionStorage.clear()
    setIsLoggedIn(false)
    setUserData(null)
    router.push("/auth/login")
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/chatbot", label: "Chatbot AI" },
    { href: "/education", label: "Edukasi" },
    { href: "/hospitals", label: "Rumah Sakit" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/prenura-logo.png" 
              alt="Prenura" 
              className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto" 
              style={{ objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-pink-600 transition-colors font-medium text-sm lg:text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-gray-600 hover:text-pink-600" aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-pink-200 text-gray-700 hover:bg-pink-50 transition-colors font-medium text-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                      {userData.nama ? userData.nama.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span>{userData.nama || "User"}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/ibu-hamil" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-pink-200 text-gray-700 hover:bg-pink-50 transition-colors font-medium text-sm"
                >
                  Login / Daftar
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-pink-200 rounded-lg shadow-lg z-50">
                    <Link
                      href="/auth/login"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-pink-50 text-sm rounded-lg"
                    >
                      Masuk / Daftar
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-pink-100 py-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-pink-600 px-2 py-2 font-medium text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-pink-100 pt-3 flex flex-col gap-2">
                {isLoggedIn && userData ? (
                  <>
                    <Link href="/dashboard/ibu-hamil" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Dashboard</Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full border-pink-200 text-gray-700 bg-transparent"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    >
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Masuk / Daftar</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
