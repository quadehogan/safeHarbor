import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import { DonationsPage } from './pages/DonationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/donations" element={<DonationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
