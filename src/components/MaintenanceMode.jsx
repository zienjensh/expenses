import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Wrench, Code, AlertTriangle } from 'lucide-react';

const MaintenanceMode = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [siteStatus, setSiteStatus] = useState('normal');
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState(false);

  useEffect(() => {
    // Check admin status
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
      setLoading(false);
    };

    checkAdmin();
  }, [currentUser, isAdmin]);

  useEffect(() => {
    // Listen to site status changes
    const statusRef = doc(db, 'system', 'siteStatus');
    const unsubscribe = onSnapshot(statusRef, (doc) => {
      if (doc.exists()) {
        setSiteStatus(doc.data().status || 'normal');
      } else {
        setSiteStatus('normal');
      }
    }, (error) => {
      console.error('Error listening to site status:', error);
      setSiteStatus('normal');
    });

    return () => unsubscribe();
  }, []);

  // If loading, show loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-light-gray dark:bg-charcoal">
        <div className="text-fire-red text-2xl">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // If site is in maintenance/development mode and user is not admin, show maintenance page
  if ((siteStatus === 'maintenance' || siteStatus === 'development') && !adminStatus) {
    const isDevelopment = siteStatus === 'development';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray dark:bg-charcoal p-4">
        <div className={`max-w-md w-full p-8 rounded-2xl border-2 shadow-2xl ${
          theme === 'dark'
            ? 'bg-white/5 border-fire-red/30'
            : 'bg-white border-fire-red/20'
        }`}>
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              {isDevelopment ? (
                <div className="p-4 rounded-full bg-orange-500/20">
                  <Code className="text-orange-500" size={64} />
                </div>
              ) : (
                <div className="p-4 rounded-full bg-yellow-500/20">
                  <Wrench className="text-yellow-500" size={64} />
                </div>
              )}
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {language === 'ar' 
                ? (isDevelopment ? 'الموقع في وضع التطوير' : 'الموقع قيد الصيانة')
                : (isDevelopment ? 'Site Under Development' : 'Site Under Maintenance')
              }
            </h1>
            
            <p className={`text-lg mb-6 ${
              theme === 'dark' ? 'text-light-gray/80' : 'text-gray-600'
            }`}>
              {language === 'ar'
                ? (isDevelopment 
                    ? 'نقوم حاليًا بتطوير الموقع وتحسينه. يرجى المحاولة مرة أخرى لاحقًا.'
                    : 'الموقع قيد الصيانة حاليًا. سنعود قريبًا!')
                : (isDevelopment
                    ? 'We are currently developing and improving the site. Please try again later.'
                    : 'The site is currently under maintenance. We will be back soon!')
              }
            </p>
            
            <div className={`p-4 rounded-lg mb-6 ${
              theme === 'dark'
                ? 'bg-fire-red/10 border border-fire-red/30'
                : 'bg-fire-red/5 border border-fire-red/20'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-fire-red flex-shrink-0 mt-0.5" size={20} />
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  {language === 'ar'
                    ? 'فقط الإداريون يمكنهم الوصول للموقع في هذا الوقت.'
                    : 'Only administrators can access the site at this time.'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className={`text-sm ${
                theme === 'dark' ? 'text-light-gray/60' : 'text-gray-500'
              }`}>
                {language === 'ar' ? 'شكرًا لتفهمك' : 'Thank you for your understanding'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If site is normal or user is admin, show children
  return children;
};

export default MaintenanceMode;

