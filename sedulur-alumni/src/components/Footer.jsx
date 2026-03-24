import { Link } from 'react-router-dom'
import { HiHome, HiCurrencyDollar, HiUsers, HiCalendar, HiPhotograph, HiCreditCard, HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { FaInstagram, FaFacebook, FaYoutube, FaTwitter } from 'react-icons/fa'
import { useData } from '../context/DataContext'

const footerLinks = [
  { name: 'Home', path: '/', icon: HiHome },
  { name: 'Kas Alumni', path: '/kas-alumni', icon: HiCurrencyDollar },
  { name: 'Anggota', path: '/anggota', icon: HiUsers },
  { name: 'Agenda', path: '/agenda', icon: HiCalendar },
  { name: 'Galeri', path: '/galeri', icon: HiPhotograph },
  { name: 'Pembayaran', path: '/pembayaran', icon: HiCreditCard },
]

const socialLinks = [
  { name: 'Instagram', icon: FaInstagram, href: '#' },
  { name: 'Facebook', icon: FaFacebook, href: '#' },
  { name: 'Youtube', icon: FaYoutube, href: '#' },
  { name: 'Twitter', icon: FaTwitter, href: '#' },
]

export default function Footer() {
  const { data } = useData()
  
  const websiteName = data?.website?.name || 'Sedulur Alumni'
  const contact = data?.contact || {}

  return (
    <footer className="bg-dark-950 border-t border-white/5">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">{websiteName}</h3>
                <p className="text-xs text-dark-400">Merangkul Masa Depan</p>
              </div>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              Membangun jaringan alumni yang solid, memperluas koneksi profesional, 
              dan berkontribusi bagi kemajuan almamater dan masyarakat.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-dark-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <HiLocationMarker className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>{contact.address || 'Lumajang, Indonesia'}</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <HiMail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>{contact.email || 'info@seduluralumni.id'}</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <HiPhone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>{contact.phone || '+62 812 3456 7890'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-dark-400 text-sm mb-4">
              Dapatkan informasi terbaru tentang kegiatan dan berita alumni.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Email Anda"
                className="input-field text-sm"
              />
              <button type="submit" className="btn-primary w-full text-sm">
                Berlangganan
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-sm">
            © 2024 {websiteName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-dark-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-dark-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
