import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import { DonationsPage } from './pages/DonationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/donations" element={<DonationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
