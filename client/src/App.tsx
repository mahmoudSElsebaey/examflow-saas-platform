import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { OrganizationsPage } from '@/features/organizations/pages/OrganizationsPage'
import { OrganizationDetailPage } from '@/features/organizations/pages/OrganizationDetailPage'
import { OrgContentPage } from '@/features/content/pages/OrgContentPage'
import { OrgExamsPage } from '@/features/exams/pages/OrgExamsPage'
import { ExamTakePage } from '@/features/exams/pages/ExamTakePage'
import { OrgGradingPage } from '@/features/exams/pages/OrgGradingPage'
import { OrgAnalyticsPage } from '@/features/analytics/pages/OrgAnalyticsPage'
import { OrgCertificatesPage } from '@/features/certificates/pages/OrgCertificatesPage'
import { OrgStudentsPage } from '@/features/organizations/pages/OrgStudentsPage'
import { OrgMembersPage } from '@/features/organizations/pages/OrgMembersPage'
import { OrgSettingsPage } from '@/features/organizations/pages/OrgSettingsPage'
import { CertificateViewPage } from '@/features/certificates/pages/CertificateViewPage'
import { VerifyCertificatePage } from '@/features/certificates/pages/VerifyCertificatePage'
import { AdminPage } from '@/features/admin/pages/AdminPage'
import { OrgBillingPage } from '@/features/billing/pages/OrgBillingPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify/:code" element={<VerifyCertificatePage />} />
          <Route path="/app" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/app/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/app/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId" element={<ProtectedRoute><OrganizationDetailPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/content" element={<ProtectedRoute><OrgContentPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/exams" element={<ProtectedRoute><OrgExamsPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/grading" element={<ProtectedRoute><OrgGradingPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/grading/:attemptId" element={<ProtectedRoute><OrgGradingPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/attempts/:attemptId" element={<ProtectedRoute><ExamTakePage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/analytics" element={<ProtectedRoute><OrgAnalyticsPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/certificates" element={<ProtectedRoute><OrgCertificatesPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/certificates/:certId" element={<ProtectedRoute><CertificateViewPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/students" element={<ProtectedRoute><OrgStudentsPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/members" element={<ProtectedRoute><OrgMembersPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/settings" element={<ProtectedRoute><OrgSettingsPage /></ProtectedRoute>} />
          <Route path="/app/organizations/:orgId/billing" element={<ProtectedRoute><OrgBillingPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
