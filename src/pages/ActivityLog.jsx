import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { 
  Activity, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  LogIn, 
  LogOut, 
  Folder,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityLog = () => {
  const { currentUser } = useAuth();
  const { theme, currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  // Get activity icon based on action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'add':
        return Plus;
      case 'edit':
        return Edit2;
      case 'delete':
        return Trash2;
      case 'view':
        return Eye;
      case 'login':
        return LogIn;
      case 'logout':
        return LogOut;
      default:
        return Activity;
    }
  };

  // Get action color
  const getActionColor = (action) => {
    switch (action) {
      case 'add':
        return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'edit':
        return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      case 'delete':
        return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'view':
        return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
      case 'login':
        return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'logout':
        return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      default:
        return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  // Get entity icon
  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'expense':
        return ArrowDownCircle;
      case 'revenue':
        return ArrowUpCircle;
      case 'project':
        return Folder;
      case 'account':
        return Settings;
      default:
        return Activity;
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const monthNames = language === 'ar' 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} - ${hours}:${minutes}`;
  };

  // Get relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (language === 'ar') {
      if (seconds < 60) return 'منذ لحظات';
      if (minutes < 60) return `منذ ${minutes} دقيقة`;
      if (hours < 24) return `منذ ${hours} ساعة`;
      if (days < 7) return `منذ ${days} يوم`;
      return formatDate(timestamp);
    } else {
      if (seconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return formatDate(timestamp);
    }
  };

  // Fetch activities
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Try with orderBy first, if it fails, try without orderBy
    // We'll sort in JavaScript instead
    let unsubscribe;
    
    try {
      const q = query(
        collection(db, 'activityLogs'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(500)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const activitiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })).sort((a, b) => {
            // Sort by timestamp (most recent first)
            const aTime = a.timestamp?.toMillis?.() || a.timestamp || (a.createdAt?.toMillis?.() || a.createdAt) || 0;
            const bTime = b.timestamp?.toMillis?.() || b.timestamp || (b.createdAt?.toMillis?.() || b.createdAt) || 0;
            return bTime - aTime;
          });
          setActivities(activitiesData);
          setLoading(false);
        },
        async (error) => {
          console.warn('OrderBy query failed, trying without orderBy:', error);
          
          // Fallback: query without orderBy
          try {
            const fallbackQuery = query(
              collection(db, 'activityLogs'),
              where('userId', '==', currentUser.uid)
            );

            const fallbackUnsubscribe = onSnapshot(
              fallbackQuery,
              (snapshot) => {
                const activitiesData = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                })).sort((a, b) => {
                  // Sort by timestamp (most recent first)
                  const aTime = a.timestamp?.toMillis?.() || a.timestamp || (a.createdAt?.toMillis?.() || a.createdAt) || 0;
                  const bTime = b.timestamp?.toMillis?.() || b.timestamp || (b.createdAt?.toMillis?.() || b.createdAt) || 0;
                  return bTime - aTime;
                }).slice(0, 500); // Limit to 500 after sorting
                setActivities(activitiesData);
                setLoading(false);
              },
              (fallbackError) => {
                console.error('Error fetching activities:', fallbackError);
                
                // Check if it's an index error
                if (fallbackError.code === 'failed-precondition' && fallbackError.message?.includes('index')) {
                  toast.error(
                    language === 'ar' 
                      ? 'يحتاج الاستعلام إلى إنشاء index في Firebase Console. يرجى النقر على الرابط في Console لإنشاء الـ index.'
                      : 'Query requires creating an index in Firebase Console. Please click the link in Console to create the index.',
                    { duration: 5000 }
                  );
                } else {
                  toast.error(language === 'ar' ? 'حدث خطأ في تحميل السجل' : 'Error loading activity log');
                }
                setLoading(false);
              }
            );
            unsubscribe = fallbackUnsubscribe;
          } catch (fallbackErr) {
            console.error('Error in fallback query:', fallbackErr);
            toast.error(language === 'ar' ? 'حدث خطأ في تحميل السجل' : 'Error loading activity log');
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error('Error setting up query:', err);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل السجل' : 'Error loading activity log');
      setLoading(false);
      unsubscribe = () => {}; // Empty function as fallback
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, language]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    const matchesEntity = filterEntity === 'all' || activity.entityType === filterEntity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Get unique actions and entity types
  const uniqueActions = [...new Set(activities.map(a => a.action))];
  const uniqueEntities = [...new Set(activities.map(a => a.entityType))];

  return (
    <>
      <SEO 
        title={`${t.activityLog} - ${t.appName}`}
        description={language === 'ar' ? 'سجل جميع الأنشطة على النظام' : 'View all system activities'}
        keywords={language === 'ar' ? 'سجل, أنشطة, تاريخ' : 'log, activities, history'}
      />
      
      <div className="min-h-screen animate-fadeIn">
        {/* Header */}
        <div className={`relative mb-8 p-8 rounded-2xl overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-2 border-fire-red/30 shadow-2xl shadow-fire-red/10'
            : 'bg-gradient-to-br from-white via-white to-gray-50 border-2 border-fire-red/20 shadow-2xl shadow-fire-red/5'
        }`}>
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-fire-red/20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-fire-red/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-fire-red/20 border border-fire-red/30'
                    : 'bg-fire-red/10 border border-fire-red/20'
                } animate-scaleIn`}>
                  <Activity className="text-fire-red" size={32} />
                </div>
                <div>
                  <h1 className={`text-4xl font-extrabold mb-2 ${
                    theme === 'dark'
                      ? 'text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                      : 'text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                  }`}>
                    {t.activityLog}
                  </h1>
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
                  }`}>
                    {language === 'ar' ? 'سجل جميع الأنشطة والعمليات على النظام' : 'View all activities and operations on the system'}
                  </p>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${
                theme === 'dark'
                  ? 'bg-fire-red/20 text-fire-red border border-fire-red/30'
                  : 'bg-fire-red/10 text-fire-red border border-fire-red/20'
              }`}>
                {filteredActivities.length} {language === 'ar' ? 'نشاط' : 'activities'}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`mb-6 p-6 rounded-2xl ${
          theme === 'dark'
            ? 'bg-white/5 border border-white/10'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className={`w-full ${language === 'ar' ? 'pr-10' : 'pl-10'} py-3 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-fire-red/50'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-fire-red focus:ring-2 focus:ring-fire-red/20'
                } transition-all`}
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pr-10' : 'pl-10'} py-3 rounded-xl appearance-none ${
                  theme === 'dark'
                    ? 'bg-white/5 border border-white/10 text-white focus:border-fire-red/50'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-fire-red focus:ring-2 focus:ring-fire-red/20'
                } transition-all`}
              >
                <option value="all">{language === 'ar' ? 'جميع الإجراءات' : 'All Actions'}</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {t[`action_${action}`] || action}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Filter */}
            <div className="relative">
              <Folder className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pr-10' : 'pl-10'} py-3 rounded-xl appearance-none ${
                  theme === 'dark'
                    ? 'bg-white/5 border border-white/10 text-white focus:border-fire-red/50'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-fire-red focus:ring-2 focus:ring-fire-red/20'
                } transition-all`}
              >
                <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>
                    {t[`entity_${entity}`] || entity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-4 text-fire-red animate-spin" size={48} />
              <p className={`text-lg ${theme === 'dark' ? 'text-light-gray' : 'text-gray-700'}`}>
                {t.loading}
              </p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl ${
            theme === 'dark'
              ? 'bg-white/5 border border-white/10'
              : 'bg-white border border-gray-200'
          }`}>
            <Activity className="mx-auto mb-4 text-gray-400" size={64} />
            <p className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
            }`}>
              {language === 'ar' ? 'لا توجد أنشطة' : 'No activities found'}
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {language === 'ar' ? 'سيتم عرض الأنشطة هنا عند قيامك بأي عمليات على النظام' : 'Activities will appear here when you perform operations on the system'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const ActionIcon = getActionIcon(activity.action);
              const EntityIcon = getEntityIcon(activity.entityType);
              const actionColor = getActionColor(activity.action);

              return (
                <div
                  key={activity.id}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl animate-fadeInUp ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:border-fire-red/30 hover:bg-white/10'
                      : 'bg-white border-gray-200 hover:border-fire-red/20 hover:shadow-fire-red/10'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Decorative gradient */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                    activity.action === 'add' ? 'from-green-500/5 to-transparent' :
                    activity.action === 'edit' ? 'from-blue-500/5 to-transparent' :
                    activity.action === 'delete' ? 'from-red-500/5 to-transparent' :
                    'from-fire-red/5 to-transparent'
                  }`}></div>

                  <div className="relative flex items-start gap-4">
                    {/* Action Icon */}
                    <div className={`p-4 rounded-xl border-2 ${actionColor} flex-shrink-0 animate-scaleIn`}>
                      <ActionIcon size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`text-lg font-bold mb-1 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {t[`action_${activity.action}`] || activity.action} - {t[`entity_${activity.entityType}`] || activity.entityType}
                          </h3>
                          {activity.details?.description && (
                            <p className={`text-sm mb-2 ${
                              theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
                            }`}>
                              {activity.details.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Entity Icon */}
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
                        }`}>
                          <EntityIcon size={20} className={
                            activity.entityType === 'expense' ? 'text-red-500' :
                            activity.entityType === 'revenue' ? 'text-green-500' :
                            activity.entityType === 'project' ? 'text-blue-500' :
                            'text-gray-500'
                          } />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Clock size={16} />
                          <span>{getRelativeTime(activity.timestamp)}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Calendar size={16} />
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>
                        {activity.details?.amount && (
                          <div className={`px-3 py-1 rounded-lg font-bold ${
                            activity.entityType === 'expense' 
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-green-500/20 text-green-500'
                          }`}>
                            {activity.details.amount} {currency || 'ر.س'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityLog;

