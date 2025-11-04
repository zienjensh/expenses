import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Sparkles,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

// Icon mapping
const iconMap = {
  Bell: Bell,
  Info: Info,
  CheckCircle: CheckCircle,
  AlertTriangle: AlertTriangle,
  XCircle: XCircle,
  AlertCircle: AlertCircle,
  Sparkles: Sparkles,
};

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const notificationsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          expiresAt: doc.data().expiresAt?.toDate?.() || null
        }))
        .filter(notif => {
          // Filter out expired notifications
          if (notif.expiresAt && notif.expiresAt < now) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Sort by: urgent first, then unread, then by date
          if (a.urgent && !b.urgent) return -1;
          if (!a.urgent && b.urgent) return 1;
          if (!a.read && b.read) return -1;
          if (a.read && !b.read) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });

      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isOpen]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(t.error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(notif =>
        updateDoc(doc(db, 'notifications', notif.id), { read: true })
      );
      await Promise.all(promises);
      toast.success(t.allNotificationsMarkedAsRead);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(t.error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast.success(t.notificationDeleted);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t.error);
    }
  };

  const formatDate = (date) => {
    if (!date) return t.unavailable;
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (language === 'ar') {
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        return dateObj.toLocaleDateString('ar-SA', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return t.unavailable;
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl ${
        theme === 'dark' 
          ? 'bg-charcoal border border-white/10' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg relative ${
              theme === 'dark' ? 'bg-fire-red/20' : 'bg-fire-red/10'
            }`}>
              <Bell className="text-fire-red" size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-fire-red text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.notifications}
              </h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} {t.unreadNotifications}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-fire-red/20 hover:bg-fire-red/30 text-fire-red border border-fire-red/30'
                    : 'bg-fire-red/10 hover:bg-fire-red/20 text-fire-red border border-fire-red/20'
                }`}
              >
                {t.markAllAsRead}
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire-red"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">
                {t.noNotifications}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const IconComponent = iconMap[notification.icon] || Bell;
                const title = notification.title?.[language] || notification.title?.ar || notification.title?.en || t.notification;
                const message = notification.message?.[language] || notification.message?.ar || notification.message?.en || '';
                
                const typeColors = {
                  info: theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700',
                  success: theme === 'dark' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700',
                  warning: theme === 'dark' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700',
                  error: theme === 'dark' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700',
                };

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border transition-all ${
                      !notification.read
                        ? theme === 'dark'
                          ? 'bg-white/10 border-fire-red/30 shadow-lg shadow-fire-red/10'
                          : 'bg-fire-red/5 border-fire-red/20 shadow-md'
                        : theme === 'dark'
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } ${notification.urgent ? 'ring-2 ring-orange-500/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        typeColors[notification.type] || typeColors.info
                      }`}>
                        <IconComponent size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className={`font-bold text-lg ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {title}
                            </h3>
                            {notification.urgent && (
                              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                                theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                              }`}>
                                ⚠️ {t.notificationUrgent}
                              </span>
                            )}
                          </div>
                          {!notification.read && (
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                              theme === 'dark' ? 'bg-fire-red' : 'bg-fire-red'
                            }`}></span>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {message}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDate(notification.createdAt)}
                            </div>
                            {notification.expiresAt && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {language === 'ar' ? 'ينتهي: ' : 'Expires: '}
                                {notification.expiresAt.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  theme === 'dark'
                                    ? 'bg-fire-red/20 hover:bg-fire-red/30 text-fire-red border border-fire-red/30'
                                    : 'bg-fire-red/10 hover:bg-fire-red/20 text-fire-red border border-fire-red/20'
                                }`}
                              >
                                {t.markAsRead}
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                theme === 'dark'
                                  ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                                  : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;

