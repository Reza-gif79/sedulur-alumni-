import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight, HiUserGroup, HiCurrencyDollar, HiCalendar, HiHeart } from 'react-icons/hi'
import { FaGraduationCap, FaHandshake, FaLightbulb } from 'react-icons/fa'
import { useData } from '../context/DataContext'

// Format currency for display
const formatCurrency = (amount) => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}jt`
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`
  }
  return `Rp ${amount}`
}

const features = [
  {
    icon: FaGraduationCap,
    title: 'Networking Profesional',
    description: 'Terhubung dengan alumni dari berbagai bidang profesi untuk memperluas jaringan karir Anda.',
  },
  {
    icon: FaHandshake,
    title: 'Reuni & Gathering',
    description: 'Ikuti berbagai kegiatan reuni, gathering, dan acara sosial yang diselenggarakan secara berkala.',
  },
  {
    icon: FaLightbulb,
    title: ' Pengembangan Diri',
    description: 'Akses berbagai program pelatihan, workshop, dan mentorship dari alumni sukses.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Home() {
  const { data } = useData()
  
  // Calculate real stats from data context
  const alumniCount = data?.alumni?.length || 0
  const totalFunds = data?.payments?.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0) || 0
  const agendaCount = data?.agendas?.length || 0
  const donaturCount = data?.payments?.filter(p => p.status === 'verified').length || 0
  
  const stats = [
    { label: 'Total Alumni', value: alumniCount > 0 ? `${alumniCount}+` : '0', icon: HiUserGroup },
    { label: 'Dana Terkumpul', value: totalFunds > 0 ? formatCurrency(totalFunds) : 'Rp 0', icon: HiCurrencyDollar },
    { label: 'Agenda Kegiatan', value: agendaCount > 0 ? `${agendaCount}+` : '0', icon: HiCalendar },
    { label: 'Donatur Aktif', value: donaturCount > 0 ? `${donaturCount}+` : '0', icon: HiHeart },
  ]
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-dark-300">Selamat Datang di Sedulur Alumni</span>
            </motion.div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Merangkul Masa Depan,</span>
              <br />
              <span className="gradient-text">Menjalin Persaudaraan</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-dark-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform resmi untuk alumni. Terhubung dengan sesama alumni, ikuti kegiatan menarik, 
              dan contribute untuk kemajuan bersama.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/anggota" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                Lihat Anggota
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pembayaran" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                Donasi Sekarang
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-white/50"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="section-container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="glass-card-hover p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-dark-400">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Mengapa Bergabung?
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Jadilah bagian dari komunitas alumni yang solid dan saling mendukung 
              untuk kemajuan bersama.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="glass-card-hover p-8 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-accent-purple/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-dark-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Siap Menjadi Bagian dari Kami?
              </h2>
              <p className="text-dark-400 max-w-xl mx-auto mb-8">
                Daftarkan diri Anda sekarang dan nikmati berbagai benefits 
                sebagai anggota alumni.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/anggota" className="btn-primary">
                  Lihat Anggota Alumni
                </Link>
                <Link to="/pembayaran" className="btn-secondary">
                  Kontribusi Sekarang
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
