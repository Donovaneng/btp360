import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterClient from './pages/RegisterClient';
import RegisterPartner from './pages/RegisterPartner';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Services from './pages/Services';
import Partenaires from './pages/Partenaires';
import Projets from './pages/Projets';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import ClientDashboard from './pages/ClientDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import PartnerProfile from './pages/PartnerProfile';
import Academy from './pages/Academy';
import ArticleDetail from './pages/ArticleDetail';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePartners from './pages/admin/ManagePartners';
import ManageAcademy from './pages/admin/ManageAcademy';
import EditArticle from './pages/admin/EditArticle';
import ManageCategories from './pages/admin/ManageCategories';
import ManageLeads from './pages/admin/ManageLeads';
import ManageDevis from './pages/admin/ManageDevis';
import ManageComments from './pages/admin/ManageComments';
import ManageClients from './pages/admin/ManageClients';
import SearchPage from './pages/SearchPage';
import Profile from './pages/Profile';
import Devis from './pages/Devis';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import LegalNotice from './pages/legal/LegalNotice';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-client" element={<RegisterClient />} />
            <Route path="/register-partner" element={<RegisterPartner />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projets" element={<Projets />} />
            <Route path="/projet/:id" element={<ProjectDetail />} />
            <Route path="/partenaires" element={<Partenaires />} />
            <Route path="/partenaire/:id" element={<PartnerProfile />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/academie" element={<Academy />} />
            <Route path="/academie/:slug" element={<ArticleDetail />} />
            
            {/* Pages Légales */}
            <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
            <Route path="/cgu" element={<TermsOfService />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            
            {/* Routes Protégées - Tableaux de Bord */}
            <Route 
              path="/dashboard-client" 
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-partner" 
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <PartnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parametres" 
              element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profil" 
              element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/partners" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManagePartners /> 
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/clients" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManageClients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/academy" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManageAcademy />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/academy/new" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <EditArticle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/academy/edit/:id" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <EditArticle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManageCategories />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/leads" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManageLeads />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/devis" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManageDevis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/comments" 
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ManageComments />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
