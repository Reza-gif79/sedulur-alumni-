import { createContext, useContext, useState, useEffect } from 'react'
import bcrypt from 'bcryptjs'

const AuthContext = createContext(null)

// Storage keys
const STORAGE_KEY = 'sedulur_admin_auth'
const ADMINS_STORAGE_KEY = 'sedulur_admins'
const SESSION_TIMEOUT_KEY = 'sedulur_session_timeout'
const LOGIN_ATTEMPTS_KEY = 'sedulur_login_attempts'
const LOCKOUT_UNTIL_KEY = 'sedulur_lockout_until'

// Security constants
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

// Get admin credentials from environment variables
// Credentials MUST be set via environment variables - no defaults allowed
const getAdminCredentials = () => {
  const envUsername = import.meta.env.VITE_ADMIN_USER
  const envPasswordHash = import.meta.env.VITE_ADMIN_HASH
  
  // If environment variables are set, use them
  if (envUsername && envPasswordHash) {
    return {
      id: 1,
      username: envUsername,
      passwordHash: envPasswordHash,
      name: 'Administrator',
      role: 'admin'
    }
  }
  
  // No fallback - require environment variables to be set
  console.error('❌ CRITICAL: Admin credentials not configured. Set VITE_ADMIN_USER and VITE_ADMIN_HASH in .env file!')
  return null
}

// Get current login attempts
const getLoginAttempts = () => {
  const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
  return attempts ? parseInt(attempts, 10) : 0
}

// Increment login attempts
const incrementLoginAttempts = () => {
  const attempts = getLoginAttempts() + 1
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, attempts.toString())
  return attempts
}

// Reset login attempts
const resetLoginAttempts = () => {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  localStorage.removeItem(LOCKOUT_UNTIL_KEY)
}

// Check if account is locked out
const isLockedOut = () => {
  const lockoutUntil = localStorage.getItem(LOCKOUT_UNTIL_KEY)
  if (!lockoutUntil) return false
  return Date.now() < parseInt(lockoutUntil, 10)
}

// Get remaining lockout time in seconds
const getRemainingLockoutTime = () => {
  const lockoutUntil = localStorage.getItem(LOCKOUT_UNTIL_KEY)
  if (!lockoutUntil) return 0
  const remaining = parseInt(lockoutUntil, 10) - Date.now()
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

// Trigger lockout
const triggerLockout = () => {
  const lockoutUntil = Date.now() + LOCKOUT_DURATION
  localStorage.setItem(LOCKOUT_UNTIL_KEY, lockoutUntil.toString())
}

// Verify password against bcrypt hash
const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash)
  } catch {
    return false
  }
}

// Check if session has expired
const isSessionExpired = () => {
  const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY)
  if (!timeout) return false
  return Date.now() > parseInt(timeout, 10)
}

// Set session timeout
const setSessionTimeout = () => {
  localStorage.setItem(SESSION_TIMEOUT_KEY, (Date.now() + SESSION_TIMEOUT).toString())
}

