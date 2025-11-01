import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Moon, Sun, DollarSign, LogOut, Save, Settings as SettingsIcon, CreditCard, Palette, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, currencyCode, setCurrency } = useTheme();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error('يرجى إدخال اسم صحيح');
      return;
    }
    setIsSaving(true);
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: displayName.trim() });
        toast.success('تم تحديث الملف الشخصي بنجاح');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    toast.success('تم تحديث العملة بنجاح');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('فشل في تسجيل الخروج');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-4 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-fire-red/20 to-fire-red/10 border border-fire-red/30'
              : 'bg-gradient-to-br from-fire-red/10 to-fire-red/5 border border-fire-red/20'
          }`}>
            <SettingsIcon size={32} className="text-fire-red" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">الإعدادات</h1>
            <p className="text-gray-600 dark:text-light-gray/70">إدارة إعداداتك وتفضيلاتك الشخصية</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings Card */}
          <div className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-fire-red/20 hover:border-fire-red/40 shadow-lg shadow-fire-red/10'
              : 'bg-gradient-to-br from-white via-white/95 to-white border-gray-200/50 hover:border-fire-red/30 shadow-lg'
          }`}>
            {/* Top glow effect */}
            <div className={`absolute top-0 left-0 right-0 h-px ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-transparent via-fire-red/60 to-transparent'
                : 'bg-gradient-to-r from-transparent via-fire-red/40 to-transparent'
            }`} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                theme === 'dark'
                  ? 'bg-fire-red/20 text-fire-red'
                  : 'bg-fire-red/10 text-fire-red'
              }`}>
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الملف الشخصي</h2>
                <p className="text-sm text-gray-600 dark:text-light-gray/70">إدارة معلوماتك الشخصية</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Display Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-light-gray/90 mb-2.5">
                  الاسم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/5 border-fire-red/20 text-white placeholder:text-gray-500 focus:border-fire-red focus:bg-white/10'
                        : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-fire-red focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                    placeholder="أدخل اسمك"
                  />
                  <User size={18} className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
              </div>

              {/* Email Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-light-gray/90 mb-2.5">
                  البريد الإلكتروني
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-fire-red/20'
                    : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <Mail size={18} className={`${
                    theme === 'dark' ? 'text-fire-red' : 'text-fire-red'
                  }`} />
                  <span className={`flex-1 ${
                    theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                  }`}>
                    {currentUser?.email}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    theme === 'dark'
                      ? 'bg-fire-red/20 text-fire-red'
                      : 'bg-fire-red/10 text-fire-red'
                  }`}>
                    محمي
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdateProfile}
                disabled={isSaving || displayName.trim() === currentUser?.displayName}
                className={`group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl transition-all duration-300 ${
                  isSaving || displayName.trim() === currentUser?.displayName
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-fire-red to-fire-red/90 text-white shadow-lg shadow-fire-red/30'
                    : 'bg-gradient-to-r from-fire-red to-fire-red/90 text-white shadow-lg shadow-fire-red/20'
                }`}
              >
                <Save size={18} className={`transition-transform duration-300 ${
                  isSaving ? 'animate-spin' : 'group-hover:rotate-12'
                }`} />
                <span className="font-semibold">
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </span>
              </button>
            </div>
          </div>

          {/* Preferences Card */}
          <div className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-fire-red/20 hover:border-fire-red/40 shadow-lg shadow-fire-red/10'
              : 'bg-gradient-to-br from-white via-white/95 to-white border-gray-200/50 hover:border-fire-red/30 shadow-lg'
          }`}>
            {/* Top glow effect */}
            <div className={`absolute top-0 left-0 right-0 h-px ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-transparent via-fire-red/60 to-transparent'
                : 'bg-gradient-to-r from-transparent via-fire-red/40 to-transparent'
            }`} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                theme === 'dark'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-purple-500/10 text-purple-600'
              }`}>
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">التفضيلات</h2>
                <p className="text-sm text-gray-600 dark:text-light-gray/70">تخصيص تجربتك</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className={`p-5 rounded-xl border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-white/5 border-fire-red/10 hover:border-fire-red/30'
                  : 'bg-gray-50/50 border-gray-200 hover:border-fire-red/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-fire-red/20 text-fire-red'
                        : 'bg-fire-red/10 text-fire-red'
                    }`}>
                      {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold mb-1">
                        الوضع {theme === 'dark' ? 'الداكن' : 'الفاتح'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-light-gray/70">
                        {theme === 'dark' ? 'مريح للعين في الإضاءة المنخفضة' : 'واضح ومناسب للاستخدام النهاري'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-fire-red to-fire-red/90 shadow-lg shadow-fire-red/30'
                        : 'bg-gradient-to-r from-gray-400 to-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                        theme === 'dark' ? 'right-1' : 'left-1'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <Moon size={14} className="text-fire-red" />
                      ) : (
                        <Sun size={14} className="text-yellow-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Currency Selection */}
              <div className={`p-5 rounded-xl border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-white/5 border-fire-red/10 hover:border-fire-red/30'
                  : 'bg-gray-50/50 border-gray-200 hover:border-fire-red/20'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-green-500/10 text-green-600'
                    }`}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold mb-1">
                        العملة الافتراضية
                      </p>
                      <p className="text-sm text-gray-600 dark:text-light-gray/70">
                        اختر العملة المستخدمة في العرض
                      </p>
                    </div>
                  </div>
                  <select
                    value={currencyCode}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fire-red/20 ${
                      theme === 'dark'
                        ? 'bg-white/5 border-fire-red/20 text-white hover:border-fire-red/40'
                        : 'bg-white border-gray-200 text-gray-900 hover:border-fire-red/40'
                    }`}
                  >
                    <option value="ر.س">ريال سعودي (ر.س)</option>
                    <option value="$">دولار ($)</option>
                    <option value="€">يورو (€)</option>
                    <option value="GBP">جنيه مصري (ج.م)</option>
                    <option value="د.إ">درهم إماراتي (د.إ)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Account Actions */}
        <div className="space-y-6">
          {/* Account Security Card */}
          <div className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-fire-red/20 hover:border-fire-red/40 shadow-lg shadow-fire-red/10'
              : 'bg-gradient-to-br from-white via-white/95 to-white border-gray-200/50 hover:border-fire-red/30 shadow-lg'
          }`}>
            {/* Top glow effect */}
            <div className={`absolute top-0 left-0 right-0 h-px ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-transparent via-fire-red/60 to-transparent'
                : 'bg-gradient-to-r from-transparent via-fire-red/40 to-transparent'
            }`} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-500/10 text-blue-600'
              }`}>
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">الأمان</h2>
                <p className="text-xs text-gray-600 dark:text-light-gray/70">إدارة الحساب</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border ${
                theme === 'dark'
                  ? 'bg-fire-red/10 hover:bg-fire-red/20 text-fire-red border-fire-red/30 hover:border-fire-red/50'
                  : 'bg-fire-red/5 hover:bg-fire-red/10 text-fire-red border-fire-red/20 hover:border-fire-red/40'
              }`}
            >
              <LogOut size={18} className="transition-transform duration-300 group-hover:rotate-[-15deg]" />
              <span className="font-semibold">تسجيل الخروج</span>
            </button>
          </div>

          {/* User Info Card */}
          <div className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-fire-red/20 shadow-lg shadow-fire-red/10'
              : 'bg-gradient-to-br from-white via-white/95 to-white border-gray-200/50 shadow-lg'
          }`}>
            {/* Top glow effect */}
            <div className={`absolute top-0 left-0 right-0 h-px ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-transparent via-fire-red/60 to-transparent'
                : 'bg-gradient-to-r from-transparent via-fire-red/40 to-transparent'
            }`} />
            
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-fire-red/30 to-fire-red/10 text-fire-red border-2 border-fire-red/30'
                  : 'bg-gradient-to-br from-fire-red/20 to-fire-red/10 text-fire-red border-2 border-fire-red/20'
              }`}>
                {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {currentUser?.displayName || 'المستخدم'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-light-gray/70 mb-4">
                {currentUser?.email}
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                theme === 'dark'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-green-500/10 text-green-600 border border-green-500/20'
              }`}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                متصل
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

