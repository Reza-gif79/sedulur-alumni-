import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiCreditCard, HiUpload, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'
import { useData } from '../context/DataContext'

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

export default function Pembayaran() {
  const { data, addPayment, getPaymentMethods, markPinUsed } = useData()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    paymentMethod: '',
    notes: '',
    customAmount: '',
    cashPin: '',
  })
  const [buktiTransfer, setBuktiTransfer] = useState(null)
  const [buktiPreview, setBuktiPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type - only allow images
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diperbolehkan')
        return
      }
      
      // Validate file size - max 5MB
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('Ukuran file maksimal 5MB')
        return
      }
      
      setBuktiTransfer(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBuktiPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Track mounted state to prevent state updates on unmounted components
  const isMountedRef = useRef(true)

  useEffect(() => {
    // Cleanup function - runs when component unmounts
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Check if selected payment method is cash
  const isCashPayment = () => {
    const method = paymentMethods.find(m => m.id === formData.paymentMethod)
    return method?.type === 'cash'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // For cash payment, validate PIN
    if (isCashPayment()) {
      if (!formData.cashPin || formData.cashPin.length !== 6) {
        alert('Masukkan kode PIN 6 digit yang diberikan bendahara')
        setIsSubmitting(false)
        return
      }
      
      // Verify PIN exists and is not used
      const validPin = data.cashPins?.find(p => p.pin === formData.cashPin && !p.used)
      if (!validPin) {
        alert('Kode PIN tidak valid atau sudah digunakan')
        setIsSubmitting(false)
        return
      }
    }

    // Determine the actual amount - handle custom amount
    let finalAmount = formData.amount
    if (formData.amount === 'custom') {
      finalAmount = parseInt(formData.customAmount) || data.website.monthlyFee
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check if component is still mounted before updating state
    if (!isMountedRef.current) return

    // Save payment to data context (store only file info, not base64)
    const newPayment = addPayment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      amount: parseInt(finalAmount),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      bukti: buktiTransfer ? buktiTransfer.name : null,
      buktiPreview: null,
    })

    // If cash payment, mark PIN as used
    if (isCashPayment() && newPayment) {
      const validPin = data.cashPins?.find(p => p.pin === formData.cashPin && !p.used)
      if (validPin) {
        markPinUsed(validPin.id)
      }
    }

    setIsSubmitting(false)
    setSubmitStatus('success')
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      amount: '',
      paymentMethod: '',
      notes: '',
      customAmount: '',
      cashPin: '',
    })
    setBuktiTransfer(null)
    setBuktiPreview(null)
  }

  // Use decrypted payment methods from data context
  const paymentMethods = getPaymentMethods()
    .filter(pm => pm.enabled)
    .map(pm => ({
      id: pm.id,
      name: pm.name,
      type: pm.type,
      logo: pm.type === 'bank' ? '🏦' : pm.type === 'ewallet' ? '📱' : '💵',
      number: pm.number,
      holder: pm.holder,
      description: pm.description,
    }))

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Pembayaran Kas Alumni
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Kontribusi Anda sangat berarti untuk mendukung kegiatan alumni dan mempererat tali persaudaraan.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="glass-card p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <HiCreditCard className="w-6 h-6 text-primary-400" />
                Form Pembayaran
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      No. WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="+628xxxxxxx"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Jumlah Kontribusi <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Pilih jumlah</option>
                    <option value={data.website.monthlyFee}>Rp {data.website.monthlyFee?.toLocaleString('id-ID')} - Iuran Bulanan</option>
                    <option value={"5000"}>Rp 5.000</option>
                    <optioan value={"10000"}>Rp 10.000</optioan>
                    <option value={"20000"}>Rp20.000</option>
                    <option value={"30000"}>Rp 30.000</option>
                    <option vslue={"40000"}>Rp 40.000</option>
                    <option value={"50000"}>Rp 50.000</option>
                    <option value="100000">Rp 100.000</option>
                    <option value="200000">Rp 200.000</option>
                    <option value="300000">Rp 300.000</option>
                    <option value="500000">Rp 500.000</option>
                    <option value="1000000">Rp 1.000.000</option>
                    <option value="custom">Lainnya...</option>
                  </select>
                  {formData.amount === 'custom' && (
                    <input
                      type="number"
                      name="customAmount"
                      value={formData.customAmount}
                      onChange={handleInputChange}
                      className="input-field mt-2"
                      placeholder="Masukkan jumlah lain"
                    />
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Metode Pembayaran <span className="text-red-400">*</span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.logo}</span>
                          <div>
                            <div className="font-medium text-white">{method.name}</div>
                            {method.number && (
                              <div className="text-xs text-dark-400">{method.number}</div>
                            )}
                          </div>
                        </div>
                        {formData.paymentMethod === method.id && (
                          <HiCheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary-400" />
                        )}
                      </label>
                    ))}
                  </div>
                  
                  {/* Selected Payment Method Details */}
                  {formData.paymentMethod && (
                    <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      {paymentMethods.filter(m => m.id === formData.paymentMethod).map(method => (
                        <div key={method.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{method.logo}</span>
                            <span className="font-semibold text-white">{method.name}</span>
                          </div>
                          {method.number && (
                            <div className="text-green-400 font-mono text-lg">
                              No. Rekening: {method.number}
                            </div>
                          )}
                          {method.holder && (
                            <div className="text-dark-300">
                              Atas Nama: <span className="font-semibold text-white">{method.holder}</span>
                            </div>
                          )}
                          {method.description && (
                            <div className="text-dark-400 text-sm">{method.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PIN Input for Cash Payment */}
                  {isCashPayment() && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <label className="block text-sm font-medium text-amber-400 mb-2">
                        Kode PIN Pembayaran <span className="text-red-400">*</span>
                      </label>
                      <p className="text-dark-400 text-xs mb-3">
                        Hubungi bendahara untuk mendapatkan kode PIN sebelum membayar.
                      </p>
                      <input
                        type="text"
                        name="cashPin"
                        value={formData.cashPin}
                        onChange={handleInputChange}
                        required
                        className="input-field text-center font-mono text-lg tracking-widest"
                        placeholder="Masukkan 6 digit PIN"
                        maxLength={6}
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Tambahkan catatan untuk pembayaran ini..."
                  />
                </div>

                {/* Upload Bukti */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Upload Bukti Transfer
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      buktiTransfer
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {buktiPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={buktiPreview}
                          alt="Preview"
                          className="max-h-48 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBuktiTransfer(null)
                            setBuktiPreview(null)
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white"
                        >
                          <HiExclamationCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <HiUpload className="w-10 h-10 text-dark-500 mx-auto mb-2" />
                        <p className="text-dark-400 text-sm">
                          Klik untuk upload bukti transfer
                        </p>
                        <p className="text-dark-500 text-xs mt-1">
                          Format: JPG, PNG (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5" />
                      Kirim Pembayaran
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Payment Methods Info */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informasi Pembayaran</h3>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-start gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <span className="text-3xl">{method.logo}</span>
                    <div>
                      <div className="font-semibold text-white">{method.name}</div>
                      {method.number && (
                        <div className="text-green-400 font-mono">{method.number}</div>
                      )}
                      {method.holder && (
                        <div className="text-dark-400 text-sm">a.n. {method.holder}</div>
                      )}
                      {method.description && (
                        <div className="text-dark-400 text-sm">{method.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Status */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border-2 border-green-500/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <HiCheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Pembayaran Berhasil!</div>
                    <div className="text-dark-400 text-sm">Tim kami akan memverifikasi dalam 1x24 jam.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FAQ */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pertanyaan Umum</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-white font-medium mb-1">Apa itu iuran alumni?</div>
                  <div className="text-dark-400 text-sm">
                    Iuran alumni adalah kontribusi bulanan yang digunakan untuk mendanai kegiatan-kegiatann alumni seperti reuni, halal bihalal, dan bakti sosial.
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">Berapa besar iuran bulanan?</div>
                  <div className="text-dark-400 text-sm">
                    Iuran bulanan minimum adalah Rp {data.website.monthlyFee?.toLocaleString('id-ID')}/bulan. Anda bisa membayar lebih sesuai kemampuan.
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">Bagaimana proses verifikasi?</div>
                  <div className="text-dark-400 text-sm">
                    Setelah upload bukti transfer, tim bendahara akan memverifikasi dalam 1x24 jam dan status akan diupdate di dashboard.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Butuh Bantuan?</h3>
              <p className="text-dark-400 text-sm mb-4">
                Hubungi kami jika ada pertanyaan tentang pembayaran.
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-dark-300">📧 {data.contact.email}</div>
                <div className="text-dark-300">📱 {data.contact.whatsapp}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
