import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import { 
  HiUserGroup, 
  HiCurrencyDollar, 
  HiCalendar, 
  HiPhotograph,
  HiCreditCard,
  HiArrowUp,
  HiArrowDown,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiPlus,
  HiChat,
  HiSearch,
} from 'react-icons/hi'
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useData } from '../../context/DataContext'
import { HiCheck, HiX } from 'react-icons/hi'

// Note: React automatically escapes content rendered via {children}
// No custom sanitization needed for text content - dangerous if using dangerouslySetInnerHTML
// Data is already sanitized in DataContext.jsx before storage

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
}

export default function Dashboard() {
  const location = useLocation()
  const path = location.pathname

  useData() // Initialize data context

  // Determine which section to show based on URL
  const getSection = () => {
    if (path.includes('/anggota')) return 'anggota'
    if (path.includes('/agenda')) return 'agenda'
    if (path.includes('/galeri')) return 'galeri'
    if (path.includes('/pembayaran')) return 'pembayaran'
    if (path.includes('/kas')) return 'kas'
    if (path.includes('/whatsapp')) return 'whatsapp'
    if (path.includes('/settings')) return 'settings'
    return 'overview'
  }

  const section = getSection()

  // Render different content based on section
  const renderContent = () => {
    switch (section) {
      case 'anggota':
        return <AnggotaSection />
      case 'agenda':
        return <AgendaSection />
      case 'galeri':
        return <GaleriSection />
      case 'pembayaran':
        return <PembayaranSection />
      case 'kas':
        return <KasSection />
      case 'whatsapp':
        return <WhatsAppReminderSection />
      case 'settings':
        return <SettingsSection />
      default:
        return <OverviewSection />
    }
  }

  return renderContent()
}

