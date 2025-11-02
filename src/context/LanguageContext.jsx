import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage
    const saved = localStorage.getItem('language');
    // If no language saved and no selection made, return null to show modal
    const hasSelected = localStorage.getItem('languageSelected') === 'true';
    if (!saved && !hasSelected) {
      return 'ar'; // Default to Arabic but show modal
    }
    return saved || 'ar';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
    
    // Update HTML lang and dir attributes
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    
    // Add/remove RTL class for CSS targeting
    if (language === 'ar') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

