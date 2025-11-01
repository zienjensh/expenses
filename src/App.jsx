import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileNavBar from './components/MobileNavBar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Revenues from './pages/Revenues';
import Reports from './pages/Reports';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
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
                          <Route path="/settings" element={<Settings />} />
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
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

const Layout = ({ children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="min-h-screen bg-light-gray dark:bg-charcoal transition-colors duration-300 relative">
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
        <aside className={`hidden lg:flex fixed right-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-charcoal border-l border-gray-200 dark:border-fire-red/20 z-40`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
        {/* Tablet Sidebar - toggleable with overlay */}
        <aside className={`hidden md:flex lg:hidden fixed right-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-charcoal border-l border-gray-200 dark:border-fire-red/20 z-40 transform transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 mr-0 lg:mr-64 p-4 md:p-6 pb-24 md:pb-6 relative">
          {children}
        </main>
      </div>
      {/* Mobile Navigation Bar - only visible on mobile */}
      <MobileNavBar />
    </div>
  );
};

export default App;

