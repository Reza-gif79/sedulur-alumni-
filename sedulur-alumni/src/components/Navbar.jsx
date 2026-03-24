import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HiMenu, HiX, HiHome, HiCurrencyDollar, HiUsers, HiCalendar, HiPhotograph, HiCreditCard, HiBell } from 'react-icons/hi'
import { useData } from '../context/DataContext'

const navLinks = [
  { name: 'Home', path: '/', icon: HiHome },
  { name: 'Kas Alumni', path: '/kas-alumni', icon: HiCurrencyDollar },
  { name: 'Anggota', path: '/anggota', icon: HiUsers },
  { name: 'Agenda', path: '/agenda', icon: HiCalendar },
  { name: 'Galeri', path: '/galeri', icon: HiPhotograph },
  { name: 'Pembayaran', path: '/pembayaran', icon: HiCreditCard },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()
  const { data } = useData()

  const unreadCount = data?.notifications?.filter(n => !n.read).length || 0

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  const websiteName = data?.website?.name || 'Sedulur Alumni'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-lg">SA</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-xl text-white">{websiteName}</h1>
              <p className="text-xs text-dark-400">Merangkul Masa Depan</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-dark-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary-500/20 rounded-lg border border-primary-500/30"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Donasi Button & Notifications */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors relative"
              >
                <HiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 glass-card p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Notifikasi</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-dark-400 hover:text-white"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                  {data?.notifications?.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {data.notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 rounded-lg ${notif.read ? 'bg-dark-800/50' : 'bg-primary-500/10 border border-primary-500/30'}`}
                        >
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-dark-400 mt-1">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-dark-400">Tidak ada notifikasi</p>
                  )}
                </motion.div>
              )}
            </div>
            
            <Link to="/pembayaran" className="btn-primary text-sm">
              Bayar kas Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-dark-950/95 backdrop-blur-xl"
          >
            <div className="section-container py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500/20 text-white border border-primary-500/30'
                        : 'text-dark-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-white/5">
                <Link
                  to="/pembayaran"
                  onClick={handleLinkClick}
                  className="block w-full btn-primary text-center text-sm"
                >
                  Bayar kas Sekarang
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
