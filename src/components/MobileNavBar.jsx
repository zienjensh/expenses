import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Folder, FileText, Settings, Shield, Activity, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';

const MobileNavBar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { currentUser, isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [adminStatus, setAdminStatus] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        try {
          const admin = await isAdmin();
          setAdminStatus(admin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setAdminStatus(false);
        }
      }
      setCheckingAdmin(false);
    };

    checkAdmin();
  }, [currentUser, isAdmin]);

  // Build nav items array
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t.dashboard },
    { path: '/expenses', icon: ArrowDownCircle, label: t.expenses },
    { path: '/revenues', icon: ArrowUpCircle, label: t.revenues },
    { path: '/projects', icon: Folder, label: t.projects },
    { path: '/reports', icon: FileText, label: t.reports },
    { path: '/activity-log', icon: Activity, label: t.activityLog },
    { path: '/support', icon: MessageCircle, label: t.support },
    ...(!checkingAdmin && adminStatus ? [{ path: '/admin', icon: Shield, label: t.admin }] : []),
    { path: '/settings', icon: Settings, label: t.settings },
  ];

  return (
    <nav 
      id="mobile-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-[9999] block md:hidden" 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 9999,
        willChange: 'auto',
        pointerEvents: 'auto'
      }}
    >
      {/* Gradient overlay for depth */}
      <div className={`absolute inset-0 ${
        theme === 'dark'
          ? 'bg-gradient-to-t from-charcoal via-charcoal/98 to-charcoal/95'
          : 'bg-gradient-to-t from-white via-white/98 to-white/95'
      }`} />
      
      {/* Main navigation bar */}
      <div 
        className={`relative backdrop-blur-xl border-t transition-all duration-300 shadow-2xl ${
          theme === 'dark'
            ? 'bg-charcoal/80 border-fire-red/30 shadow-fire-red/10'
            : 'bg-white/80 border-gray-300/50 shadow-gray-900/5'
        }`}
        style={{ isolation: 'isolate' }}
      >
        {/* Top glow effect */}
        <div className={`absolute top-0 left-0 right-0 h-px ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-transparent via-fire-red/50 to-transparent'
            : 'bg-gradient-to-r from-transparent via-fire-red/30 to-transparent'
        }`} />
        
        <div className={`flex items-center h-20 px-2 pb-safe ${
          navItems.length > 5 
            ? 'justify-start overflow-x-auto scrollbar-hide' 
            : 'justify-around'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                  className={`
                  relative flex flex-col items-center justify-center gap-1.5 px-1.5 py-2.5 rounded-2xl
                  transition-all duration-300 ease-out
                  ${navItems.length > 5 
                    ? 'min-w-[60px] flex-shrink-0' 
                    : 'flex-1'
                  }
                  ${isActive 
                    ? 'transform scale-105' 
                    : 'active:scale-95'
                  }
                `}
              >
                {/* Active background glow */}
                {isActive && (
                  <>
                    <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-fire-red/30'
                        : 'bg-fire-red/20'
                    }`} />
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-fire-red/10 border border-fire-red/30'
                        : 'bg-fire-red/5 border border-fire-red/20'
                    }`} />
                  </>
                )}
                
                {/* Icon container */}
                <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-fire-red/20 scale-110 shadow-lg shadow-fire-red/20' 
                    : theme === 'dark'
                      ? 'bg-gray-800/50 hover:bg-gray-700/50'
                      : 'bg-gray-100/50 hover:bg-gray-200/50'
                }`}>
                  <Icon 
                    size={22} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-fire-red' 
                        : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Pulsing dot for active state */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-fire-red rounded-full animate-pulse ring-2 ring-fire-red/30" />
                  )}
                </div>
                
                {/* Label */}
                <span className={`relative z-10 text-[9px] font-semibold transition-all duration-300 text-center leading-tight ${
                  isActive 
                    ? 'text-fire-red opacity-100 scale-105' 
                    : theme === 'dark'
                      ? 'text-gray-400 opacity-70'
                      : 'text-gray-600 opacity-70'
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-fire-red rounded-full shadow-lg shadow-fire-red/50" />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Bottom safe area for devices with notch */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </nav>
  );
};

export default MobileNavBar;

