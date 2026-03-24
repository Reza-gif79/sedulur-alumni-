import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiMenuAlt1,
  HiHome,
  HiUserGroup,
  HiCalendar,
  HiPhotograph,
  HiCreditCard,
  HiCurrencyDollar,
  HiCog,
  HiLogout,
  HiChevronLeft,
  HiChevronRight,
  HiUsers,
} from 'react-icons/hi'
import { FaGraduationCap, FaWhatsapp } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: HiHome },
  { name: 'Anggota', path: '/admin/anggota', icon: HiUserGroup },
  { name: 'Agenda', path: '/admin/agenda', icon: HiCalendar },
  { name: 'Galeri', path: '/admin/galeri', icon: HiPhotograph },
  { name: 'Pembayaran', path: '/admin/pembayaran', icon: HiCreditCard },
  { name: 'Kas', path: '/admin/kas', icon: HiCurrencyDollar },
  { name: 'WA Reminder', path: '/admin/whatsapp', icon: FaWhatsapp },
  { name: 'Users', path: '/admin/users', icon: HiUsers },
]

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        className="fixed left-0 top-0 h-screen bg-dark-900 border-r border-white/5 z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center flex-shrink-0">
              <FaGraduationCap className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-display font-bold text-white text-lg">Sedulur</h1>
                <p className="text-xs text-dark-500">Admin Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path))
            const Icon = item.icon
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                  isActive
                    ? 'bg-primary-500/20 text-white'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <HiCog className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium text-sm">Pengaturan</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <HiLogout className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? (
            <HiChevronRight className="w-4 h-4" />
          ) : (
            <HiChevronLeft className="w-4 h-4" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
      >
        {/* Top Bar */}
        <header className="h-20 bg-dark-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-sm text-dark-400">Kelola semua konten website</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white transition-colors"
            >
              Lihat Website
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
