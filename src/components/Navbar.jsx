import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { Plus, LogOut, Menu, Moon, Sun, User, Languages, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import AddTransactionModal from './AddTransactionModal';
import NotificationsPanel from './NotificationsPanel';

const Navbar = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const t = getTranslation(language);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const unreadNotifications = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          expiresAt: doc.data().expiresAt?.toDate?.() || null
        }))
        .filter(notif => {
          // Filter out expired notifications
          if (notif.expiresAt && notif.expiresAt < now) {
            return false;
          }
          return true;
        });

      setUnreadCount(unreadNotifications.length);
    }, (error) => {
      // Only log if not a permissions error (user might not be fully authenticated)
      if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
        console.error('Error fetching notifications:', error);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-20 backdrop-blur-xl border-b z-30 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-charcoal/95 via-charcoal/90 to-charcoal/95 border-fire-red/30 shadow-lg shadow-fire-red/10' 
          : 'bg-gradient-to-r from-white/95 via-white/90 to-white/95 border-gray-200/50 shadow-lg shadow-gray-900/5'
      }`}>
        {/* Top glow effect */}
        <div className={`absolute top-0 left-0 right-0 h-px ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-transparent via-fire-red/60 to-transparent'
            : 'bg-gradient-to-r from-transparent via-fire-red/40 to-transparent'
        }`} />
        
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Logo on mobile */}
            <div className="md:hidden flex items-center">
              <img 
                src="/Logo.png" 
                alt="Falusy Logo" 
                className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-110 animate-fadeIn"
              />
            </div>
            {/* Hide menu button on mobile and desktop, only show on tablet (md-lg) */}
            <button
              onClick={onToggleSidebar}
              className={`hidden md:flex lg:hidden items-center justify-center w-10 h-10 transition-all duration-300 rounded-xl backdrop-blur-sm ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red border border-white/10 hover:border-fire-red/30' 
                  : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-fire-red border border-gray-200/50 hover:border-fire-red/30'
              }`}
            >
              <Menu size={20} />
            </button>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fire-red to-fire-red/90 hover:from-fire-red/90 hover:to-fire-red text-white rounded-xl transition-all duration-300 shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-105 active:scale-95 overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Plus size={18} className="relative z-10" />
                <span className="hidden sm:inline relative z-10 font-semibold">{t.addExpense}</span>
              </button>
              
              <button
                onClick={() => setShowRevenueModal(true)}
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 active:scale-95 overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Plus size={18} className="relative z-10" />
                <span className="hidden sm:inline relative z-10 font-semibold">{t.addRevenue}</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* User Info - Glassmorphic card */}
            <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:border-fire-red/30'
                : 'bg-gray-100/50 border-gray-200/50 hover:border-fire-red/30'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-fire-red/20 text-fire-red'
                  : 'bg-fire-red/10 text-fire-red'
              }`}>
                <User size={16} />
              </div>
              <div className="text-right">
                <p className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  {currentUser?.displayName || t.user}
                </p>
                <p className={`text-[10px] ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {currentUser?.email?.split('@')[0] || ''}
                </p>
              </div>
            </div>
            
            {/* Notifications Button */}
            {currentUser && (
              <button
                onClick={() => setShowNotifications(true)}
                className={`relative flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-xl backdrop-blur-sm hover:scale-110 active:scale-95 ${
                  theme === 'dark' 
                    ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red border border-white/10 hover:border-fire-red/30' 
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-fire-red border border-gray-200/50 hover:border-fire-red/30'
                }`}
                title={t.notifications}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fire-red/0 to-fire-red/0 hover:from-fire-red/10 hover:to-transparent transition-all duration-300" />
                <Bell size={20} className="relative z-10" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-fire-red text-white text-xs rounded-full flex items-center justify-center font-bold z-20 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className={`relative flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-xl backdrop-blur-sm hover:scale-110 active:scale-95 ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red border border-white/10 hover:border-fire-red/30' 
                  : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-fire-red border border-gray-200/50 hover:border-fire-red/30'
              }`}
              title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fire-red/0 to-fire-red/0 hover:from-fire-red/10 hover:to-transparent transition-all duration-300" />
              <Languages size={20} className="relative z-10" />
              <span className={`absolute -bottom-6 text-[10px] font-semibold ${theme === 'dark' ? 'text-fire-red' : 'text-fire-red'}`}>
                {language === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`relative flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-xl backdrop-blur-sm hover:scale-110 active:scale-95 ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red border border-white/10 hover:border-fire-red/30' 
                  : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-fire-red border border-gray-200/50 hover:border-fire-red/30'
              }`}
              title={theme === 'dark' ? t.lightMode : t.darkMode}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fire-red/0 to-fire-red/0 hover:from-fire-red/10 hover:to-transparent transition-all duration-300" />
              {theme === 'dark' ? (
                <Sun size={20} className="relative z-10 animate-spin-slow" />
              ) : (
                <Moon size={20} className="relative z-10" />
              )}
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`group relative flex items-center gap-2 px-3 md:px-4 py-2.5 transition-all duration-300 rounded-xl backdrop-blur-sm hover:scale-105 active:scale-95 ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-fire-red/20 text-light-gray hover:text-fire-red border border-white/10 hover:border-fire-red/30' 
                  : 'bg-gray-100/50 hover:bg-fire-red/10 text-gray-700 hover:text-fire-red border border-gray-200/50 hover:border-fire-red/30'
              }`}
            >
              <LogOut size={18} className="transition-transform duration-300 group-hover:rotate-[-15deg]" />
              <span className="hidden sm:inline font-medium">{t.logout}</span>
            </button>
          </div>
        </div>
        
        {/* Bottom subtle glow */}
        <div className={`absolute bottom-0 left-0 right-0 h-px ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent'
            : 'bg-gradient-to-r from-transparent via-gray-200/50 to-transparent'
        }`} />
      </nav>

      {showExpenseModal && (
        <AddTransactionModal
          type="expense"
          onClose={() => setShowExpenseModal(false)}
        />
      )}

      {showRevenueModal && (
        <AddTransactionModal
          type="revenue"
          onClose={() => setShowRevenueModal(false)}
        />
      )}

      {currentUser && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default Navbar;

