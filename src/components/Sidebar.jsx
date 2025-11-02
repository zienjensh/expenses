import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Folder,
  FileText, 
  Settings,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import toast from 'react-hot-toast';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme } = useTheme();
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

  // Build menu items array
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t.dashboard },
    { path: '/expenses', icon: ArrowDownCircle, label: t.expenses },
    { path: '/revenues', icon: ArrowUpCircle, label: t.revenues },
    { path: '/projects', icon: Folder, label: t.projects },
    { path: '/reports', icon: FileText, label: t.reports },
    ...(!checkingAdmin && adminStatus ? [{ path: '/admin', icon: Shield, label: t.adminDashboard }] : []),
    { path: '/settings', icon: Settings, label: t.settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('تم تسجيل الخروج بنجاح');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('فشل في تسجيل الخروج');
    }
  };

  return (
    <aside className="h-full w-full flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <img 
            src="/Logo.png" 
            alt="Falusy Logo" 
            className="h-12 w-12 object-contain transition-transform duration-300 hover:scale-110"
          />
          <h1 className="text-2xl font-bold text-fire-red">
            {t.appName} <span className="text-lg text-gray-500">({t.appNameEn})</span>
          </h1>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-fire-red text-white glow-red' 
                    : 'text-gray-700 dark:text-light-gray hover:bg-fire-red/10 hover:text-fire-red'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info and Logout at bottom */}
      <div className={`p-4 border-t ${
        theme === 'dark'
          ? 'border-fire-red/20 bg-charcoal/50'
          : 'border-gray-200 bg-gray-50/50'
      }`}>
        {/* User Info */}
        <div className={`mb-3 p-3 rounded-lg ${
          theme === 'dark'
            ? 'bg-white/5 border border-white/10'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              theme === 'dark'
                ? 'bg-fire-red/20 text-fire-red border border-fire-red/30'
                : 'bg-fire-red/10 text-fire-red border border-fire-red/20'
            }`}>
              {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                theme === 'dark' ? 'text-light-gray' : 'text-gray-900'
              }`}>
                {currentUser?.displayName || t.user}
              </p>
              <p className={`text-xs truncate ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-fire-red/10 hover:bg-fire-red/20 text-fire-red border border-fire-red/20 hover:border-fire-red/40'
              : 'bg-fire-red/5 hover:bg-fire-red/10 text-fire-red border border-fire-red/20 hover:border-fire-red/40'
          }`}
        >
          <LogOut size={18} className="transition-transform duration-200 group-hover:rotate-[-15deg]" />
          <span className="font-medium">{t.logout}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

