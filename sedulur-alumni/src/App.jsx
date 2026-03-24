import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import KasAlumni from './pages/KasAlumni'
import Anggota from './pages/Anggota'
import Agenda from './pages/Agenda'
import Galeri from './pages/Galeri'
import Pembayaran from './pages/Pembayaran'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLayout from './pages/admin/AdminLayout'
import Login from './pages/admin/Login'
import Users from './pages/admin/Users'
import Settings from './pages/admin/Settings'
import ProtectedRoute from './components/ProtectedRoute'

// Wrapper component for public pages with Navbar and Footer
function PublicLayout() {
  const location = useLocation()
  
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/kas-alumni" element={<KasAlumni />} />
          <Route path="/anggota" element={<Anggota />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              {/* Public Routes with Layout */}
              <Route path="/*" element={<PublicLayout />} />

              {/* Login Page - Public */}
              <Route path="/admin/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="anggota" element={<AdminDashboard />} />
                <Route path="agenda" element={<AdminDashboard />} />
                <Route path="galeri" element={<AdminDashboard />} />
                <Route path="pembayaran" element={<AdminDashboard />} />
                <Route path="kas" element={<AdminDashboard />} />
                <Route path="whatsapp" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
