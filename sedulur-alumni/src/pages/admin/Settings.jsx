import { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import {
  HiCog,
  HiCreditCard,
  HiPhone,
  HiGlobe,
  HiUserAdd,
  HiPencil,
  HiTrash,
  HiX,
  HiCheck,
  HiPlus,
  HiRefresh,
  HiKey,
} from 'react-icons/hi'

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

export default function Settings() {
  const { data, updateContact, updateWebsite, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getPaymentMethods, resetPaymentMethods, generateCashPin } = useData()
  
  // Get decrypted payment methods for display
  const paymentMethods = getPaymentMethods()
  const [activeTab, setActiveTab] = useState('contact')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [generatedPin, setGeneratedPin] = useState(null)
  const [editingMethod, setEditingMethod] = useState(null)
  const [methodForm, setMethodForm] = useState({
    name: '',
    number: '',
    holder: '',
    description: '',
    type: 'bank',
  })

  const showSuccess = (message) => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    updateContact({
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      whatsapp: formData.get('whatsapp'),
    })
    showSuccess('Kontak berhasil diperbarui')
  }

  const handleWebsiteSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    updateWebsite({
      name: formData.get('name'),
      tagline: formData.get('tagline'),
      monthlyFee: parseInt(formData.get('monthlyFee')) || 5000,
    })
    showSuccess('Website berhasil diperbarui')
  }

  const openMethodModal = (method = null) => {
    if (method) {
      setEditingMethod(method)
      setMethodForm({
        name: method.name,
        number: method.number || '',
        holder: method.holder || '',
        description: method.description || '',
        type: method.type || 'bank',
      })
    } else {
      setEditingMethod(null)
      setMethodForm({
        name: '',
        number: '',
        holder: '',
        description: '',
        type: 'bank',
      })
    }
    setShowModal(true)
  }

  const closeMethodModal = () => {
    setShowModal(false)
    setEditingMethod(null)
  }

  const handleMethodSubmit = (e) => {
    e.preventDefault()
    if (editingMethod) {
      updatePaymentMethod(editingMethod.id, methodForm)
      showSuccess('Metode pembayaran berhasil diperbarui')
    } else {
      addPaymentMethod(methodForm)
      showSuccess('Metode pembayaran berhasil ditambahkan')
    }
    closeMethodModal()
  }

  const handleDeleteMethod = (id) => {
    if (paymentMethods.length <= 1) {
      alert('Tidak dapat menghapus metode pembayaran terakhir')
      return
    }
    deletePaymentMethod(id)
    showSuccess('Metode pembayaran berhasil dihapus')
  }

  const handleGeneratePin = () => {
    const pinData = generateCashPin('admin_generated')
    setGeneratedPin(pinData.pin)
    showSuccess('Kode PIN berhasil digenerate')
  }

  const tabs = [
    { id: 'contact', name: 'Kontak', icon: HiPhone },
    { id: 'payment', name: 'Pembayaran', icon: HiCreditCard },
    { id: 'website', name: 'Website', icon: HiGlobe },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-dark-400">Kelola pengaturan website</p>
      </motion.div>

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

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          )
        })}
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {activeTab === 'contact' && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Informasi Kontak</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={data.contact.email}
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    defaultValue={data.contact.whatsapp}
                    className="input-field"
                    placeholder="+62 812 3456 7890"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={data.contact.phone}
                    className="input-field"
                    placeholder="+62 812 3456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={data.contact.address}
                    className="input-field"
                    placeholder="Lumajang, Indonesia"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Simpan Perubahan
              </button>
            </form>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Metode Pembayaran</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset semua metode pembayaran ke default? Ini akan mengganti data yang ada.')) {
                        resetPaymentMethods()
                        showSuccess('Metode pembayaran berhasil direset ke default')
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-2"
                  >
                    <HiRefresh className="w-4 h-4" />
                    Reset Default
                  </button>
                  <button
                    onClick={() => openMethodModal()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <HiPlus className="w-5 h-5" />
                    Tambah Metode
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50"
                  >
                    <div>
                      <div className="font-medium text-white">{method.name}</div>
                      {method.number && (
                        <div className="text-sm text-dark-400">{method.number} - {method.holder}</div>
                      )}
                      {method.description && (
                        <div className="text-sm text-dark-400">{method.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openMethodModal(method)}
                        className="p-2 rounded-lg bg-white/5 text-dark-400 hover:text-white hover:bg-white/10"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-2 rounded-lg bg-white/5 text-dark-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PIN Generation Section */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Kode PIN Tunai</h2>
              <p className="text-dark-400 text-sm mb-4">
                Generate kode PIN untuk user yang ingin membayar secara tunai. Berikan kode ini ke user.
              </p>
              <button
                onClick={handleGeneratePin}
                className="btn-primary flex items-center gap-2"
              >
                <HiKey className="w-5 h-5" />
                Generate Kode PIN
              </button>
              {generatedPin && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="text-sm text-dark-400 mb-2">Kode PIN yang dihasilkan:</div>
                  <div className="text-3xl font-bold text-green-400 font-mono tracking-widest">
                    {generatedPin}
                  </div>
                  <div className="text-xs text-dark-500 mt-2">
                    Berikan kode ini ke user. Kode akan ditandai sebagai "sudah digunakan" setelah user melakukan pembayaran.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'website' && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Pengaturan Website</h2>
            <form onSubmit={handleWebsiteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Nama Website</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={data.website.name}
                  className="input-field"
                  placeholder="Sedulur Alumni"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  defaultValue={data.website.tagline}
                  className="input-field"
                  placeholder="Membangun koneksi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Iuran Bulanan (Rp)</label>
                <input
                  type="number"
                  name="monthlyFee"
                  defaultValue={data.website.monthlyFee}
                  className="input-field"
                  placeholder="50000"
                />
              </div>
              <button type="submit" className="btn-primary">
                Simpan Perubahan
              </button>
            </form>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingMethod ? 'Edit Metode' : 'Tambah Metode'}
              </h2>
              <button
                onClick={closeMethodModal}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/10"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMethodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Tipe</label>
                <select
                  value={methodForm.type}
                  onChange={(e) => setMethodForm({ ...methodForm, type: e.target.value })}
                  className="input-field"
                >
                  <option value="bank">Transfer Bank</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="cash">Tunai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Nama Metode</label>
                <input
                  type="text"
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="SeaBank, DANA, dll"
                />
              </div>

              {methodForm.type !== 'cash' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Nomor Rekening</label>
                    <input
                      type="text"
                      value={methodForm.number}
                      onChange={(e) => setMethodForm({ ...methodForm, number: e.target.value })}
                      className="input-field"
                      placeholder="123-456-7890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Atas Nama</label>
                    <input
                      type="text"
                      value={methodForm.holder}
                      onChange={(e) => setMethodForm({ ...methodForm, holder: e.target.value })}
                      className="input-field"
                      placeholder="Nama pemilik rekening"
                    />
                  </div>
                </>
              )}

              {methodForm.type === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Deskripsi</label>
                  <input
                    type="text"
                    value={methodForm.description}
                    onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
                    className="input-field"
                    placeholder="Bayar langsung ke bendahara"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeMethodModal}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-dark-300 hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <HiCheck className="w-5 h-5" />
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
