import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { getTranslation } from './utils/i18n';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileNavBar from './components/MobileNavBar';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import LanguageSelectionModal from './components/LanguageSelectionModal';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Revenues from './pages/Revenues';
import Reports from './pages/Reports';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import Support from './pages/Support';
import SupportManagement from './pages/SupportManagement';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <TransactionProvider>
                    <ProjectsProvider>
                      <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/expenses" element={<Expenses />} />
                          <Route path="/revenues" element={<Revenues />} />
                          <Route path="/projects" element={<Projects />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/activity-log" element={<ActivityLog />} />
                          <Route path="/support" element={<Support />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route 
                            path="/admin" 
                            element={
                              <AdminRoute>
                                <AdminDashboard />
                              </AdminRoute>
                            } 
                          />
                          <Route 
                            path="/admin/support" 
                            element={
                              <AdminRoute>
                                <SupportManagement />
                              </AdminRoute>
                            } 
                          />
                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </Layout>
                    </ProjectsProvider>
                  </TransactionProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#F2F2F2',
                border: '1px solid #E50914',
                fontFamily: 'Tajawal, sans-serif',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#E50914',
                  secondary: '#fff',
                },
              },
            }}
          />
          <InstallPrompt />
          <OfflineIndicator />
          <LanguageSelectionModal />
        </Router>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const Layout = ({ children, sidebarOpen, setSidebarOpen }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = getTranslation(language);
  
  return (
    <div className={`min-h-screen bg-light-gray dark:bg-charcoal transition-colors duration-300 relative ${dir}`}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-20">
        {/* Desktop Sidebar Overlay - only show on tablet (md-lg), not on desktop */}
        {sidebarOpen && (
          <div 
            className="hidden md:block lg:hidden fixed inset-0 bg-black/50 dark:bg-black/50 z-30" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        {/* Desktop Sidebar - always visible on desktop (lg+), toggleable on tablet (md-lg) */}
        <aside className={`hidden lg:flex fixed ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} top-20 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-charcoal border-gray-200 dark:border-fire-red/20 z-40`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
        {/* Tablet Sidebar - toggleable with overlay */}
        <aside className={`hidden md:flex lg:hidden fixed ${dir === 'rtl' ? 'right-0' : 'left-0'} top-20 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-charcoal ${dir === 'rtl' ? 'border-l' : 'border-r'} border-gray-200 dark:border-fire-red/20 z-40 transform transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
        {/* Main content with bottom padding for mobile nav */}
        <main className={`flex-1 ${dir === 'rtl' ? 'mr-0 lg:mr-64' : 'ml-0 lg:ml-64'} p-4 md:p-6 pb-24 md:pb-6 relative`}>
          {children}
        </main>
      </div>
      {/* Floating Support Button - only visible on mobile */}
      <Link
        to="/support"
        className={`md:hidden fixed ${dir === 'rtl' ? 'left-4' : 'right-4'} bottom-24 z-50 bg-fire-red hover:bg-fire-red/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none flex items-center justify-center`}
        title={t.supportTitle}
      >
        <MessageCircle size={24} />
      </Link>
      {/* Mobile Navigation Bar - only visible on mobile */}
      <MobileNavBar />
    </div>
  );
};

export default App;

