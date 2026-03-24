import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext(null)

const DEFAULT_DATA = {
  paymentMethods: [],
  contact: {
    email: 'infoseduuluralumni@gmail.com',
    phone: '+62 813 5896 4029',
    address: 'Lumajang, Indonesia',
    whatsapp: '+62 813 5896 4029',
  },
  website: {
    name: 'Sedulur Alumni',
    tagline: 'Membangun koneksi, menjaga silaturrahmi, dan menciptakan masa depan bersama',
    monthlyFee: 5000,
  },
  // Initialize with sample payment method for demo
  paymentMethodsInitialized: false,
  alumni: [],
  payments: [],
  agendas: [],
  gallery: [],
  notifications: [],
  // Cash payment PINs
  cashPins: [],
  // Monthly report settings
  monthlyReport: {
    enabled: true,
    lastSent: null,
    recipients: [],
  },
  // Donatur data
  donatur: [],
}

const STORAGE_KEY = 'sedulur_website_data'

// ============================================
// SECURITY IMPLEMENTATION NOTES:
// ============================================
// 1. Input sanitization prevents XSS attacks
// 2. WARNING: Sensitive data (bank accounts) stored in localStorage without encryption
// 3. For production: Use server-side storage with proper authentication
// 4. localStorage is limited to same-origin, reducing XSS impact
// ============================================

// NOTE: Sensitive payment method data is stored in plain text in localStorage.
// This is NOT secure for production use. Consider implementing server-side storage.

// Input sanitization to prevent XSS attacks - THIS IS THE REAL SECURITY MEASURE
const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  // Remove potentially dangerous characters
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;')
    .trim()
}

// Validate required string field
const isValidRequired = (value) => {
  return typeof value === 'string' && value.trim().length > 0
}

// Sample payment methods for initial setup
const getSamplePaymentMethods = () => [
  { id: 'sea_' + Date.now(), name: 'SeaBank', number: '901234567890', holder: 'Sedulur Alumni', enabled: true, type: 'bank', description: 'Transfer ke nomor rekening di atas' },
  { id: 'cash_' + Date.now(), name: 'Cash / Tunai', number: '', holder: '', description: 'Hubungi bendahara untuk mendapatkan kode PIN', enabled: true, type: 'cash' },
]

