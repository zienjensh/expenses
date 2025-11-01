import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Moon, Sun, DollarSign, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, currencyCode, setCurrency } = useTheme();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');

  const handleUpdateProfile = async () => {
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
        toast.success('تم تحديث الملف الشخصي بنجاح');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('فشل في تحديث الملف الشخصي');
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
    <div className="space-y-6">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900 dark:text-white mb-2">الإعدادات</h1>
          <p className="text-gray-600 dark:text-gray-600 dark:text-light-gray/70">إدارة إعداداتك وتفضيلاتك</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-50 dark:bg-charcoal/50 rounded-xl p-6 border border-fire-red/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <User size={24} />
          بيانات المستخدم
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">الاسم</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">البريد الإلكتروني</label>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg">
              <Mail size={18} className="text-gray-600 dark:text-light-gray/50" />
              <span className="text-gray-600 dark:text-light-gray">{currentUser?.email}</span>
            </div>
          </div>
          <button
            onClick={handleUpdateProfile}
            className="px-6 py-2 bg-fire-red hover:bg-fire-red/90 text-gray-900 dark:text-white rounded-lg transition-all glow-red"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-50 dark:bg-charcoal/50 rounded-xl p-6 border border-fire-red/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">التفضيلات</h2>
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={24} className="text-gray-600 dark:text-light-gray" /> : <Sun size={24} className="text-gray-600 dark:text-light-gray" />}
              <div>
                <p className="text-gray-900 dark:text-white font-medium">الوضع {theme === 'dark' ? 'الداكن' : 'الفاتح'}</p>
                <p className="text-sm text-gray-600 dark:text-light-gray/70">تبديل بين الوضع الداكن والفاتح</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-fire-red' : 'bg-gray-400'
              }`}
            >
              <span
                className={`absolute top-1 right-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-0' : 'translate-x-8'
                }`}
              />
            </button>
          </div>

          {/* Currency Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign size={24} className="text-gray-600 dark:text-light-gray" />
              <div>
                <p className="text-gray-900 dark:text-white font-medium">العملة الافتراضية</p>
                <p className="text-sm text-gray-600 dark:text-light-gray/70">اختر العملة المستخدمة في العرض</p>
              </div>
            </div>
            <select
              value={currencyCode}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
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

      {/* Account Actions */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">إدارة الحساب</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-fire-red/20 hover:bg-fire-red/30 text-fire-red rounded-lg transition-all border border-fire-red/50"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;

