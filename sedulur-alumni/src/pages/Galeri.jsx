import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPhotograph, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { useData } from '../context/DataContext'

const categories = ['Semua', 'Acara', 'Reuni', 'Workshop', 'Sosial', 'Networking', 'Seminar', 'Wisuda', 'Olahraga', 'Seni', 'Gathering', 'Adventure']

export default function Galeri() {
  const { data } = useData()
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  // Get gallery data from DataContext, fallback to empty array
  const galleryData = data?.gallery || []

  // Map gallery data to photo format (handle both old and new format)
  const photos = galleryData.map((item, index) => ({
    id: item.id || `gallery_${index}`,
    title: item.title,
    category: item.category || 'general',
    src: item.image || '',
    thumbnail: item.image || '',
  }))

  const filteredPhotos = selectedCategory === 'Semua' 
    ? photos 
    : photos.filter(photo => {
        const cat = photo.category?.toLowerCase()
        const selected = selectedCategory.toLowerCase()
        // Map category translations
        if (selected === 'acara' && cat === 'event') return true
        if (selected === 'reuni' && cat === 'reunion') return true
        if (selected === 'outdoor' && cat === 'outdoor') return true
        return cat === selected || selected === 'semua'
      })

  const handlePrev = () => {
    if (!selectedPhoto) return
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    const prevIndex = currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1
    setSelectedPhoto(filteredPhotos[prevIndex])
  }

  const handleNext = () => {
    if (!selectedPhoto) return
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    const nextIndex = currentIndex === filteredPhotos.length - 1 ? 0 : currentIndex + 1
    setSelectedPhoto(filteredPhotos[nextIndex])
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
            Galeri Foto
          </h1>
          <p className="text-dark-400">
            Kumpulan momen berharga dari berbagai kegiatan alumni.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-primary-500/20 text-white border border-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Photo Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.thumbnail}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <HiPhotograph className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">{photo.title}</p>
                  <p className="text-white/70 text-xs">{photo.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <HiPhotograph className="w-10 h-10 text-dark-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tidak Ada Foto</h3>
            <p className="text-dark-400">Belum ada foto dalam kategori ini.</p>
          </motion.div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/95 backdrop-blur-xl"
              onClick={() => setSelectedPhoto(null)}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>

              {/* Navigation */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev() }}
                className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext() }}
                className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <HiChevronRight className="w-6 h-6" />
              </button>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-5xl max-h-[90vh] px-16"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="text-center mt-4">
                  <h3 className="text-xl font-semibold text-white">{selectedPhoto.title}</h3>
                  <p className="text-dark-400">{selectedPhoto.category}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
