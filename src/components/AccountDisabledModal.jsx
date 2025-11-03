import { MessageCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const AccountDisabledModal = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const whatsappNumber = '+201289963550';
  const whatsappMessage = language === 'ar' 
    ? 'مرحباً، تم غلق حسابي وأحتاج إلى مساعدتكم'
    : 'Hello, my account has been disabled and I need your help';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 pointer-events-auto">
      <div className={`relative w-full max-w-md rounded-2xl border-2 shadow-2xl animate-fadeIn pointer-events-auto ${
        theme === 'dark'
          ? 'bg-charcoal border-fire-red/50'
          : 'bg-white border-fire-red/30'
      }`}>
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-fire-red/20">
              <AlertTriangle className="text-fire-red" size={64} />
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold text-center mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {language === 'ar' ? 'تم غلق حسابك' : 'Account Disabled'}
          </h2>

          {/* Message */}
          <p className={`text-center mb-6 leading-relaxed ${
            theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
          }`}>
            {language === 'ar' 
              ? 'تم تعطيل حسابك. يرجى التواصل مع الدعم لحل المشكلة.'
              : 'Your account has been disabled. Please contact support to resolve this issue.'
            }
          </p>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl mb-4"
          >
            <MessageCircle size={24} />
            <span>
              {language === 'ar' ? 'تواصل مع الدعم عبر واتساب' : 'Contact Support via WhatsApp'}
            </span>
          </button>

          {/* Phone Number Display */}
          <div className={`text-center text-sm ${
            theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
          }`}>
            {whatsappNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDisabledModal;

