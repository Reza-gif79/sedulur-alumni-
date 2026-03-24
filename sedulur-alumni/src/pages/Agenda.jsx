import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCalendar, HiLocationMarker, HiClock, HiUser, HiX, HiExternalLink } from 'react-icons/hi'
import { useData } from '../context/DataContext'

// Default placeholder image if no image is set
const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'

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

export default function Agenda() {
  const { data } = useData()
  const [selectedAgenda, setSelectedAgenda] = useState(null)

  // Get real agendas from data context
  const agendas = data?.agendas || []

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Agenda Kegiatan
          </h1>
          <p className="text-dark-400">
            Ikuti berbagai kegiatan menarik yang diselenggarakan untuk alumni.
          </p>
        </motion.div>

        {/* Agenda Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {agendas.map((agenda) => (
            <motion.div
              key={agenda.id}
              variants={itemVariants}
              className="glass-card-hover overflow-hidden group cursor-pointer"
              onClick={() => setSelectedAgenda(agenda)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={agenda.image || defaultImage}
                  alt={agenda.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <HiCalendar className="w-4 h-4" />
                    {formatDate(agenda.date)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{agenda.title}</h3>
                <p className="text-dark-400 text-sm line-clamp-2 mb-4">{agenda.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-dark-400 text-sm">
                    <HiClock className="w-4 h-4" />
                    {agenda.time || '-'}
                  </div>
                  <div className="flex items-center gap-2 text-dark-400 text-sm">
                    <HiLocationMarker className="w-4 h-4" />
                    <span className="truncate">{agenda.location || '-'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${agenda.active ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-400'}`}>
                    {agenda.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <span className="text-primary-400 text-sm font-medium">Lihat Detail →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {selectedAgenda && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm"
              onClick={() => setSelectedAgenda(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image */}
                <div className="relative h-64">
                  <img
                    src={selectedAgenda.image}
                    alt={selectedAgenda.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedAgenda(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark-950/50 flex items-center justify-center text-white hover:bg-dark-950/80 transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">{selectedAgenda.title}</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-dark-300">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <HiCalendar className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <div className="text-xs text-dark-500">Tanggal</div>
                        <div className="text-white">{formatDate(selectedAgenda.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-dark-300">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <HiClock className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <div className="text-xs text-dark-500">Waktu</div>
                        <div className="text-white">{selectedAgenda.time}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Deskripsi</h3>
                    <p className="text-white leading-relaxed">{selectedAgenda.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Lokasi</h3>
                    <div className="glass p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <HiLocationMarker className="w-5 h-5 text-primary-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{selectedAgenda.location}</div>
                          <div className="text-dark-400 text-sm">{selectedAgenda.address}</div>
                        </div>
                      </div>
                      <a
                        href={selectedAgenda.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium"
                      >
                        <HiExternalLink className="w-4 h-4" />
                        Buka di Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-dark-400 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${selectedAgenda.active ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-400'}`}>
                        {selectedAgenda.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <button className="btn-primary">
                      Daftar Sekarang
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
