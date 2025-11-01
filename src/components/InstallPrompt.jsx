import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator && window.navigator.standalone) || 
                       document.referrer.includes('android-app://');

    // Check if user has dismissed the prompt before
    const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
    const expiryDate = localStorage.getItem('pwa-install-expiry');
    
    // Check if dismissal has expired (7 days)
    let shouldShowPrompt = true;
    if (hasSeenPrompt === 'true' && expiryDate) {
      const expiry = new Date(expiryDate);
      const now = new Date();
      if (now < expiry) {
        shouldShowPrompt = false;
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt if:
      // 1. App is not installed
      // 2. User hasn't dismissed it or dismissal expired
      if (!isInstalled && shouldShowPrompt && hasSeenPrompt !== 'false') {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('تم بدء تثبيت التطبيق');
        setShowPrompt(false);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-install-dismissed', 'false');
      } else {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
        // Show again after 7 days
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        localStorage.setItem('pwa-install-expiry', expiry.toISOString());
      }
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('حدث خطأ أثناء التثبيت');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    // Show again after 7 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    localStorage.setItem('pwa-install-expiry', expiry.toISOString());
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className={`relative rounded-2xl p-6 w-full max-w-md border backdrop-blur-xl animate-fadeIn ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-fire-red/30 shadow-xl shadow-fire-red/20'
          : 'bg-gradient-to-br from-white via-white/95 to-white border-gray-200 shadow-xl'
      }`}>
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={`absolute top-4 left-4 p-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-fire-red hover:bg-white/10'
              : 'text-gray-500 hover:text-fire-red hover:bg-gray-100'
          }`}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-fire-red/20 text-fire-red'
              : 'bg-fire-red/10 text-fire-red'
          }`}>
            <Smartphone size={32} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ثبت التطبيق على جهازك
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
          }`}>
            استمتع بتجربة أفضل مع إمكانية الوصول السريع والعمل بدون إنترنت
          </p>
        </div>

        {/* Benefits */}
        <div className={`space-y-2 mb-6 p-4 rounded-xl ${
          theme === 'dark'
            ? 'bg-white/5 border border-white/10'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-fire-red" />
            <span className={theme === 'dark' ? 'text-light-gray' : 'text-gray-700'}>
              وصول سريع من شاشة البداية
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-fire-red" />
            <span className={theme === 'dark' ? 'text-light-gray' : 'text-gray-700'}>
              يعمل بدون إنترنت (Offline)
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-fire-red" />
            <span className={theme === 'dark' ? 'text-light-gray' : 'text-gray-700'}>
              أداء أسرع وتجربة أفضل
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className={`flex-1 px-4 py-3 rounded-xl transition-all ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-light-gray border border-white/10'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            لاحقاً
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-fire-red/30"
          >
            <Download size={20} />
            <span>تثبيت</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;

