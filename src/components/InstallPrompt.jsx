import { useState, useEffect, useRef } from 'react';
import { X, Download, Smartphone, Share2, ArrowUp, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import toast from 'react-hot-toast';

const InstallPrompt = () => {
  const deferredPromptRef = useRef(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Detect iOS
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator && window.navigator.standalone) || 
                       document.referrer.includes('android-app://');

    if (isInstalled) {
      console.log('✅ App is already installed, hiding prompt');
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
        console.log('⏸️ User dismissed prompt, expiry not reached');
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
      
      console.log('✅ beforeinstallprompt event fired, deferredPrompt saved');
      
      // Show modal immediately when deferredPrompt is available
      setShowPrompt(true);
    };

    // Check for existing deferred prompt (in case event fired before component mounted)
    if (window.deferredPrompt) {
      deferredPromptRef.current = window.deferredPrompt;
      setHasDeferredPrompt(true);
      console.log('✅ Found existing deferredPrompt from window');
      setShowPrompt(true);
    } else {
      // Listen for the event
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // For iOS or if no beforeinstallprompt event (show after delay)
    // Show prompt for iOS after 3 seconds, or for Android/Desktop after 5 seconds if no prompt
    const timer = setTimeout(() => {
      if (isIOS) {
        // iOS doesn't support beforeinstallprompt, show manual instructions
        console.log('📱 iOS detected, showing manual install instructions');
        setShowPrompt(true);
      } else if (!hasDeferredPrompt && !window.deferredPrompt) {
        // For other browsers, show prompt even if beforeinstallprompt hasn't fired yet
        // The browser might show it later
        console.log('⏳ No beforeinstallprompt yet, showing prompt anyway');
        setShowPrompt(true);
      } else if (hasDeferredPrompt || window.deferredPrompt) {
        // If we have a prompt but modal isn't showing, show it now
        if (!showPrompt) {
          console.log('✅ Showing prompt with existing deferredPrompt');
          setShowPrompt(true);
        }
      }
    }, isIOS ? 3000 : 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [isIOS, hasDeferredPrompt]);

  const handleInstall = async () => {
    // For iOS, show manual instructions
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    // Get deferredPrompt from ref or window
    const prompt = deferredPromptRef.current || window.deferredPrompt;
    
    console.log('🚀 handleInstall called, prompt available:', !!prompt);
    
    if (!prompt) {
      console.warn('⚠️ No deferredPrompt available, waiting...');
      // Wait a bit and try again (prompt might be set after component mount)
      setTimeout(() => {
        const delayedPrompt = window.deferredPrompt;
        if (delayedPrompt) {
          deferredPromptRef.current = delayedPrompt;
          setHasDeferredPrompt(true);
          handleInstall();
        } else {
          // Still no prompt - show instructions or wait
          toast.info(language === 'ar' 
            ? 'يرجى استخدام زر التثبيت في المتصفح' 
            : 'Please use the browser install button');
        }
      }, 500);
      return;
    }
    
    try {
      setIsInstalling(true);
      // Show the install prompt
      console.log('📱 Calling prompt.prompt()');
      await prompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await prompt.userChoice;
      console.log('✅ User choice:', outcome);
      
      if (outcome === 'accepted') {
        toast.success(language === 'ar' ? 'تم بدء تثبيت التطبيق بنجاح!' : 'App installation started successfully!');
        setShowPrompt(false);
        deferredPromptRef.current = null;
        window.deferredPrompt = null;
        localStorage.setItem('pwa-install-dismissed', 'false');
      } else {
        toast.info(language === 'ar' ? 'تم إلغاء التثبيت' : 'Installation cancelled');
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
      setIsInstalling(false);
    } catch (error) {
      console.error('❌ Error installing app:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التثبيت. حاول مرة أخرى.' : 'An error occurred during installation. Please try again.');
      setIsInstalling(false);
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

  // Show modal if:
  // 1. showPrompt is true AND
  // 2. (has deferred prompt OR is iOS OR we're showing anyway)
  const shouldShowModal = showPrompt && (
    hasDeferredPrompt || 
    deferredPromptRef.current || 
    window.deferredPrompt || 
    isIOS ||
    showIOSInstructions
  );

  if (shouldShowModal) {
    // iOS Instructions Modal
    if (isIOS && showIOSInstructions) {
      return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`relative rounded-2xl p-6 w-full max-w-md border backdrop-blur-xl shadow-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-charcoal via-charcoal/98 to-charcoal border-fire-red/40 shadow-fire-red/30'
              : 'bg-gradient-to-br from-white via-white/98 to-white border-gray-300 shadow-gray-900/10'
          }`}>
            {/* Close button */}
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                setShowPrompt(false);
                handleDismiss();
              }}
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-fire-red'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-fire-red'
              } hover:scale-110`}
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className={`${language === 'ar' ? 'pr-0' : 'pl-0'} mb-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  theme === 'dark'
                    ? 'bg-fire-red/20 text-fire-red border border-fire-red/30'
                    : 'bg-fire-red/10 text-fire-red border border-fire-red/20'
                }`}>
                  <Share2 size={24} />
                </div>
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {language === 'ar' ? 'تثبيت التطبيق على iOS' : 'Install App on iOS'}
                </h3>
              </div>
              
              <div className={`space-y-3 text-sm ${
                theme === 'dark' ? 'text-light-gray/90' : 'text-gray-700'
              }`}>
                <p className="font-semibold mb-3">
                  {language === 'ar' ? 'اتبع الخطوات التالية:' : 'Follow these steps:'}
                </p>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' ? 'bg-fire-red/20 text-fire-red' : 'bg-fire-red/10 text-fire-red'
                  }`}>
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <p>{language === 'ar' 
                    ? 'اضغط على زر المشاركة (Share) في أسفل المتصفح' 
                    : 'Tap the Share button at the bottom of your browser'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' ? 'bg-fire-red/20 text-fire-red' : 'bg-fire-red/10 text-fire-red'
                  }`}>
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <p>{language === 'ar' 
                    ? 'اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)' 
                    : 'Select "Add to Home Screen"'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' ? 'bg-fire-red/20 text-fire-red' : 'bg-fire-red/10 text-fire-red'
                  }`}>
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <p>{language === 'ar' 
                    ? 'اضغط "إضافة" للتأكيد' 
                    : 'Tap "Add" to confirm'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowIOSInstructions(false);
                  setShowPrompt(false);
                  handleDismiss();
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-light-gray border border-white/10'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                {language === 'ar' ? 'فهمت' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Regular Install Prompt Modal
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
                    ? isIOS 
                      ? 'أضف التطبيق إلى الشاشة الرئيسية'
                      : 'تثبيت مباشر بدون خطوات معقدة'
                    : isIOS
                      ? 'Add app to home screen'
                      : 'Direct installation without complex steps'}
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
              disabled={isInstalling}
              className="group relative flex-1 px-4 py-2.5 bg-fire-red hover:bg-fire-red/90 disabled:bg-fire-red/50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isInstalling ? (
                <>
                  <div className="relative z-10 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="relative z-10 text-sm font-semibold">{language === 'ar' ? 'جاري التثبيت...' : 'Installing...'}</span>
                </>
              ) : (
                <>
                  <Download size={18} className="relative z-10" />
                  <span className="relative z-10 text-sm font-semibold">{language === 'ar' ? 'تثبيت الآن' : 'Install Now'}</span>
                </>
              )}
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