function OverviewSection() {
  const { data, updatePayment, addNotification } = useData()
  
  // Handle payment verification
  const handleVerifyPayment = (payment) => {
    updatePayment(payment.id, { status: 'verified' })
    addNotification({
      type: 'success',
      title: 'Pembayaran Diverifikasi',
      message: `Pembayaran dari ${payment.name} sebesar ${formatCurrency(payment.amount)} telah diverifikasi`,
      paymentId: payment.id
    })
  }

  // Handle payment rejection
  const handleRejectPayment = (payment) => {
    updatePayment(payment.id, { status: 'failed' })
    addNotification({
      type: 'error',
      title: 'Pembayaran Ditolak',
      message: `Pembayaran dari ${payment.name} telah ditolak`,
      paymentId: payment.id
    })
  }

  // Calculate stats from real data
  const totalAlumni = data?.alumni?.length || 0
  const totalPayments = data?.payments?.length || 0
  const totalAgendas = data?.agendas?.length || 0
  const activeAgendas = data?.agendas?.filter(a => a.active).length || 0
  
  // Calculate total income from payments
  const totalIncome = data?.payments?.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0) || 0
  
  // Get recent payments (last 5)
  const recentPayments = data?.payments?.slice(-5).reverse() || []
  
  // Payment status data
  const paymentStatusData = [
    { name: 'Lunas', value: data?.payments?.filter(p => p.status === 'verified').length || 0, color: '#22c55e' },
    { name: 'Pending', value: data?.payments?.filter(p => p.status === 'pending').length || 0, color: '#f59e0b' },
    { name: 'Gagal', value: data?.payments?.filter(p => p.status === 'failed').length || 0, color: '#ef4444' },
  ]

  // Monthly income data (last 6 months)
  const monthlyIncomeData = getMonthlyData(data?.payments || [])

  const stats = [
    { label: 'Total Alumni', value: totalAlumni.toString(), change: `${totalAlumni} anggota`, trend: 'up', icon: HiUserGroup, color: 'primary' },
    { label: 'Kas Terkelola', value: formatCurrency(totalIncome), change: `${totalPayments} pembayaran`, trend: 'up', icon: HiCurrencyDollar, color: 'green' },
    { label: 'Agenda Aktif', value: activeAgendas.toString(), change: `${totalAgendas} total`, trend: 'up', icon: HiCalendar, color: 'purple' },
    { label: 'Pembayaran Pending', value: (data?.payments?.filter(p => p.status === 'pending').length || 0).toString(), change: 'menunggu verifikasi', trend: 'down', icon: HiCreditCard, color: 'amber' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            primary: 'bg-primary-500/20 text-primary-400',
            green: 'bg-green-500/20 text-green-400',
            purple: 'bg-accent-purple/20 text-accent-purple',
            amber: 'bg-amber-500/20 text-amber-400',
          }
          
          return (
            <motion.div key={stat.label} variants={itemVariants} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <HiArrowUp className="w-4 h-4" />
                  ) : (
                    <HiArrowDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-dark-400">{stat.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Pemasukan per Bulan</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyIncomeData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value / 1000000}jt`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Status Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Status Pembayaran</h3>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {paymentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-dark-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Payments & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pembayaran Terbaru</h3>
            <Link to="/admin/pembayaran" className="text-sm text-primary-400 hover:text-primary-300">Lihat Semua</Link>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payment.status === 'verified' ? (
                        <HiCheckCircle className="w-5 h-5" />
                      ) : payment.status === 'pending' ? (
                        <HiClock className="w-5 h-5" />
                      ) : (
                        <HiExclamationCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{payment.name}</div>
                      <div className="text-sm text-dark-400">{payment.month} {payment.year}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{formatCurrency(payment.amount)}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payment.status === 'verified' ? 'Lunas' : payment.status === 'pending' ? 'Pending' : 'Gagal'}
                    </span>
                    {payment.status === 'pending' && (
                      <div className="flex gap-1 mt-2 justify-end">
                        <button
                          onClick={() => handleVerifyPayment(payment)}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Verifikasi"
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectPayment(payment)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Tolak"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-400">
              <HiCreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada pembayaran</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Aksi Cepat</h3>
          <div className="space-y-3">
            <Link to="/admin/anggota" className="w-full p-4 rounded-xl bg-primary-500/20 border border-primary-500/30 text-left hover:bg-primary-500/30 transition-colors">
              <div className="font-medium text-white">Tambah Alumni</div>
              <div className="text-sm text-dark-400">Daftarkan anggota baru</div>
            </Link>
            <Link to="/admin/agenda" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors">
              <div className="font-medium text-white">Buat Agenda</div>
              <div className="text-sm text-dark-400">Jadwalkan kegiatan</div>
            </Link>
            <Link to="/admin/galeri" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors">
              <div className="font-medium text-white">Upload Foto</div>
              <div className="text-sm text-dark-400">Tambah ke galeri</div>
            </Link>
            <Link to="/admin/pembayaran" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors">
              <div className="font-medium text-white">Verifikasi Pembayaran</div>
              <div className="text-sm text-dark-400">{paymentStatusData[1].value} pembayaran pending</div>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Helper function to get monthly data
function getMonthlyData(payments) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const result = []
  
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    const monthPayments = payments.filter(p => {
      const paymentMonth = months.indexOf(p.month)
      return paymentMonth === monthIndex
    })
    const income = monthPayments.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0)
    result.push({ month: months[monthIndex], income })
  }
  
  return result
}

function AnggotaSection() {
  const { data, addAlumni } = useData()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    graduationYear: '',
    major: '',
    address: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addAlumni({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      graduationYear: parseInt(formData.graduationYear) || null,
      major: formData.major,
      address: formData.address
    })
    setShowModal(false)
    setFormData({ name: '', email: '', phone: '', graduationYear: '', major: '', address: '' })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kelola Alumni</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" />
          Tambah Alumni
        </button>
      </div>
      
      {/* Add Alumni Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Tambah Alumni</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="+628xxxxxxx"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Tahun Lulus</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="input-field w-full"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Jurusan</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="input-field w-full"
                    placeholder="IPA/IPS"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Alamat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field w-full"
                  placeholder="Alamat"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-dark-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {data?.alumni?.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Nama</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Telepon</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Tahun Lulus</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Jurusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {data.alumni.map((alumni) => (
                <tr key={alumni.id} className="hover:bg-dark-800/30">
                  <td className="px-6 py-4 text-white">{alumni.name}</td>
                  <td className="px-6 py-4 text-dark-400">{alumni.email || '-'}</td>
                  <td className="px-6 py-4 text-dark-400">{alumni.phone || '-'}</td>
                  <td className="px-6 py-4 text-dark-400">{alumni.graduationYear || '-'}</td>
                  <td className="px-6 py-4 text-dark-400">{alumni.major || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiUserGroup className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Alumni</h3>
          <p className="text-dark-400 mb-6">Tambahkan alumni pertama Anda untuk memulai</p>
          <button className="btn-primary inline-flex items-center gap-2">
            <HiPlus className="w-5 h-5" />
            Tambah Alumni
          </button>
        </div>
      )}
    </motion.div>
  )
}

function AgendaSection() {
  const { data, addAgenda } = useData()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'monthly'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addAgenda({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      type: formData.type,
      active: true
    })
    setShowModal(false)
    setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'monthly' })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kelola Agenda</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" />
          Tambah Agenda
        </button>
      </div>

      {/* Add Agenda Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Tambah Agenda</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Judul</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="Judul agenda"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows={2}
                  placeholder="Deskripsi agenda"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Waktu</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field w-full"
                  placeholder="Lokasi"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-dark-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {data?.agendas?.length > 0 ? (
        <div className="grid gap-4">
          {data.agendas.map((agenda) => (
            <div key={agenda.id} className="glass-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{agenda.title}</h3>
                <p className="text-dark-400">{agenda.date} • {agenda.time} • {agenda.location}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                agenda.active ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-400'
              }`}>
                {agenda.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiCalendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Agenda</h3>
          <p className="text-dark-400 mb-6">Buat agenda kegiatan pertama Anda</p>
          <button className="btn-primary inline-flex items-center gap-2">
            <HiPlus className="w-5 h-5" />
            Tambah Agenda
          </button>
        </div>
      )}
    </motion.div>
  )
}

function GaleriSection() {
  const { data, addGalleryItem } = useData()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    image: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar')
        return
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB')
        return
      }
      
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result })
        setImagePreview(reader.result)
        setIsUploading(false)
      }
      reader.onerror = () => {
        alert('Gagal membaca file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.image) {
      alert('Mohon pilih gambar')
      return
    }
    addGalleryItem({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: formData.image
    })
    setShowModal(false)
    setFormData({ title: '', description: '', category: 'general', image: '' })
    setImagePreview('')
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kelola Galeri</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" />
          Tambah Foto
        </button>
      </div>

      {/* Add Gallery Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Tambah Foto Galeri</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Judul</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="Judul foto"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows={2}
                  placeholder="Deskripsi foto"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="general">Umum</option>
                  <option value="event">Acara</option>
                  <option value="reunion">Reuni</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Gambar</label>
                <div className="border-2 border-dashed border-dark-600 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="gallery-image-upload"
                  />
                  <label htmlFor="gallery-image-upload" className="cursor-pointer">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mb-2"></div>
                        <span className="text-dark-400">Mengunggah...</span>
                      </div>
                    ) : imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                        <p className="text-dark-400 text-sm mt-2">Klik untuk ganti gambar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <HiPhotograph className="w-12 h-12 text-dark-500 mb-2" />
                        <span className="text-dark-400">Klik untuk upload gambar</span>
                        <span className="text-dark-600 text-xs mt-1">Maksimal 2MB (JPG, PNG, GIF)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-dark-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {data?.gallery?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.gallery.map((item) => (
            <div key={item.id} className="glass-card p-2">
              <div className="aspect-square bg-dark-800 rounded-lg mb-2 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiPhotograph className="w-12 h-12 text-dark-600" />
                  </div>
                )}
              </div>
              <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiPhotograph className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Galeri Kosong</h3>
          <p className="text-dark-400 mb-6">Tambahkan foto kenangan alumni</p>
          <button className="btn-primary inline-flex items-center gap-2">
            <HiPlus className="w-5 h-5" />
            Tambah Foto
          </button>
        </div>
      )}
    </motion.div>
  )
}

function PembayaranSection() {
  const { data, addPayment, updatePayment, getPaymentMethods } = useData()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    month: '',
    year: new Date().getFullYear().toString(),
    method: '',
    status: 'verified',
    note: ''
  })
  const [success, setSuccess] = useState('')

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const paymentMethods = getPaymentMethods()

  const handleSubmit = (e) => {
    e.preventDefault()
    addPayment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      amount: parseInt(formData.amount),
      month: formData.month,
      year: parseInt(formData.year),
      method: formData.method,
      status: formData.status,
      note: formData.note
    })
    setSuccess('Pembayaran berhasil ditambahkan')
    setShowModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      amount: '',
      month: '',
      year: new Date().getFullYear().toString(),
      method: '',
      status: 'verified',
      note: ''
    })
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleVerify = (payment) => {
    updatePayment(payment.id, { status: 'verified' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kelola Pembayaran</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" />
          Tambah Pembayaran
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400"
        >
          {success}
        </motion.div>
      )}

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Tambah Pembayaran</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/10"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Nama</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Nama alumni"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="+628xxxxxxx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field w-full"
                  placeholder="50000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Bulan</label>
                  <select
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="">Pilih Bulan</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Tahun</label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="input-field w-full"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Metode Pembayaran</label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Pilih Metode</option>
                  {paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name}>{pm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="verified">Lunas</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Gagal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Catatan</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="input-field w-full"
                  rows={2}
                  placeholder="Catatan (opsional)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-dark-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Nama</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Bulan/Tahun</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Jumlah</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-dark-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {data?.payments?.map((payment) => (
              <tr key={payment.id} className="hover:bg-dark-800/30">
                <td className="px-6 py-4 text-white">{payment.name}</td>
                <td className="px-6 py-4 text-dark-400">{payment.month} {payment.year}</td>
                <td className="px-6 py-4 text-white font-medium">{formatCurrency(payment.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    payment.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                    payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {payment.status === 'verified' ? 'Lunas' : payment.status === 'pending' ? 'Pending' : 'Gagal'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {payment.status === 'pending' ? (
                    <button 
                      onClick={() => handleVerify(payment)}
                      className="text-primary-400 hover:text-primary-300 text-sm"
                    >
                      Verifikasi
                    </button>
                  ) : payment.status === 'failed' ? (
                    <button 
                      onClick={() => handleVerify(payment)}
                      className="text-amber-400 hover:text-amber-300 text-sm"
                    >
                      Aktifkan
                    </button>
                  ) : (
                    <span className="text-dark-500 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
            {(!data?.payments || data.payments.length === 0) && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-dark-400">
                  <HiCreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada pembayaran</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// WhatsApp Reminder Section - AI-powered reminder for unpaid dues
function WhatsAppReminderSection() {
  const { data } = useData()
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [unpaidAlumni, setUnpaidAlumni] = useState([])
  
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]
  
  // Find unpaid alumni for selected month/year
  const findUnpaidAlumni = () => {
    if (!selectedMonth) return
    
    const paidPayments = data?.payments?.filter(
      p => p.month === selectedMonth && 
           parseInt(p.year) === parseInt(selectedYear) && 
           (p.status === 'verified' || p.status === 'pending')
    ) || []
    
    const paidNames = paidPayments.map(p => p.name.toLowerCase())
    
    const unpaid = data?.alumni?.filter(
      a => !paidNames.includes(a.name.toLowerCase())
    ) || []
    
    setUnpaidAlumni(unpaid)
  }
  
  // Generate AI reminder message
  const generateReminderMessage = (alumni) => {
    const amount = data?.website?.monthlyFee || 50000
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
    
    return `Halo ${alumni.name}! 👋

Saya dari Tim Seduulur Alumni ingin mengingatkan bahwa iuran kas bulan ${selectedMonth} sebesar ${formattedAmount} belum kami terima. 

Bantuan Anda sangat berarti untuk keberlangsungan acara-alumni kita. 

Silakan melakukan pembayaran melalui informasi yang tersedia di website.

Terima kasih atas perhatiannya! 🙏

Salam hangat,
Tim Seduulur Alumni`
  }
  
  // Open WhatsApp with pre-filled message
  const sendWhatsAppReminder = (alumni) => {
    if (!alumni.phone) {
      alert('Nomor WhatsApp alumni tidak tersedia')
      return
    }
    
    const message = generateReminderMessage(alumni)
    const phoneNumber = alumni.phone.replace(/[^0-9]/g, '')
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }
  
  // Send to all unpaid alumni
  const sendBulkReminders = () => {
    unpaidAlumni.forEach(alumni => {
      if (alumni.phone) {
        const message = generateReminderMessage(alumni)
        const phoneNumber = alumni.phone.replace(/[^0-9]/g, '')
        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(waUrl, '_blank')
      }
    })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaWhatsapp className="text-green-400" />
          AI WhatsApp Reminder
        </h2>
      </div>
      
      {/* Info Card */}
      <div className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <HiChat className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Kirim Pengingat Pembayaran</h3>
            <p className="text-dark-400 text-sm">
              AI akan menghasilkan pesan pengingat yang sopan untuk alumni yang belum membayar iuran. 
              Pesan akan dikirim melalui WhatsApp dengan format yang menarik.
            </p>
          </div>
        </div>
      </div>
      
      {/* Month/Year Selection */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pilih Bulan dan Tahun</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-dark-300 mb-2">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Pilih Bulan</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input-field w-full"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={findUnpaidAlumni}
          disabled={!selectedMonth}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiSearch className="w-5 h-5 mr-2" />
          Cari Alumni Belum Bayar
        </button>
      </div>
      
      {/* Unpaid Alumni List */}
      {unpaidAlumni.length > 0 && (
        <>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Alumni Belum Bayar ({unpaidAlumni.length})</h3>
                <p className="text-dark-400 text-sm">Bulan {selectedMonth} {selectedYear}</p>
              </div>
              <button
                onClick={sendBulkReminders}
                className="btn-primary flex items-center gap-2"
              >
                <FaWhatsapp className="w-4 h-4" />
                Kirim Semua
              </button>
            </div>
            
            <div className="space-y-3">
              {unpaidAlumni.map((alumni) => (
                <div key={alumni.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <HiExclamationCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{alumni.name}</div>
                      <div className="text-sm text-dark-400">{alumni.phone || 'Tidak ada nomor'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => sendWhatsAppReminder(alumni)}
                    disabled={!alumni.phone}
                    className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    Kirim
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Preview Message */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preview Pesan</h3>
            <div className="bg-dark-800/50 p-4 rounded-xl text-dark-300 text-sm whitespace-pre-wrap font-mono">
              {unpaidAlumni.length > 0 ? generateReminderMessage(unpaidAlumni[0]) : 'Pilih bulan dan tahun terlebih dahulu'}
            </div>
          </div>
        </>
      )}
      
      {selectedMonth && unpaidAlumni.length === 0 && (
        <div className="glass-card p-6 text-center">
          <HiCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Semua Alumni Sudah Bayar!</h3>
          <p className="text-dark-400">Tidak ada alumni yang belum membayar untuk bulan {selectedMonth} {selectedYear}</p>
        </div>
      )}
    </motion.div>
  )
}

function KasSection() {
  const { data } = useData()
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [reportSent, setReportSent] = useState(false)
  
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const totalIncome = data?.payments?.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0) || 0
  
  // Get monthly data
  const getMonthlyPayments = () => {
    if (!selectedMonth) return []
    return data?.payments?.filter(p => 
      p.month === selectedMonth && 
      parseInt(p.year) === parseInt(selectedYear)
    ) || []
  }

  const monthlyPayments = getMonthlyPayments()
  const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0)
  const verifiedCount = monthlyPayments.filter(p => p.status === 'verified').length
  const pendingCount = monthlyPayments.filter(p => p.status === 'pending').length

  // Generate report message
  const generateReportMessage = () => {
    const monthName = selectedMonth || 'Bulan Ini'
    return `📊 *LAPORAN KEUANGAN BULANAN*
━━━━━━━━━━━━━━━━━━

🏛️ *Sedulur Alumni*
📅 Bulan: ${monthName} ${selectedYear}

💰 *Ringkasan Pemasukan:*
• Total Pemasukan: ${formatCurrency(monthlyTotal)}
• Pembayaran Lunas: ${verifiedCount}
• Pembayaran Pending: ${pendingCount}

💵 *Total Kas Kumulatif:* ${formatCurrency(totalIncome)}

📋 *Detail Pembayaran:*
${monthlyPayments.map(p => `• ${p.name}: ${formatCurrency(p.amount)} (${p.status === 'verified' ? '✅ Lunas' : '⏳ Pending'})`).join('\n') || 'Tidak ada pembayaran'}

━━━━━━━━━━━━━━━━━━
_Laporan ini dikirim secara otomatis oleh sistem_`
  }

  const sendWhatsAppReport = () => {
    const message = generateReportMessage()
    const phone = data?.contact?.whatsapp?.replace(/[^0-9]/g, '') || ''
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
      setReportSent(true)
      setTimeout(() => setReportSent(false), 3000)
    }
  }

  const sendEmailReport = () => {
    const subject = `Laporan Keuangan Bulan ${selectedMonth} ${selectedYear} - Sedulur Alumni`
    const body = `Laporan Keuangan Bulanan

Bulan: ${selectedMonth} ${selectedYear}

Ringkasan Pemasukan:
- Total Pemasukan: ${formatCurrency(monthlyTotal)}
- Pembayaran Lunas: ${verifiedCount}
- Pembayaran Pending: ${pendingCount}

Total Kas Kumulatif: ${formatCurrency(totalIncome)}

Detail Pembayaran:
${monthlyPayments.map(p => `- ${p.name}: ${formatCurrency(p.amount)} (${p.status === 'verified' ? 'Lunas' : 'Pending'})`).join('\n') || 'Tidak ada pembayaran'}

---
Laporan ini dikirim secara otomatis oleh sistem Sedulur Alumni`
    
    const email = data?.contact?.email || ''
    if (email) {
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
      setReportSent(true)
      setTimeout(() => setReportSent(false), 3000)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Kelola Kas</h2>
        <button 
          onClick={() => setShowReportModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <HiCalendar className="w-5 h-5" />
          Kirim Laporan
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="text-dark-400 text-sm mb-1">Total Pemasukan</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-dark-400 text-sm mb-1">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-red-400">Rp 0</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-dark-400 text-sm mb-1">Saldo Kas</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Kirim Laporan Keuangan</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/10"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Pilih Bulan</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="input-field w-full"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Report Preview */}
              {selectedMonth && (
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-dark-300 mb-3">Pratinjau Laporan:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Total Pemasukan:</span>
                      <span className="text-green-400 font-medium">{formatCurrency(monthlyTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Pembayaran Lunas:</span>
                      <span className="text-white">{verifiedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Pembayaran Pending:</span>
                      <span className="text-amber-400">{pendingCount}</span>
                    </div>
                    <div className="border-t border-dark-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-dark-300 font-medium">Total Kas:</span>
                        <span className="text-white font-bold">{formatCurrency(totalIncome)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-dark-300 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={sendWhatsAppReport}
                disabled={!selectedMonth || reportSent}
                className="flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaWhatsapp className="w-5 h-5" />
                WhatsApp
              </button>
              <button
                onClick={sendEmailReport}
                disabled={!selectedMonth || reportSent}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaEnvelope className="w-5 h-5" />
                Email
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="glass-card p-12 text-center">
        <HiCurrencyDollar className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Fitur Kas Manajemen</h3>
        <p className="text-dark-400">Kelola pemasukan dan pengeluaran kas alumni</p>
      </div>
    </motion.div>
  )
}

function SettingsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white">Pengaturan</h2>
      
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Metode Pembayaran</h3>
        <p className="text-dark-400 mb-4">Kelola metode pembayaran yang tersedia</p>
        <Link to="/admin/pembayaran" className="btn-primary inline-flex">
          Kelola Pembayaran
        </Link>
      </div>
      
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informasi Kontak</h3>
        <p className="text-dark-400 mb-4">Update informasi kontak organisasi</p>
        <button className="btn-primary">Edit Kontak</button>
      </div>
    </motion.div>
  )
}
