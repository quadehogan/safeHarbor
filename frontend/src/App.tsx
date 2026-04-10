import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CookieConsent } from '@/components/CookieConsent'

import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { MfaVerifyPage } from '@/pages/MfaVerifyPage'
import { MfaSetupPage } from '@/pages/MfaSetupPage'
import { ImpactPage } from '@/pages/ImpactPage'
import { ContactPage } from '@/pages/ContactPage'
import { PrivacyPage } from '@/pages/PrivacyPage'

// Donor
import { DonationsPage } from '@/pages/DonationsPage'
import { DonorImpactPage } from '@/pages/DonorImpactPage'

// Admin / Staff
import { OverviewPage } from '@/pages/OverviewPage'
import { SupportersPage } from '@/pages/SupportersPage'
import { ResidentsPage } from '@/pages/ResidentsPage'
import { CaseActivityPage } from '@/pages/CaseActivityPage'
import { SafehousesPage } from '@/pages/SafehousesPage'
import { SocialMediaPage } from '@/pages/SocialMediaPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { HomeVisitationPage } from '@/pages/HomeVisitationPage'

const STAFF = ['Admin', 'SocialWorker']
const DONOR = ['DonorPortal']

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium">
        Skip to main content
      </a>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route
          path="/account/mfa"
          element={
            <ProtectedRoute roles={['Admin', 'SocialWorker', 'DonorPortal']}>
              <MfaSetupPage />
            </ProtectedRoute>
          }
        />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Donor */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute roles={[...STAFF, ...DONOR]}>
              <DonorImpactPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/impact"
          element={
            <ProtectedRoute roles={[...STAFF, ...DONOR]}>
              <DonorImpactPage />
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
          path="/donors"
          element={
            <ProtectedRoute roles={STAFF}>
              <DonationsPage />
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
          path="/process-recordings"
          element={
            <ProtectedRoute roles={STAFF}>
              <CaseActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-visitation"
          element={
            <ProtectedRoute roles={STAFF}>
              <HomeVisitationPage />
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
          path="/reports"
          element={
            <ProtectedRoute roles={STAFF}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Global overlays */}
      <CookieConsent />
    </BrowserRouter>
  )
}
