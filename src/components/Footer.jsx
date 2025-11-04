import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`mt-8 pt-6 border-t ${
      theme === 'dark' 
        ? 'bg-transparent border-fire-red/20' 
        : 'bg-transparent border-gray-200'
    }`}>
      <div className={`max-w-7xl mx-auto px-4 md:px-6 py-4 ${
        language === 'ar' ? 'text-right' : 'text-left'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
          }`}>
            {language === 'ar' 
              ? `جميع الحقوق محفوظة © ${currentYear} لتطبيق فلوسي - Falusy`
              : `All rights reserved © ${currentYear} Falusy App`
            }
          </p>
          <div className={`flex items-center gap-2 text-sm ${
            theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
          }`}>
            <span>
              {language === 'ar' ? 'تم التطوير بواسطة' : 'Developed by'}
            </span>
            <a
              href="https://tagalgo.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold transition-all hover:text-fire-red flex items-center gap-1.5 group ${
                theme === 'dark' ? 'text-light-gray' : 'text-gray-900'
              }`}
            >
              <span>tagalgo</span>
              <ExternalLink size={12} className="text-fire-red opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