export function DataProvider({ children }) {
  const [data, setData] = useState(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      let parsedData = null
      
      if (storedData) {
        const parsed = JSON.parse(storedData)
        // Validate the parsed data structure
        if (parsed && typeof parsed === 'object') {
          parsedData = { ...DEFAULT_DATA, ...parsed }
        }
      }
      
      if (!parsedData) {
        // Initialize with default data including sample payment methods
        const initialData = {
          ...DEFAULT_DATA,
          paymentMethods: getSamplePaymentMethods()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
        setData(initialData)
      } else {
        // If no payment methods, add sample ones
        if (!parsedData.paymentMethods || parsedData.paymentMethods.length === 0) {
          parsedData.paymentMethods = getSamplePaymentMethods()
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData))
        }
        setData(parsedData)
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error)
      // Reset to default on error
      const initialData = {
        ...DEFAULT_DATA,
        paymentMethods: getSamplePaymentMethods()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
      setData(initialData)
    }
    setLoading(false)
  }, [])

  // Save data to localStorage whenever it changes
  const updateData = (newData) => {
    const updated = { ...data, ...newData }
    setData(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Payment Methods - sanitize sensitive fields before storage
  const addPaymentMethod = (method) => {
    // Sanitize fields (no encoding - stored as-is in localStorage)
    const sanitizedMethod = {
      ...method,
      id: `pm_${Date.now()}`,
      enabled: true,
      // Sanitize bank account data
      number: method.number ? sanitizeString(method.number) : '',
      holder: method.holder ? sanitizeString(method.holder) : '',
      name: method.name ? sanitizeString(method.name) : '',
      description: method.description ? sanitizeString(method.description) : '',
      type: method.type ? sanitizeString(method.type) : 'bank'
    }
    updateData({
      paymentMethods: [...data.paymentMethods, sanitizedMethod]
    })
    return sanitizedMethod
  }

  const updatePaymentMethod = (id, updates) => {
    // Sanitize fields
    const sanitizedUpdates = {
      ...updates,
      number: updates.number ? sanitizeString(updates.number) : undefined,
      holder: updates.holder ? sanitizeString(updates.holder) : undefined,
      name: updates.name ? sanitizeString(updates.name) : undefined,
      description: updates.description ? sanitizeString(updates.description) : undefined,
      type: updates.type ? sanitizeString(updates.type) : undefined
    }
    // Remove undefined values
    Object.keys(sanitizedUpdates).forEach(key => {
      if (sanitizedUpdates[key] === undefined) delete sanitizedUpdates[key]
    })
    updateData({
      paymentMethods: data.paymentMethods.map(pm => 
        pm.id === id ? { ...pm, ...sanitizedUpdates } : pm
      )
    })
  }

  // Get payment methods
  const getPaymentMethods = () => {
    return data.paymentMethods
  }

  const deletePaymentMethod = (id) => {
    updateData({
      paymentMethods: data.paymentMethods.filter(pm => pm.id !== id)
    })
  }

  // Reset payment methods to default
  const resetPaymentMethods = () => {
    updateData({
      paymentMethods: getSamplePaymentMethods()
    })
  }

  // Contact
  const updateContact = (updates) => {
    updateData({ contact: { ...data.contact, ...updates } })
  }

  // Website Settings
  const updateWebsite = (updates) => {
    updateData({ website: { ...data.website, ...updates } })
  }

  // Alumni
  const addAlumni = (alumni) => {
    // Validate required fields
    if (!isValidRequired(alumni.name)) {
      return { error: 'Nama alumni harus diisi' }
    }
    
    // Sanitize inputs
    const sanitizedAlumni = {
      id: `alumni_${Date.now()}`,
      name: sanitizeString(alumni.name),
      email: alumni.email ? sanitizeString(alumni.email) : '',
      phone: alumni.phone ? sanitizeString(alumni.phone) : '',
      graduationYear: alumni.graduationYear || null,
      major: alumni.major ? sanitizeString(alumni.major) : '',
      address: alumni.address ? sanitizeString(alumni.address) : '',
      photo: alumni.photo || '',
      joinDate: new Date().toISOString()
    }
    
    updateData({ alumni: [...data.alumni, sanitizedAlumni] })
    return sanitizedAlumni
  }

  const updateAlumni = (id, updates) => {
    updateData({
      alumni: data.alumni.map(a => a.id === id ? { ...a, ...updates } : a)
    })
  }

  const deleteAlumni = (id) => {
    updateData({ alumni: data.alumni.filter(a => a.id !== id) })
  }

  // Payments
  const addPayment = (payment) => {
    // Validate required fields
    if (!isValidRequired(payment.name)) {
      return { error: 'Nama pembayaran harus diisi' }
    }
    
    // Validate amount
    const amount = parseInt(payment.amount) || 0
    if (amount <= 0) {
      return { error: 'Jumlah pembayaran harus lebih dari 0' }
    }
    
    // Validate month and year
    if (!isValidRequired(payment.month) || !payment.year) {
      return { error: 'Bulan dan tahun harus diisi' }
    }
    
    // Sanitize inputs
    const sanitizedPayment = {
      id: `payment_${Date.now()}`,
      name: sanitizeString(payment.name),
      email: payment.email ? sanitizeString(payment.email) : '',
      phone: payment.phone ? sanitizeString(payment.phone) : '',
      amount: amount,
      month: sanitizeString(payment.month),
      year: parseInt(payment.year),
      method: payment.method ? sanitizeString(payment.method) : '',
      status: 'pending',
      date: new Date().toISOString(),
      note: payment.note ? sanitizeString(payment.note) : ''
    }
    
    updateData({ payments: [...data.payments, sanitizedPayment] })
    return sanitizedPayment
  }

  const updatePayment = (id, updates) => {
    updateData({
      payments: data.payments.map(p => p.id === id ? { ...p, ...updates } : p)
    })
  }

  // Agenda
  const addAgenda = (agenda) => {
    // Validate required fields
    if (!isValidRequired(agenda.title)) {
      return { error: 'Judul agenda harus diisi' }
    }
    
    if (!agenda.date) {
      return { error: 'Tanggal agenda harus diisi' }
    }
    
    // Sanitize inputs
    const sanitizedAgenda = {
      id: `agenda_${Date.now()}`,
      title: sanitizeString(agenda.title),
      description: agenda.description ? sanitizeString(agenda.description) : '',
      date: agenda.date,
      time: agenda.time ? sanitizeString(agenda.time) : '',
      location: agenda.location ? sanitizeString(agenda.location) : '',
      type: agenda.type ? sanitizeString(agenda.type) : 'monthly',
      image: agenda.image || '',
      active: agenda.active !== false
    }
    
    updateData({ agendas: [...data.agendas, sanitizedAgenda] })
    return sanitizedAgenda
  }

  const updateAgenda = (id, updates) => {
    updateData({
      agendas: data.agendas.map(a => a.id === id ? { ...a, ...updates } : a)
    })
  }

  const deleteAgenda = (id) => {
    updateData({ agendas: data.agendas.filter(a => a.id !== id) })
  }

  // Gallery
  const addGalleryItem = (item) => {
    // Validate required fields
    if (!isValidRequired(item.title)) {
      return { error: 'Judul gambar harus diisi' }
    }
    
    // Sanitize inputs
    const sanitizedItem = {
      id: `gallery_${Date.now()}`,
      title: sanitizeString(item.title),
      description: item.description ? sanitizeString(item.description) : '',
      category: item.category ? sanitizeString(item.category) : 'general',
      image: item.image || '',
      date: item.date || new Date().toISOString()
    }
    
    updateData({ gallery: [...data.gallery, sanitizedItem] })
    return sanitizedItem
  }

  const deleteGalleryItem = (id) => {
    updateData({ gallery: data.gallery.filter(g => g.id !== id) })
  }

  // Notifications
  const addNotification = (notification) => {
    const newNotification = {
      id: `notif_${Date.now()}`,
      type: notification.type || 'info',
      title: sanitizeString(notification.title),
      message: sanitizeString(notification.message),
      paymentId: notification.paymentId || null,
      read: false,
      createdAt: new Date().toISOString()
    }
    updateData({ notifications: [newNotification, ...data.notifications] })
    return newNotification
  }

  const markNotificationRead = (id) => {
    updateData({
      notifications: data.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    })
  }

  const markAllNotificationsRead = () => {
    updateData({
      notifications: data.notifications.map(n => ({ ...n, read: true }))
    })
  }

  const deleteNotification = (id) => {
    updateData({ notifications: data.notifications.filter(n => n.id !== id) })
  }

  const clearAllNotifications = () => {
    updateData({ notifications: [] })
  }

  // Cash PIN Management - generate unique PIN for cash payments
  const generateCashPin = (paymentId) => {
    // Generate a 6-digit unique PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const newPin = {
      id: `pin_${Date.now()}`,
      pin: pin,
      paymentId: paymentId,
      createdAt: new Date().toISOString(),
      used: false,
    }
    updateData({ cashPins: [...(data.cashPins || []), newPin] })
    return newPin
  }

  const verifyCashPin = (pin) => {
    const validPin = data.cashPins?.find(p => p.pin === pin && !p.used)
    return validPin || null
  }

  const markPinUsed = (pinId) => {
    updateData({
      cashPins: data.cashPins.map(p => 
        p.id === pinId ? { ...p, used: true, usedAt: new Date().toISOString() } : p
      )
    })
  }

  // Monthly Report Management
  const updateMonthlyReport = (updates) => {
    updateData({ monthlyReport: { ...data.monthlyReport, ...updates } })
  }

  // Donatur Management
  const addDonatur = (donatur) => {
    const newDonatur = {
      id: `donatur_${Date.now()}`,
      name: sanitizeString(donatur.name),
      amount: parseInt(donatur.amount) || 0,
      date: donatur.date || new Date().toISOString(),
      description: donatur.description ? sanitizeString(donatur.description) : '',
    }
    updateData({ donatur: [...(data.donatur || []), newDonatur] })
    return newDonatur
  }

  const deleteDonatur = (id) => {
    updateData({ donatur: data.donatur.filter(d => d.id !== id) })
  }

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        // Payment Methods
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        getPaymentMethods,
        resetPaymentMethods,
        // Contact
        updateContact,
        // Website
        updateWebsite,
        // Alumni
        addAlumni,
        updateAlumni,
        deleteAlumni,
        // Payments
        addPayment,
        updatePayment,
        // Agenda
        addAgenda,
        updateAgenda,
        deleteAgenda,
        // Gallery
        addGalleryItem,
        deleteGalleryItem,
        // Notifications
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        // Cash PIN Management
        generateCashPin,
        verifyCashPin,
        markPinUsed,
        // Monthly Report
        updateMonthlyReport,
        // Donatur
        addDonatur,
        deleteDonatur,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
