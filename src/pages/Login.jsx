import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
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
          toast.error('يرجى إدخال اسم المستخدم');
          setLoading(false);
          return;
        }
        await login(username, password);
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/');
      } else {
        if (!username.trim()) {
          toast.error('يرجى إدخال اسم المستخدم');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          toast.error('يرجى إدخال البريد الإلكتروني');
          setLoading(false);
          return;
        }
        await signup(username, email, password, displayName);
        toast.success('تم إنشاء الحساب بنجاح');
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'حدث خطأ في المصادقة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="تسجيل الدخول - لوحة إدارة المصروفات"
        description="سجل دخولك إلى نظام إدارة المصروفات والإيرادات الشخصي"
        keywords="تسجيل الدخول, حساب, مصروفات"
      />
      <div className="min-h-screen flex items-center justify-center bg-light-gray dark:bg-charcoal p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white/80 dark:bg-charcoal/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200 dark:border-fire-red/20 glow-red">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-fire-red mb-2">إدارة المصروفات</h1>
          <p className="text-gray-600 dark:text-light-gray/70">
            {isLogin ? 'سجل الدخول إلى حسابك' : 'أنشئ حسابًا جديدًا'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field - always shown */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                placeholder="أدخل اسم المستخدم"
                pattern="[a-zA-Z0-9_]+"
                title="أحرف إنجليزية وأرقام وشرطة سفلية فقط"
              />
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 dark:text-light-gray/50 mt-1">
                3 أحرف على الأقل - أحرف إنجليزية وأرقام وشرطة سفلية فقط
              </p>
            )}
          </div>

          {/* Email field - only shown on signup */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>
          )}

          {/* Display Name field - only shown on signup */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">الاسم</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                  placeholder="أدخل اسمك (اختياري)"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
                placeholder="أدخل كلمة المرور"
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
            <span>{loading ? 'جاري المعالجة...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 dark:text-light-gray/70 hover:text-fire-red transition-colors"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;

