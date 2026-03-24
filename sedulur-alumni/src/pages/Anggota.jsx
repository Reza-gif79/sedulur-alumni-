import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiSearch, HiUserGroup, HiMail, HiPhone, HiOfficeBuilding, HiAcademicCap } from 'react-icons/hi'
import { useData } from '../context/DataContext'

// Generate batches from data
const getBatches = (alumniList) => {
  const years = alumniList.map(a => a.graduationYear).filter(Boolean)
  const uniqueYears = [...new Set(years)].sort((a, b) => b - a)
  return ['All', ...uniqueYears.map(String)]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Anggota() {
  const { data } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('All')

  // Get real alumni from data context
  const alumni = data?.alumni || []
  const batches = getBatches(alumni)

  const filteredAlumni = alumni.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.major && person.major.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.address && person.address.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesBatch = selectedBatch === 'All' || String(person.graduationYear) === selectedBatch
    return matchesSearch && matchesBatch
  })

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
            Anggota Alumni
          </h1>
          <p className="text-dark-400">
            Temui para alumni yang telah tersebar di berbagai bidang profesi.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              placeholder="Cari alumni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* Batch Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {batches.map((batch) => (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedBatch === batch
                    ? 'bg-primary-500/20 text-white border border-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {batch === 'All' ? 'Semua Angkatan' : batch}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{alumni.length}</div>
            <div className="text-sm text-dark-400">Total Alumni</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{filteredAlumni.length}</div>
            <div className="text-sm text-dark-400">Ditemukan</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{new Set(alumni.map(a => a.graduationYear).filter(Boolean)).size}</div>
            <div className="text-sm text-dark-400">Angkatan</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{new Set(alumni.map(a => a.major).filter(Boolean)).size}</div>
            <div className="text-sm text-dark-400">Jurusan</div>
          </div>
        </motion.div>

        {/* Alumni Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredAlumni.map((person) => (
            <motion.div
              key={person.id}
              variants={itemVariants}
              className="glass-card-hover p-6 group"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                  {person.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{person.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-dark-400">
                    <HiAcademicCap className="w-4 h-4" />
                    Tahun Lulus {person.graduationYear || '-'}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {person.major && (
                  <div className="flex items-center gap-2 text-dark-400 text-sm">
                    <HiOfficeBuilding className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{person.major}</span>
                  </div>
                )}
                {person.email && (
                  <div className="flex items-center gap-2 text-dark-400 text-sm">
                    <HiMail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-dark-400 text-sm">
                    <HiPhone className="w-4 h-4 flex-shrink-0" />
                    <span>{person.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredAlumni.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <HiUserGroup className="w-10 h-10 text-dark-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tidak Ada Hasil</h3>
            <p className="text-dark-400">Coba kata kunci lain atau filter angkatan.</p>
          </motion.div>
        )}
      </div>
    </main>
  )
}
