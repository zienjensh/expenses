import { useState, useEffect, useRef } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import toast from 'react-hot-toast';

const InstallPrompt = () => {
  const deferredPromptRef = useRef(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator && window.navigator.standalone) || 
                       document.referrer.includes('android-app://');

    if (isInstalled) {
      return; // Don't show prompt if already installed
    }

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

    if (!shouldShowPrompt) {
      return; // Don't show if user dismissed and it hasn't expired
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      // Save to both ref and window for persistence
      deferredPromptRef.current = e;
      window.deferredPrompt = e;
      setHasDeferredPrompt(true);
      
      console.log('beforeinstallprompt event fired, deferredPrompt saved');
      
      // Show modal only when deferredPrompt is available
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    // Check for existing deferred prompt (in case event fired before component mounted)
    if (window.deferredPrompt) {
      deferredPromptRef.current = window.deferredPrompt;
      setHasDeferredPrompt(true);
      console.log('Found existing deferredPrompt from window');
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    } else {
      // Only listen for the event if we don't have a deferredPrompt yet
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    // Get deferredPrompt from ref or window
    const prompt = deferredPromptRef.current || window.deferredPrompt;
    
    console.log('handleInstall called, prompt available:', !!prompt);
    
    if (!prompt) {
      console.warn('No deferredPrompt available');
      // Try to get it again from window (in case it was set after component mount)
      const delayedPrompt = window.deferredPrompt;
      if (delayedPrompt) {
        deferredPromptRef.current = delayedPrompt;
        // Retry with the found prompt
        return handleInstall();
      }
      
      // If still no prompt, don't show error - just hide the modal
      // The modal should only show when prompt is available anyway
      setShowPrompt(false);
      return;
    }
    
    try {
      // Show the install prompt
      console.log('Calling prompt.prompt()');
      await prompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await prompt.userChoice;
      console.log('User choice:', outcome);
      
      if (outcome === 'accepted') {
        toast.success(language === 'ar' ? 'تم بدء تثبيت التطبيق' : 'App installation started');
        setShowPrompt(false);
        deferredPromptRef.current = null;
        window.deferredPrompt = null;
        localStorage.setItem('pwa-install-dismissed', 'false');
      } else {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
        // Show again after 7 days
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        localStorage.setItem('pwa-install-expiry', expiry.toISOString());
      }
      
      // Clear the deferredPrompt after use
      deferredPromptRef.current = null;
      window.deferredPrompt = null;
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التثبيت' : 'An error occurred during installation');
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

  const handleLater = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    // Show again after 7 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    localStorage.setItem('pwa-install-expiry', expiry.toISOString());
  };

  // Show compact modal only if prompt is available AND showPrompt is true
  if (showPrompt && hasDeferredPrompt && (deferredPromptRef.current || window.deferredPrompt)) {
    return (
      <div className={`fixed bottom-24 md:bottom-8 ${language === 'ar' ? 'left-4' : 'right-4'} z-[9998] animate-scaleIn`}>
        <div className={`relative rounded-2xl p-5 w-80 max-w-[calc(100vw-2rem)] border backdrop-blur-xl shadow-2xl overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-charcoal via-charcoal/98 to-charcoal border-fire-red/40 shadow-fire-red/30'
            : 'bg-gradient-to-br from-white via-white/98 to-white border-gray-300 shadow-gray-900/10'
        }`}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fire-red/5 via-transparent to-fire-red/5 pointer-events-none" />
          
          {/* Glowing effect */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            theme === 'dark' ? 'bg-fire-red/20' : 'bg-fire-red/10'
          }`} />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-fire-red border border-white/10'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-fire-red border border-gray-200'
            } hover:scale-110 active:scale-95`}
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className={`relative ${language === 'ar' ? 'pr-8' : 'pl-8'} mb-4`}>
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                theme === 'dark'
                  ? 'bg-fire-red/20 text-fire-red border border-fire-red/30'
                  : 'bg-fire-red/10 text-fire-red border border-fire-red/20'
              }`}>
                <Smartphone size={24} />
              </div>
              
              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {language === 'ar' ? 'ثبت التطبيق' : 'Install App'}
                </h3>
                <p className={`text-xs leading-relaxed ${
                  theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
                }`}>
                  {language === 'ar' 
                    ? 'وصول سريع وتجربة أفضل'
                    : 'Quick access & better experience'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleLater}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray border border-white/10 hover:border-white/20'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300'
              } hover:scale-[1.02] active:scale-[0.98]`}
            >
              {language === 'ar' ? 'لاحقاً' : 'Later'}
            </button>
            <button
              onClick={handleInstall}
              className="group relative flex-1 px-4 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Download size={18} className="relative z-10" />
              <span className="relative z-10 text-sm font-semibold">{language === 'ar' ? 'تثبيت' : 'Install'}</span>
            </button>
          </div>

          {/* Bottom accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-fire-red/60 via-fire-red to-fire-red/60'
              : 'bg-gradient-to-r from-fire-red/40 via-fire-red to-fire-red/40'
          }`} />
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;

