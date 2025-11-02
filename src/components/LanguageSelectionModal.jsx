import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { X, Globe } from 'lucide-react';

const LanguageSelectionModal = () => {
  const { language, setLanguage } = useLanguage();
  const t = getTranslation(language);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has selected a language before
    const hasSelectedLanguage = localStorage.getItem('languageSelected') === 'true';
    if (!hasSelectedLanguage) {
      // Delay showing modal slightly for smooth animation
      setTimeout(() => setShowModal(true), 500);
    }
  }, []);

  const handleLanguageSelect = (selectedLang) => {
    setLanguage(selectedLang);
    localStorage.setItem('languageSelected', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-charcoal rounded-2xl shadow-2xl border border-gray-200 dark:border-fire-red/30 overflow-hidden transform transition-all duration-300 scale-100 animate-scaleIn">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-fire-red/5 via-transparent to-fire-red/5" />
        
        {/* Close button */}
        <button
          onClick={() => {
            // If no language selected, default to Arabic
            if (!localStorage.getItem('languageSelected')) {
              setLanguage('ar');
              localStorage.setItem('languageSelected', 'true');
            }
            setShowModal(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 z-10"
        >
          <X size={20} className="text-gray-600 dark:text-gray-400" />
        </button>

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-fire-red/10 dark:bg-fire-red/20 mb-4 animate-pulse">
              <Globe size={32} className="text-fire-red" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'اختر اللغة' : 'Choose Language'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'اختر اللغة المفضلة لديك' : 'Select your preferred language'}
            </p>
          </div>

          {/* Language options */}
          <div className="space-y-3">
            <button
              onClick={() => handleLanguageSelect('ar')}
              className="w-full group relative p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:border-fire-red dark:hover:border-fire-red/50 bg-white dark:bg-white/5 hover:bg-fire-red/5 dark:hover:bg-fire-red/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fire-red/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-fire-red/20 to-fire-red/10 flex items-center justify-center text-2xl font-bold text-fire-red">
                    🇸🇦
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">العربية</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Arabic</p>
                  </div>
                </div>
                {language === 'ar' && (
                  <div className="w-6 h-6 rounded-full bg-fire-red flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full group relative p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:border-fire-red dark:hover:border-fire-red/50 bg-white dark:bg-white/5 hover:bg-fire-red/5 dark:hover:bg-fire-red/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fire-red/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-fire-red/20 to-fire-red/10 flex items-center justify-center text-2xl font-bold text-fire-red">
                    🇺🇸
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">English</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الإنجليزية</p>
                  </div>
                </div>
                {language === 'en' && (
                  <div className="w-6 h-6 rounded-full bg-fire-red flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
            {language === 'ar' ? 'يمكنك تغيير اللغة لاحقاً من الإعدادات' : 'You can change language later from settings'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionModal;