// Clear session timeout
const clearSessionTimeout = () => {
  localStorage.removeItem(SESSION_TIMEOUT_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState([])

  // Load admins from localStorage
  useEffect(() => {
    const storedAdmins = localStorage.getItem(ADMINS_STORAGE_KEY)
    if (storedAdmins) {
      try {
        const parsed = JSON.parse(storedAdmins)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdmins(parsed)
        } else {
          // Initialize with default admin from env
          const defaultAdmin = getAdminCredentials()
          if (defaultAdmin) {
            const initialAdmins = [{
              id: defaultAdmin.id,
              username: defaultAdmin.username,
              name: defaultAdmin.name,
              role: defaultAdmin.role
            }]
            setAdmins(initialAdmins)
            localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(initialAdmins))
          }
        }
      } catch (error) {
        console.error('Failed to load admins:', error)
      }
    } else {
      // Initialize with default admin from env
      const defaultAdmin = getAdminCredentials()
      if (defaultAdmin) {
        const initialAdmins = [{
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          name: defaultAdmin.name,
          role: defaultAdmin.role
        }]
        setAdmins(initialAdmins)
        localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(initialAdmins))
      }
    }
  }, [])

  // Add admin function
  const addAdmin = async (adminData) => {
    // Generate password hash if password is provided
    let passwordHash = null
    if (adminData.password) {
      try {
        passwordHash = await bcrypt.hash(adminData.password, 10)
      } catch (error) {
        console.error('Failed to hash password:', error)
      }
    }
    
    const newAdmin = {
      id: Date.now(),
      username: adminData.username,
      name: adminData.name,
      role: 'admin',
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    }
    const updatedAdmins = [...admins, newAdmin]
    setAdmins(updatedAdmins)
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(updatedAdmins))
    return newAdmin
  }

  // Update admin function
  const updateAdmin = (id, updates) => {
    const updatedAdmins = admins.map(admin =>
      admin.id === id ? { ...admin, ...updates } : admin
    )
    setAdmins(updatedAdmins)
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(updatedAdmins))
  }

  // Delete admin function
  const deleteAdmin = (id) => {
    const updatedAdmins = admins.filter(admin => admin.id !== id)
    setAdmins(updatedAdmins)
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(updatedAdmins))
  }

  // Initialize and check for existing session
  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem(STORAGE_KEY)
    if (storedUser && !isSessionExpired()) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed && parsed.id && parsed.username) {
          setUser(parsed)
        }
      } catch (error) {
        console.error('Failed to load user session:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    // Get admin credentials - must be configured
    const PREDEFINED_ADMIN = getAdminCredentials()
    
    if (!PREDEFINED_ADMIN) {
      return { 
        success: false, 
        message: 'Sistem belum dikonfigurasi. Hubungi administrator untuk setup awal.'
      }
    }

    // Check if account is locked out
    if (isLockedOut()) {
      const remainingTime = getRemainingLockoutTime()
      const minutes = Math.floor(remainingTime / 60)
      const seconds = remainingTime % 60
      return { 
        success: false, 
        message: `Akun terkunci. Coba lagi dalam ${minutes} menit ${seconds} detik.`,
        locked: true,
        remainingTime 
      }
    }

    if (!username || !password) {
      return { success: false, message: 'Username dan password harus diisi' }
    }

    // Normalize username to uppercase for comparison
    const normalizedUsername = username.trim().toUpperCase()
    const adminUsernameNormalized = PREDEFINED_ADMIN.username.toUpperCase()
    
    if (normalizedUsername === adminUsernameNormalized) {
      const isValid = await verifyPassword(password, PREDEFINED_ADMIN.passwordHash)
      if (isValid) {
        // Reset login attempts on successful login
        resetLoginAttempts()
        
        // Create session
        const userData = { 
          id: PREDEFINED_ADMIN.id, 
          username: PREDEFINED_ADMIN.username, 
          name: PREDEFINED_ADMIN.name, 
          role: PREDEFINED_ADMIN.role,
          loginAt: new Date().toISOString()
        }
        setUser(userData)
        setSessionTimeout()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        return { success: true }
      }
    }
    
    // Also check against additional admins
    const customAdmin = admins.find(a => a.username.toUpperCase() === normalizedUsername)
    if (customAdmin && customAdmin.passwordHash) {
      const isValid = await verifyPassword(password, customAdmin.passwordHash)
      if (isValid) {
        resetLoginAttempts()
        const userData = {
          id: customAdmin.id,
          username: customAdmin.username,
          name: customAdmin.name,
          role: customAdmin.role,
          loginAt: new Date().toISOString()
        }
        setUser(userData)
        setSessionTimeout()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        return { success: true }
      }
    }

    // Increment failed login attempts
    const attempts = incrementLoginAttempts()
    
    // Check if we should lock out
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      triggerLockout()
      return { 
        success: false, 
        message: 'Terlalu banyak percobaan login. Akun terkunci selama 15 menit.',
        locked: true
      }
    }

    const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts
    return { 
      success: false, 
      message: `Username atau password salah. Sisa percobaan: ${remainingAttempts}` 
    }
  }

  const logout = () => {
    setUser(null)
    clearSessionTimeout()
    localStorage.removeItem(STORAGE_KEY)
    // Reset login attempts on logout for security
    resetLoginAttempts()
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        admins,
        addAdmin,
        updateAdmin,
        deleteAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
