import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { 
  X, 
  Bell, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Users,
  Calendar,
  AlertCircle,
  Save,
  Sparkles,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

// Available icons for notifications
const availableIcons = {
  Bell: Bell,
  Info: Info,
  CheckCircle: CheckCircle,
  AlertTriangle: AlertTriangle,
  XCircle: XCircle,
  AlertCircle: AlertCircle,
  Sparkles: Sparkles,
};

const AddNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState({ ar: '', en: '' });
  const [message, setMessage] = useState({ ar: '', en: '' });
  const [type, setType] = useState('info'); // info, success, warning, error
  const [selectedIcon, setSelectedIcon] = useState('Bell');
  const [userSelection, setUserSelection] = useState('all'); // 'all', 'specific', 'new', 'inactive', 'active', 'deactivated'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [urgent, setUrgent] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [targetUserCount, setTargetUserCount] = useState(0);

  // Get target user IDs based on selection
  const getTargetUserIds = () => {
    switch (userSelection) {
      case 'all':
        return users.map(u => u.id);
      
      case 'new': {
        // Users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return users
          .filter(user => {
            const createdDate = user.createdAt instanceof Date 
              ? user.createdAt 
              : new Date(user.createdAt);
            return createdDate >= thirtyDaysAgo;
          })
          .map(u => u.id);
      }
      
      case 'inactive': {
        // Users with deactivated accounts
        return users
          .filter(user => user.isActive === false)
          .map(u => u.id);
      }
      
      case 'active': {
        // Users with activated accounts
        return users
          .filter(user => user.isActive !== false)
          .map(u => u.id);
      }
      
      case 'deactivated': {
        // Users with deactivated accounts (same as inactive but more explicit)
        return users
          .filter(user => user.isActive === false)
          .map(u => u.id);
      }
      
      case 'specific':
        return selectedUsers;
      
      default:
        return [];
    }
  };

  // Fetch users
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Update target user count when selection changes
  useEffect(() => {
    if (users.length > 0) {
      const count = getTargetUserIds().length;
      setTargetUserCount(count);
    } else {
      setTargetUserCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSelection, selectedUsers, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date())
        };
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t.fetchingError);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.ar.trim() && !title.en.trim()) {
      toast.error(t.titleRequired);
      return;
    }
    if (!message.ar.trim() && !message.en.trim()) {
      toast.error(t.messageRequired);
      return;
    }
    if (userSelection === 'specific' && selectedUsers.length === 0) {
      toast.error(t.selectAtLeastOneUser);
      return;
    }

    // Get target user IDs
    const targetUserIds = getTargetUserIds();
    
    if (targetUserIds.length === 0) {
      toast.error(language === 'ar' ? 'لا يوجد مستخدمين ينطبق عليهم المعايير المحددة' : 'No users match the selected criteria');
      return;
    }

    try {
      setSaving(true);

      // Create notification for each user
      const notificationPromises = targetUserIds.map(userId => {
        const notificationData = {
          userId,
          title: {
            ar: title.ar.trim(),
            en: title.en.trim()
          },
          message: {
            ar: message.ar.trim(),
            en: message.en.trim()
          },
          type,
          icon: selectedIcon,
          urgent,
          read: false,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid,
          createdByEmail: currentUser.email,
          expiresAt: hasExpiry && expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
        };
        
        return addDoc(collection(db, 'notifications'), notificationData);
      });

      await Promise.all(notificationPromises);
      
      toast.success(t.notificationCreated);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error(t.notificationError);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle({ ar: '', en: '' });
    setMessage({ ar: '', en: '' });
    setType('info');
    setSelectedIcon('Bell');
    setUserSelection('all');
    setSelectedUsers([]);
    setUrgent(false);
    setExpiryDate('');
    setHasExpiry(false);
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = availableIcons[selectedIcon] || Bell;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl ${
        theme === 'dark' 
          ? 'bg-charcoal border border-white/10' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-fire-red/20' : 'bg-fire-red/10'
            }`}>
              <Bell className="text-fire-red" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.addNotification}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t.manageNotifications}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t.notificationTitle} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={title.ar}
                    onChange={(e) => setTitle({ ...title, ar: e.target.value })}
                    placeholder={language === 'ar' ? 'عنوان الإشعار بالعربية' : 'Title in Arabic'}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-fire-red'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-fire-red'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={title.en}
                    onChange={(e) => setTitle({ ...title, en: e.target.value })}
                    placeholder={language === 'ar' ? 'عنوان الإشعار بالإنجليزية' : 'Title in English'}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-fire-red'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-fire-red'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t.notificationMessage} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <textarea
                    value={message.ar}
                    onChange={(e) => setMessage({ ...message, ar: e.target.value })}
                    placeholder={language === 'ar' ? 'نص الإشعار بالعربية' : 'Message in Arabic'}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-fire-red'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-fire-red'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all resize-none`}
                  />
                </div>
                <div>
                  <textarea
                    value={message.en}
                    onChange={(e) => setMessage({ ...message, en: e.target.value })}
                    placeholder={language === 'ar' ? 'نص الإشعار بالإنجليزية' : 'Message in English'}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-fire-red'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-fire-red'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Type and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t.notificationType} <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white focus:border-fire-red'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-fire-red'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                >
                  <option value="info">{t.notificationTypeInfo}</option>
                  <option value="success">{t.notificationTypeSuccess}</option>
                  <option value="warning">{t.notificationTypeWarning}</option>
                  <option value="error">{t.notificationTypeError}</option>
                </select>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t.notificationIcon} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg border-2 ${
                    theme === 'dark'
                      ? 'bg-white/5 border-fire-red/30'
                      : 'bg-white border-fire-red/30'
                  }`}>
                    <IconComponent size={24} className="text-fire-red" />
                  </div>
                  <select
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white focus:border-fire-red'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-fire-red'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                  >
                    {Object.keys(availableIcons).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t.selectUsers} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <label className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  userSelection === 'all'
                    ? theme === 'dark'
                      ? 'bg-fire-red/20 border-2 border-fire-red text-fire-red'
                      : 'bg-fire-red/10 border-2 border-fire-red text-fire-red'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="all"
                    checked={userSelection === 'all'}
                    onChange={(e) => setUserSelection(e.target.value)}
                    className="sr-only"
                  />
                  <Users size={20} />
                  <span className="font-medium text-sm text-center">{t.allUsers}</span>
                </label>
                <label className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  userSelection === 'new'
                    ? theme === 'dark'
                      ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                      : 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="new"
                    checked={userSelection === 'new'}
                    onChange={(e) => setUserSelection(e.target.value)}
                    className="sr-only"
                  />
                  <Sparkles size={20} />
                  <span className="font-medium text-sm text-center">{t.newUsers}</span>
                  <span className="text-xs opacity-75 text-center">{userSelection === 'new' ? targetUserCount : getTargetUserIds().length}</span>
                </label>
                <label className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  userSelection === 'active'
                    ? theme === 'dark'
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-green-50 border-2 border-green-500 text-green-600'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="active"
                    checked={userSelection === 'active'}
                    onChange={(e) => setUserSelection(e.target.value)}
                    className="sr-only"
                  />
                  <CheckCircle size={20} />
                  <span className="font-medium text-sm text-center">{t.activeUsers}</span>
                  <span className="text-xs opacity-75 text-center">{userSelection === 'active' ? targetUserCount : getTargetUserIds().length}</span>
                </label>
                <label className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  userSelection === 'deactivated'
                    ? theme === 'dark'
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-red-50 border-2 border-red-500 text-red-600'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="deactivated"
                    checked={userSelection === 'deactivated'}
                    onChange={(e) => setUserSelection(e.target.value)}
                    className="sr-only"
                  />
                  <XCircle size={20} />
                  <span className="font-medium text-sm text-center">{t.deactivatedUsers}</span>
                  <span className="text-xs opacity-75 text-center">{userSelection === 'deactivated' ? targetUserCount : getTargetUserIds().length}</span>
                </label>
                <label className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  userSelection === 'inactive'
                    ? theme === 'dark'
                      ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                      : 'bg-orange-50 border-2 border-orange-500 text-orange-600'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="inactive"
                    checked={userSelection === 'inactive'}
                    onChange={(e) => setUserSelection(e.target.value)}
                    className="sr-only"
                  />
                  <XCircle size={20} />
                  <span className="font-medium text-sm text-center">{t.inactiveUsers}</span>
                  <span className="text-xs opacity-75 text-center">{userSelection === 'inactive' ? targetUserCount : getTargetUserIds().length}</span>
                </label>
                <label className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  userSelection === 'specific'
                    ? theme === 'dark'
                      ? 'bg-fire-red/20 border-2 border-fire-red text-fire-red'
                      : 'bg-fire-red/10 border-2 border-fire-red text-fire-red'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="specific"
                    checked={userSelection === 'specific'}
                    onChange={(e) => setUserSelection(e.target.value)}
                    className="sr-only"
                  />
                  <Users size={20} />
                  <span className="font-medium text-sm text-center">{t.specificUsers}</span>
                  <span className="text-xs opacity-75 text-center">{selectedUsers.length}</span>
                </label>
              </div>
              
              {/* Show descriptions and counts */}
              {(userSelection === 'new' || userSelection === 'inactive' || userSelection === 'active' || userSelection === 'deactivated') && (
                <div className={`p-3 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userSelection === 'new' ? t.newUsersDescription :
                     userSelection === 'inactive' ? t.inactiveUsersDescription :
                     userSelection === 'active' ? t.activeUsersDescription :
                     t.deactivatedUsersDescription}
                  </p>
                  <p className="text-sm font-semibold text-fire-red mt-1">
                    {language === 'ar' ? 'عدد المستخدمين المستهدفين: ' : 'Target users: '}
                    {targetUserCount}
                  </p>
                </div>
              )}

              {userSelection === 'specific' && (
                <div className={`p-4 rounded-lg max-h-64 overflow-y-auto ${
                  theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">{t.loading}</div>
                  ) : (
                    <div className="space-y-2">
                      {users.map(user => (
                        <label
                          key={user.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedUsers.includes(user.id)
                              ? theme === 'dark'
                                ? 'bg-fire-red/20 border border-fire-red/30'
                                : 'bg-fire-red/10 border border-fire-red/30'
                              : theme === 'dark'
                                ? 'hover:bg-white/10 border border-transparent'
                                : 'hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="w-4 h-4 text-fire-red focus:ring-fire-red border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.displayName || user.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Urgent and Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Urgent */}
              <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                urgent
                  ? theme === 'dark'
                    ? 'bg-orange-500/20 border-2 border-orange-500'
                    : 'bg-orange-50 border-2 border-orange-500'
                  : theme === 'dark'
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                    : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
              }`}>
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <AlertCircle className={`${urgent ? 'text-orange-500' : 'text-gray-400'}`} size={20} />
                <span className={`font-medium ${urgent ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {t.notificationUrgent}
                </span>
              </label>

              {/* Expiry Date */}
              <div>
                <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all mb-2 ${
                  hasExpiry
                    ? theme === 'dark'
                      ? 'bg-blue-500/20 border-2 border-blue-500'
                      : 'bg-blue-50 border-2 border-blue-500'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={hasExpiry}
                    onChange={(e) => setHasExpiry(e.target.checked)}
                    className="w-5 h-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Calendar className={`${hasExpiry ? 'text-blue-500' : 'text-gray-400'}`} size={20} />
                  <span className={`font-medium ${hasExpiry ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t.notificationExpiryDate}
                  </span>
                </label>
                {hasExpiry && (
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} flex gap-3`}>
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t.saving}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{t.save}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNotificationModal;

