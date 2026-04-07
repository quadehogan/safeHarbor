import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CookieConsent } from '@/components/CookieConsent'

import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ImpactPage } from '@/pages/ImpactPage'
import { ContactPage } from '@/pages/ContactPage'

// Donor
import { DonationsPage } from '@/pages/DonationsPage'

// Admin / Staff
import { OverviewPage } from '@/pages/OverviewPage'
import { SupportersPage } from '@/pages/SupportersPage'
import { ResidentsPage } from '@/pages/ResidentsPage'
import { CaseActivityPage } from '@/pages/CaseActivityPage'
import { SafehousesPage } from '@/pages/SafehousesPage'
import { SocialMediaPage } from '@/pages/SocialMediaPage'
import { PartnersPage } from '@/pages/PartnersPage'

const STAFF = ['Admin', 'SocialWorker']
const DONOR = ['DonorPortal']

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Donor */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute roles={[...STAFF, ...DONOR]}>
              <DonationsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin / Staff */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={STAFF}>
              <OverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supporters"
          element={
            <ProtectedRoute roles={STAFF}>
              <SupportersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/residents"
          element={
            <ProtectedRoute roles={STAFF}>
              <ResidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/residents/:id"
          element={
            <ProtectedRoute roles={STAFF}>
              <CaseActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safehouses"
          element={
            <ProtectedRoute roles={STAFF}>
              <SafehousesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/social-media"
          element={
            <ProtectedRoute roles={STAFF}>
              <SocialMediaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute roles={STAFF}>
              <PartnersPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Global overlays */}
      <CookieConsent />
    </BrowserRouter>
  )
}
