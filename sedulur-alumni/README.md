# Sedulur Alumni Website

Website resmi alumni untuk mengelola komunikasi, iuran, dan acara alumni.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Recharts

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Admin Dashboard

### Login Credentials

| Username | Password |
|----------|----------|
| SEDULURALUMNI | alumni123 |


### Admin Features

- **Dashboard** - Overview statistics and recent activities
- **Anggota** - Manage alumni members
- **Agenda** - Manage events and activities
- **Galeri** - Manage photo gallery
- **Pembayaran** - Manage payments
- **Kas** - Manage funds
- **Users** - Manage admin users

### Access Admin Panel

1. Go to `/admin/login`
2. Login with credentials above
3. Manage all content from the dashboard

## Project Structure

```
sedulur-alumni/
├── src/
│   ├── components/     # Reusable components
│   ├── context/       # React context (AuthContext)
│   ├── pages/         # Page components
│   │   └── admin/    # Admin pages
│   ├── App.jsx       # Main app component
│   ├── main.jsx      # Entry point
│   └── index.css     # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Notes

- Data is stored in localStorage
- Admin users can be added/edited/deleted from the Users page
- Session persists until logout

## pesan ai
- Hallo {"nama/data}
  kami dari tim sedulur alumni ingin mengingatkan bahwasanya {"nama/data} nelum melakukan pembayaran kas dibulan{"bulan=tahun"}.
  kami harap anda segera melakukan pembayran secara tf/tunai, kami akan tunggu anda selama 1x24 jam,

  Terima kasih
  tem sedulur alumni