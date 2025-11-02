import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { User, Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (!username.trim()) {
          toast.error(t.usernameRequired);
          setLoading(false);
          return;
        }
        await login(username, password);
        toast.success(t.loginSuccess);
        navigate('/');
      } else {
        if (!username.trim()) {
          toast.error(t.usernameRequired);
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          toast.error(t.emailRequired);
          setLoading(false);
          return;
        }
        await signup(username, email, password, displayName);
        toast.success(t.signupSuccess);
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={`${t.login} - ${t.appName}`}
        description={language === 'ar' ? 'سجل دخولك إلى فلوسي - نظام إدارة المصروفات والإيرادات' : 'Login to Falusy - Personal Expense Management System'}
        keywords={language === 'ar' ? 'تسجيل الدخول, حساب, مصروفات' : 'login, account, expenses'}
      />
      <div className="min-h-screen flex items-center justify-center bg-light-gray dark:bg-charcoal p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white/80 dark:bg-charcoal/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200 dark:border-fire-red/20 glow-red animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Logo.png" 
              alt="Falusy Logo" 
              className="h-16 w-16 object-contain animate-scaleIn"
              onLoad={(e) => e.target.classList.add('animate-pulse')}
            />
          </div>
          <h1 className="text-3xl font-bold text-fire-red mb-2">{t.appName} <span className="text-lg text-gray-500">({t.appNameEn})</span></h1>
          <p className="text-gray-600 dark:text-light-gray/70">
            {isLogin ? (language === 'ar' ? 'سجل الدخول إلى حسابك' : 'Login to your account') : (language === 'ar' ? 'أنشئ حسابًا جديدًا' : 'Create a new account')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field - always shown */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.username}</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                pattern="[a-zA-Z0-9_]+"
                title={language === 'ar' ? 'أحرف إنجليزية وأرقام وشرطة سفلية فقط' : 'English letters, numbers and underscores only'}
              />
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 dark:text-light-gray/50 mt-1">
                {language === 'ar' ? '3 أحرف على الأقل - أحرف إنجليزية وأرقام وشرطة سفلية فقط' : 'At least 3 characters - English letters, numbers and underscores only'}
              </p>
            )}
          </div>

          {/* Email field - only shown on signup */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.email}</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
            </div>
          )}

          {/* Display Name field - only shown on signup */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.displayName} <span className="text-xs text-gray-400">({t.optional})</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                  placeholder={language === 'ar' ? 'أدخل اسمك (اختياري)' : 'Enter your name (optional)'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.password}</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all glow-red font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn size={20} />
            <span>{loading ? t.loading : (isLogin ? t.login : t.signup)}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 dark:text-light-gray/70 hover:text-fire-red transition-colors"
          >
            {isLogin ? t.noAccount : t.haveAccount}
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;

