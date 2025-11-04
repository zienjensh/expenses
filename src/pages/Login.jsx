import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { User, Mail, Lock, LogIn, Phone, Sparkles, ArrowRight, Wallet, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const authContext = useAuth();
  const { login, signup, currentUser, loading: authLoading } = authContext || {};
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  // Redirect after successful login/signup
  useEffect(() => {
    if (shouldRedirect && !authLoading && currentUser) {
      setLoading(false);
      navigate('/', { replace: true });
      setShouldRedirect(false);
      return;
    }
    
    // Fallback: redirect after timeout if auth state doesn't update
    if (shouldRedirect) {
      const timeoutId = setTimeout(() => {
        if (!authLoading && currentUser) {
          setLoading(false);
          navigate('/', { replace: true });
          setShouldRedirect(false);
        } else if (!authLoading) {
          // If still no user after timeout, reset state
          setLoading(false);
          setShouldRedirect(false);
          toast.error(language === 'ar' ? 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.' : 'Login error occurred. Please try again.');
        }
      }, 3000); // 3 seconds timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [shouldRedirect, currentUser, authLoading, navigate, language]);

  // Debug: Check if login function exists
  if (!login || typeof login !== 'function') {
    console.error('Login function not available:', { authContext, login, signup });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (!username.trim()) {
          toast.error(language === 'ar' ? 'يرجى إدخال اسم المستخدم أو رقم الهاتف' : 'Please enter username or phone number');
          setLoading(false);
          return;
        }
        if (!login || typeof login !== 'function') {
          toast.error('خطأ في تهيئة نظام المصادقة. يرجى إعادة تحميل الصفحة.');
          console.error('Login function not available:', { login, authContext });
          setLoading(false);
          return;
        }
        await login(username, password);
        toast.success(t.loginSuccess);
        // Set flag to redirect once auth state updates
        setShouldRedirect(true);
        // Keep loading state until redirect happens
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
        await signup(username, email, password, displayName, phoneNumber);
        toast.success(t.signupSuccess);
        // Set flag to redirect once auth state updates
        setShouldRedirect(true);
        // Keep loading state until redirect happens
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || t.error);
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
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-fire-red/20 via-charcoal/50 to-fire-red/10 dark:from-fire-red/30 dark:via-charcoal dark:to-fire-red/20">
          {/* Animated gradient orbs - smaller on mobile */}
          <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-fire-red/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-fire-red/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-fire-red/10 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>

        {/* Floating particles - fewer on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-fire-red/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Main Content - Compact on mobile */}
        <div className="relative z-10 w-full md:max-w-md md:px-4 flex items-center justify-center py-2 md:py-4">
          <div 
            className={`relative bg-white/10 dark:bg-charcoal/40 backdrop-blur-xl w-full md:rounded-3xl p-4 md:p-8 lg:p-10 border-0 md:border border-white/20 dark:border-fire-red/30 shadow-2xl transition-all duration-500 flex flex-col md:justify-start ${
              isLogin ? 'animate-slideInUp' : 'animate-slideInDown'
            }`}
            style={{
              boxShadow: '0 8px 32px rgba(229, 9, 20, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Top glow effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fire-red/60 to-transparent"></div>
            
            {/* Logo and Header */}
            <div className="text-center mb-4 md:mb-8 animate-fadeInUp">
              <div className="relative inline-flex items-center justify-center mb-2 md:mb-6">
                <div className="absolute inset-0 bg-fire-red/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-fire-red/20 to-fire-red/10 p-2 md:p-4 rounded-lg md:rounded-2xl border border-fire-red/30 shadow-lg">
                  <img 
                    src="/Logo.png" 
                    alt="Falusy Logo" 
                    className="h-10 w-10 md:h-16 md:w-16 object-contain animate-scaleIn"
                  />
                </div>
                <Sparkles className="absolute -top-0.5 -right-0.5 md:-top-2 md:-right-2 text-fire-red animate-sparkle md:w-6 md:h-6" size={14} />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-fire-red to-fire-red/80 bg-clip-text text-transparent mb-1 md:mb-2 animate-fadeInUp delay-100">
                {t.appName}
              </h1>
              <p className="text-[10px] md:text-sm text-gray-500 dark:text-light-gray/60 mb-0.5 md:mb-1">
                <span className="text-fire-red font-semibold">{t.appNameEn}</span>
              </p>
              <p className="text-gray-600 dark:text-light-gray/70 text-[10px] md:text-sm mt-2 md:mt-4 hidden md:block">
                {isLogin 
                  ? (language === 'ar' ? 'مرحباً بك مرة أخرى! 👋' : 'Welcome back! 👋')
                  : (language === 'ar' ? 'ابدأ رحلتك المالية معنا 🚀' : 'Start your financial journey 🚀')
                }
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-4 md:mb-8 p-0.5 md:p-1 bg-white/5 dark:bg-charcoal/30 rounded-lg md:rounded-xl border border-white/10 dark:border-fire-red/20">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 md:py-2.5 px-2 md:px-4 rounded-md md:rounded-lg font-semibold text-[11px] md:text-sm transition-all duration-300 ${
                  isLogin
                    ? 'bg-gradient-to-r from-fire-red to-fire-red/90 text-white shadow-lg shadow-fire-red/30'
                    : 'text-gray-600 dark:text-light-gray/70 hover:text-fire-red'
                }`}
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 md:py-2.5 px-2 md:px-4 rounded-md md:rounded-lg font-semibold text-[11px] md:text-sm transition-all duration-300 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-fire-red to-fire-red/90 text-white shadow-lg shadow-fire-red/30'
                    : 'text-gray-600 dark:text-light-gray/70 hover:text-fire-red'
                }`}
              >
                {t.signup}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5 animate-fadeIn delay-200">
              {/* Username/Phone field */}
              <div className="space-y-1 md:space-y-2 animate-slideInUp delay-100">
                <label className="block text-[11px] md:text-sm font-semibold text-gray-700 dark:text-light-gray/90 flex items-center gap-1.5 md:gap-2">
                  {isLogin ? (
                    <>
                      <Phone className="text-fire-red md:w-4 md:h-4 flex-shrink-0" size={12} />
                      <span className="leading-tight">{t.loginWithUsernameOrPhone}</span>
                    </>
                  ) : (
                    <>
                      <User className="text-fire-red md:w-4 md:h-4 flex-shrink-0" size={12} />
                      <span className="leading-tight">{t.username}</span>
                    </>
                  )}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-fire-red/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative flex items-center">
                    {isLogin ? (
                      <Phone className={`absolute ${language === 'ar' ? 'right-2.5 md:right-4' : 'left-2.5 md:left-4'} text-gray-400 dark:text-light-gray/50 transition-colors group-focus-within:text-fire-red md:w-5 md:h-5`} size={16} />
                    ) : (
                      <User className={`absolute ${language === 'ar' ? 'right-2.5 md:right-4' : 'left-2.5 md:left-4'} text-gray-400 dark:text-light-gray/50 transition-colors group-focus-within:text-fire-red md:w-5 md:h-5`} size={16} />
                    )}
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        if (isLogin) {
                          setUsername(e.target.value);
                        } else {
                          setUsername(e.target.value.toLowerCase());
                        }
                      }}
                      className={`w-full px-2.5 md:px-4 py-2.5 md:py-3.5 ${language === 'ar' ? 'pr-9 md:pr-12' : 'pl-9 md:pl-12'} bg-white/50 dark:bg-charcoal/50 backdrop-blur-sm border border-gray-200/50 dark:border-fire-red/20 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-light-gray/50 focus:outline-none focus:ring-2 focus:ring-fire-red/50 focus:border-fire-red transition-all duration-300 text-xs md:text-base`}
                      placeholder={isLogin 
                        ? (language === 'ar' ? 'اسم المستخدم أو رقم الهاتف' : 'Username or phone')
                        : (language === 'ar' ? 'اسم المستخدم' : 'Username')
                      }
                      pattern={isLogin ? undefined : "[a-zA-Z0-9_]+"}
                      title={isLogin 
                        ? undefined 
                        : (language === 'ar' ? 'أحرف إنجليزية وأرقام وشرطة سفلية فقط' : 'English letters, numbers and underscores only')
                      }
                    />
                  </div>
                </div>
                {!isLogin && (
                  <p className="text-[9px] md:text-xs text-gray-500 dark:text-light-gray/50 flex items-start gap-1 hidden md:flex">
                    <Shield size={10} className="md:w-3 md:h-3 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{language === 'ar' ? '3 أحرف على الأقل - أحرف إنجليزية وأرقام وشرطة سفلية فقط' : 'At least 3 characters - English letters, numbers and underscores only'}</span>
                  </p>
                )}
              </div>

              {/* Email field - only shown on signup */}
              {!isLogin && (
                <div className="space-y-1 md:space-y-2 animate-slideInUp delay-150">
                  <label className="block text-[11px] md:text-sm font-semibold text-gray-700 dark:text-light-gray/90 flex items-center gap-1.5 md:gap-2">
                    <Mail className="text-fire-red md:w-4 md:h-4 flex-shrink-0" size={12} />
                    <span className="leading-tight">{t.email}</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-fire-red/20 to-transparent rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    <div className="relative flex items-center">
                      <Mail className={`absolute ${language === 'ar' ? 'right-2.5 md:right-4' : 'left-2.5 md:left-4'} text-gray-400 dark:text-light-gray/50 transition-colors group-focus-within:text-fire-red md:w-5 md:h-5`} size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-2.5 md:px-4 py-2.5 md:py-3.5 ${language === 'ar' ? 'pr-9 md:pr-12' : 'pl-9 md:pl-12'} bg-white/50 dark:bg-charcoal/50 backdrop-blur-sm border border-gray-200/50 dark:border-fire-red/20 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-light-gray/50 focus:outline-none focus:ring-2 focus:ring-fire-red/50 focus:border-fire-red transition-all duration-300 text-xs md:text-base`}
                        placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Name field - only shown on signup */}
              {!isLogin && (
                <div className="space-y-1 md:space-y-2 animate-slideInUp delay-200">
                  <label className="block text-[11px] md:text-sm font-semibold text-gray-700 dark:text-light-gray/90">
                    <span className="leading-tight">{t.displayName}</span> <span className="text-[9px] md:text-xs font-normal text-gray-400">({t.optional})</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-fire-red/20 to-transparent rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`w-full px-2.5 md:px-4 py-2.5 md:py-3.5 bg-white/50 dark:bg-charcoal/50 backdrop-blur-sm border border-gray-200/50 dark:border-fire-red/20 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-light-gray/50 focus:outline-none focus:ring-2 focus:ring-fire-red/50 focus:border-fire-red transition-all duration-300 text-xs md:text-base`}
                      placeholder={language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
                    />
                  </div>
                </div>
              )}

              {/* Phone Number field - only shown on signup */}
              {!isLogin && (
                <div className="space-y-1 md:space-y-2 animate-slideInUp delay-250">
                  <label className="block text-[11px] md:text-sm font-semibold text-gray-700 dark:text-light-gray/90 flex items-center gap-1.5 md:gap-2">
                    <Phone className="text-fire-red md:w-4 md:h-4 flex-shrink-0" size={12} />
                    <span className="leading-tight">{t.phoneNumber}</span> <span className="text-[9px] md:text-xs font-normal text-gray-400">({t.optional})</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-fire-red/20 to-transparent rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    <div className="relative flex items-center">
                      <Phone className={`absolute ${language === 'ar' ? 'right-2.5 md:right-4' : 'left-2.5 md:left-4'} text-gray-400 dark:text-light-gray/50 transition-colors group-focus-within:text-fire-red md:w-5 md:h-5`} size={16} />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full px-2.5 md:px-4 py-2.5 md:py-3.5 ${language === 'ar' ? 'pr-9 md:pr-12' : 'pl-9 md:pl-12'} bg-white/50 dark:bg-charcoal/50 backdrop-blur-sm border border-gray-200/50 dark:border-fire-red/20 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-light-gray/50 focus:outline-none focus:ring-2 focus:ring-fire-red/50 focus:border-fire-red transition-all duration-300 text-xs md:text-base`}
                        placeholder={language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-xs text-gray-500 dark:text-light-gray/50 flex items-start gap-1 hidden md:flex">
                    <Zap size={10} className="md:w-3 md:h-3 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{language === 'ar' ? 'يمكنك استخدام رقم الهاتف لتسجيل الدخول لاحقاً' : 'You can use phone number to login later'}</span>
                  </p>
                </div>
              )}

              {/* Password field */}
              <div className="space-y-1 md:space-y-2 animate-slideInUp delay-300">
                <label className="block text-[11px] md:text-sm font-semibold text-gray-700 dark:text-light-gray/90 flex items-center gap-1.5 md:gap-2">
                  <Lock className="text-fire-red md:w-4 md:h-4 flex-shrink-0" size={12} />
                  <span className="leading-tight">{t.password}</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-fire-red/20 to-transparent rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative flex items-center">
                    <Lock className={`absolute ${language === 'ar' ? 'right-2.5 md:right-4' : 'left-2.5 md:left-4'} text-gray-400 dark:text-light-gray/50 transition-colors group-focus-within:text-fire-red md:w-5 md:h-5`} size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-2.5 md:px-4 py-2.5 md:py-3.5 ${language === 'ar' ? 'pr-9 md:pr-12' : 'pl-9 md:pl-12'} bg-white/50 dark:bg-charcoal/50 backdrop-blur-sm border border-gray-200/50 dark:border-fire-red/20 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-light-gray/50 focus:outline-none focus:ring-2 focus:ring-fire-red/50 focus:border-fire-red transition-all duration-300 text-xs md:text-base`}
                      placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full px-3 md:px-6 py-2.5 md:py-4 bg-gradient-to-r from-fire-red to-fire-red/90 hover:from-fire-red/90 hover:to-fire-red text-white rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-xs md:text-base mt-2 md:mt-0 ${
                  loading ? 'cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t.loading}</span>
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        <span>{t.login}</span>
                      </>
                    ) : (
                      <>
                        <Wallet size={16} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                        <span>{t.signup}</span>
                      </>
                    )}
                    <ArrowRight size={14} className={`md:w-[18px] md:h-[18px] flex-shrink-0 ${language === 'ar' ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                  </>
                )}
              </button>
            </form>

            {/* Features hint - hidden on mobile */}
            <div className="mt-3 md:mt-8 pt-3 md:pt-6 border-t border-white/10 dark:border-fire-red/20 animate-fadeIn delay-400 hidden md:block">
              <div className="flex items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 dark:text-light-gray/50">
                <div className="flex items-center gap-1">
                  <Shield size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <span>{language === 'ar' ? 'آمن' : 'Secure'}</span>
                </div>
                <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-fire-red/50"></div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <span>{language === 'ar' ? 'سريع' : 'Fast'}</span>
                </div>
                <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-fire-red/50"></div>
                <div className="flex items-center gap-1">
                  <Wallet size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <span>{language === 'ar' ? 'سهل' : 'Easy'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-150 {
          animation-delay: 0.15s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-250 {
          animation-delay: 0.25s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
};

export default Login;
