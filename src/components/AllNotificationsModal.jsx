import { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { 
  Bell, 
  X, 
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Sparkles,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  CheckCircle
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

const AllNotificationsModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'read', 'unread', 'urgent'
  const [filterNotificationType, setFilterNotificationType] = useState('all'); // 'all', 'info', 'success', 'warning', 'error'
  const [deleting, setDeleting] = useState(null);

  // Fetch all notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsCollection = collection(db, 'notifications');
      
      let querySnapshot;
      try {
        const notificationsQuery = query(notificationsCollection, orderBy('createdAt', 'desc'));
        querySnapshot = await getDocs(notificationsQuery);
      } catch (error) {
        // If orderBy fails, fetch without ordering
        console.warn('OrderBy failed, fetching without order:', error);
        querySnapshot = await getDocs(notificationsCollection);
      }

      const notificationsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date()),
          expiresAt: data.expiresAt?.toDate?.() || (data.expiresAt ? new Date(data.expiresAt) : null)
        });
      });

      // Sort manually if we fetched without orderBy
      notificationsData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA; // Descending order
      });

      // Filter out expired notifications
      const now = new Date();
      const activeNotifications = notificationsData.filter(notif => {
        if (notif.expiresAt && notif.expiresAt < now) {
          return false;
        }
        return true;
      });

      setNotifications(activeNotifications);
      setFilteredNotifications(activeNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(t.fetchingError);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by read status
    if (filterType === 'read') {
      filtered = filtered.filter(n => n.read === true);
    } else if (filterType === 'unread') {
      filtered = filtered.filter(n => n.read !== true);
    } else if (filterType === 'urgent') {
      filtered = filtered.filter(n => n.urgent === true);
    }

    // Filter by notification type
    if (filterNotificationType !== 'all') {
      filtered = filtered.filter(n => n.type === filterNotificationType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notif => {
        const titleAr = notif.title?.ar?.toLowerCase() || '';
        const titleEn = notif.title?.en?.toLowerCase() || '';
        const messageAr = notif.message?.ar?.toLowerCase() || '';
        const messageEn = notif.message?.en?.toLowerCase() || '';
        const createdByEmail = notif.createdByEmail?.toLowerCase() || '';
        
        return (
          titleAr.includes(searchLower) ||
          titleEn.includes(searchLower) ||
          messageAr.includes(searchLower) ||
          messageEn.includes(searchLower) ||
          createdByEmail.includes(searchLower)
        );
      });
    }

    setFilteredNotifications(filtered);
  }, [searchTerm, filterType, filterNotificationType, notifications]);

  const deleteNotification = async (notificationId) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الإشعار؟' : 'Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setDeleting(notificationId);
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast.success(t.notificationDeleted);
      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t.error);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return t.unavailable;
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      if (language === 'ar') {
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${day} ${monthNames[month]} ${year}، ${hours}:${minutes}`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[month]} ${day}, ${year}, ${hours}:${minutes}`;
      }
    } catch {
      return t.unavailable;
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.urgent).length;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl ${
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
                {t.manageNotifications}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {language === 'ar' ? `إجمالي الإشعارات: ${notifications.length}` : `Total: ${notifications.length}`} 
                {unreadCount > 0 && ` | ${t.unreadNotifications}: ${unreadCount}`}
                {urgentCount > 0 && ` | ${t.notificationUrgent}: ${urgentCount}`}
              </p>
            </div>
          </div>
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

        {/* Filters and Search */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} space-y-3`}>
          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث في الإشعارات...' : 'Search notifications...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-fire-red'
                  : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-fire-red'
              } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-fire-red`}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'فلترة:' : 'Filter:'}
              </span>
            </div>
            
            {/* Read Status Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-fire-red'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-fire-red'
              } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="unread">{t.notificationUnread}</option>
              <option value="read">{t.notificationRead}</option>
              <option value="urgent">{t.notificationUrgent}</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterNotificationType}
              onChange={(e) => setFilterNotificationType(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-fire-red'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-fire-red'
              } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
            >
              <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="info">{t.notificationTypeInfo}</option>
              <option value="success">{t.notificationTypeSuccess}</option>
              <option value="warning">{t.notificationTypeWarning}</option>
              <option value="error">{t.notificationTypeError}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire-red"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || filterNotificationType !== 'all' 
                  ? (language === 'ar' ? 'لا توجد إشعارات تطابق البحث' : 'No notifications match the search')
                  : t.noNotifications}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
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
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                theme === 'dark' ? 'bg-fire-red' : 'bg-fire-red'
                              }`}></span>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              disabled={deleting === notification.id}
                              className={`p-1.5 rounded-lg transition-all ${
                                theme === 'dark'
                                  ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                                  : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                              } disabled:opacity-50`}
                            >
                              {deleting === notification.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
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
                            {notification.createdByEmail && (
                              <div className="flex items-center gap-1">
                                <User size={14} />
                                {notification.createdByEmail}
                              </div>
                            )}
                            {notification.expiresAt && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {language === 'ar' ? 'ينتهي: ' : 'Expires: '}
                                {formatDate(notification.expiresAt)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              typeColors[notification.type] || typeColors.info
                            }`}>
                              {notification.type === 'info' ? t.notificationTypeInfo :
                               notification.type === 'success' ? t.notificationTypeSuccess :
                               notification.type === 'warning' ? t.notificationTypeWarning :
                               t.notificationTypeError}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              notification.read
                                ? theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                                : theme === 'dark' ? 'bg-fire-red/20 text-fire-red' : 'bg-fire-red/10 text-fire-red'
                            }`}>
                              {notification.read ? t.notificationRead : t.notificationUnread}
                            </span>
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

export default AllNotificationsModal;

