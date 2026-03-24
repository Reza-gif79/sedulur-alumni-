import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  HiUserAdd,
  HiPencil,
  HiTrash,
  HiX,
  HiCheck,
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

export default function Users() {
  const { admins, user: currentUser, addAdmin, updateAdmin, deleteAdmin } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        password: '',
        name: user.name,
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        password: '',
        name: '',
      })
    }
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      name: '',
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username || !formData.name) {
      setError('Username dan Nama harus diisi')
      return
    }

    if (!editingUser && !formData.password) {
      setError('Password harus diisi untuk user baru')
      return
    }

    if (editingUser) {
      // Update existing user
      const updates = {
        username: formData.username,
        name: formData.name,
      }
      if (formData.password) {
        updates.password = formData.password
      }
      updateAdmin(editingUser.id, updates)
      setSuccess('User berhasil diperbarui')
    } else {
      // Check if username already exists
      if (admins.some((a) => a.username === formData.username)) {
        setError('Username sudah digunakan')
        return
      }
      // Add new user
      addAdmin(formData)
      setSuccess('User berhasil ditambahkan')
    }

    setTimeout(() => {
      handleCloseModal()
      setSuccess('')
    }, 1500)
  }

  const handleDelete = (id) => {
    if (admins.length <= 1) {
      setError('Tidak dapat menghapus admin terakhir')
      return
    }
    if (currentUser?.id === id) {
      setError('Tidak dapat menghapus akun sendiri')
      return
    }
    deleteAdmin(id)
    setSuccess('User berhasil dihapus')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola User</h1>
          <p className="text-dark-400">Tambah, edit, atau hapus user admin</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <HiUserAdd className="w-5 h-5" />
          Tambah User
        </button>
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm font-medium text-dark-400">No</th>
                <th className="text-left p-4 text-sm font-medium text-dark-400">Nama</th>
                <th className="text-left p-4 text-sm font-medium text-dark-400">Username</th>
                <th className="text-left p-4 text-sm font-medium text-dark-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-dark-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr
                  key={admin.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-4 text-dark-300">{index + 1}</td>
                  <td className="p-4 text-white font-medium">
                    {admin.name}
                    {currentUser?.id === admin.id && (
                      <span className="ml-2 text-xs text-primary-400">(Anda)</span>
                    )}
                  </td>
                  <td className="p-4 text-dark-300">{admin.username}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-400">
                      {admin.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(admin)}
                        className="p-2 rounded-lg bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      {currentUser?.id !== admin.id && admins.length > 1 && (
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 rounded-lg bg-white/5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                {editingUser ? 'Edit User' : 'Tambah User'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/10"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Password {editingUser && <span className="text-dark-500">(kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder={editingUser ? 'Password baru' : 'Password'}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
