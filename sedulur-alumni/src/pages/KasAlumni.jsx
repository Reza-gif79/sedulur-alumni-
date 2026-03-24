import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiCurrencyDollar, HiTrendingUp, HiUserGroup, HiClock, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'
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

export default function KasAlumni() {
  const { data, getPaymentMethods } = useData()
  const [activeTab, setActiveTab] = useState('overview')

  // Get real payments from data context
  const payments = data?.payments || []
  const paymentMethods = getPaymentMethods()
  const bankMethod = paymentMethods.find(pm => pm.type === 'bank')

  // Transform payments to transactions format
  const transactions = payments.map(p => ({
    id: p.id,
    name: p.name,
    amount: parseInt(p.amount) || 0,
    type: 'income',
    date: new Date(p.date).toISOString().split('T')[0],
    status: p.status,
    description: p.note || `${p.month} ${p.year}`
  }))

  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'verified').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.status === 'verified').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
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
            Kas Alumni
          </h1>
          <p className="text-dark-400">
            Transparansi pengelolaan dana alumni untuk membangun persaudaraan yang solid.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <HiTrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="badge-success">Total</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(totalIncome)}</div>
            <div className="text-sm text-dark-400">Total Pemasukan</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <HiCurrencyDollar className="w-6 h-6 text-red-400" />
              </div>
              <span className="badge-error">Terpakai</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(totalExpense)}</div>
            <div className="text-sm text-dark-400">Total Pengeluaran</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <HiCheckCircle className="w-6 h-6 text-primary-400" />
              </div>
              <span className="badge-info">Saldo</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(balance)}</div>
            <div className="text-sm text-dark-400">Saldo Saat Ini</div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {['overview', 'income', 'expense'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-primary-500/20 text-white border border-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'overview' ? 'Semua' : tab === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Tanggal</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Nama</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Deskripsi</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Jumlah</th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-dark-400 text-sm">
                        <HiClock className="w-4 h-4" />
                        {transaction.date}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{transaction.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-dark-400 text-sm">{transaction.description}</div>
                    </td>
                    <td className="p-4">
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="p-4">
                      {transaction.status === 'verified' ? (
                        <span className="badge-success flex w-fit">
                          <HiCheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="badge-warning flex w-fit">
                          <HiExclamationCircle className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Informasi Kas Alumni</h3>
          <div className="grid md:grid-cols-2 gap-6 text-dark-400 text-sm">
            <div>
              <p className="mb-2">
                <strong className="text-white">Rekening Bank:</strong> 
                {bankMethod ? `${bankMethod.name} ${bankMethod.number || ''} a.n. ${bankMethod.holder || 'Sedulur Alumni'}` : 'informasi bank/noreken ada di menu pembayaran ' }
              </p>
              <p><strong className="text-white">Dana Penggunaan:</strong> Kegiatan reuni, halal bihalal, bantuan sosial, dan pengembangan alumni.</p>
            </div>
            <div>
              <p className="mb-2"><strong className="text-white">Iuran Bulanan:</strong> Rp {data?.website?.monthlyFee?.toLocaleString('id-ID') || '5.000'}/bulan</p>
              <p><strong className="text-white">Kontak:</strong> {data?.contact?.email || 'bendahara@seduluralumni.id'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
