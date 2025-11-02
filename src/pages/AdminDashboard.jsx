import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { Users, UserCheck, UserX, Mail, Calendar, Shield, Search, X, CheckCircle, XCircle, Receipt, ArrowDownCircle, ArrowUpCircle, Folder, Edit2, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [userTransactions, setUserTransactions] = useState({
    expenses: [],
    revenues: [],
    projects: []
  });
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    email: '',
    username: ''
  });

  // Note: AdminRoute component handles admin access check
  // This is just an extra layer of protection

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersCollection = collection(db, 'users');
        
        // Try with orderBy first, if it fails, try without orderBy
        let querySnapshot;
        try {
          const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'));
          querySnapshot = await getDocs(usersQuery);
        } catch (orderByError) {
          // If orderBy fails (e.g., missing index), fetch without ordering
          console.warn('OrderBy failed, fetching without order:', orderByError);
          querySnapshot = await getDocs(usersCollection);
        }
        
        const usersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date()),
          });
        });

        // Sort manually if we fetched without orderBy
        usersData.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return dateB - dateA; // Descending order
        });

        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.code === 'permission-denied') {
          toast.error(t.noPermission);
        } else if (error.message?.includes('index')) {
          toast.error(language === 'ar' ? 'يحتاج الاستعلام إلى إنشاء index في Firebase Console' : 'Query requires creating an index in Firebase Console');
        } else {
          toast.error(t.fetchingError + ': ' + (error.message || (language === 'ar' ? 'خطأ غير معروف' : 'Unknown error')));
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Filter users based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Toggle user account status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setUpdating(true);
      const userRef = doc(db, 'users', userId);
      // Default to true if undefined (treat undefined as active)
      const isCurrentlyActive = currentStatus !== false;
      const newStatus = !isCurrentlyActive;
      
      await updateDoc(userRef, {
        isActive: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isActive: newStatus }
            : user
        )
      );

      setFilteredUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isActive: newStatus }
            : user
        )
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, isActive: newStatus }));
      }

      toast.success(newStatus ? t.accountActivated : t.accountDeactivated);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(t.updatingError);
    } finally {
      setUpdating(false);
    }
  };

  // Month names based on language
  const monthNames = language === 'ar' 
    ? {
        long: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        short: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      }
    : {
        long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      };

  // Format date with month names based on language
  const formatDate = (date) => {
    if (!date) return t.unavailable;
    try {
      const dateObj = date?.toDate?.() || new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      if (language === 'ar') {
        return `${day} ${monthNames.long[month]} ${year}، ${hours}:${minutes}`;
      } else {
        return `${monthNames.short[month]} ${day}, ${year}, ${hours}:${minutes}`;
      }
    } catch {
      return t.unavailable;
    }
  };

  // Format date for short display
  const formatDateShort = (date) => {
    if (!date) return t.unavailable;
    try {
      const dateObj = date?.toDate?.() || new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      
      if (language === 'ar') {
        return `${day} ${monthNames.short[month]} ${year}`;
      } else {
        return `${monthNames.short[month]} ${day}, ${year}`;
      }
    } catch {
      return t.unavailable;
    }
  };

  // Fetch user transactions
  const fetchUserTransactions = async (userId) => {
    if (!userId) return;

    try {
      setLoadingTransactions(true);
      
      // Fetch expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const expensesData = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt)?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt)?.getTime() || 0;
        return bTime - aTime;
      });

      // Fetch revenues
      const revenuesQuery = query(
        collection(db, 'revenues'),
        where('userId', '==', userId)
      );
      const revenuesSnapshot = await getDocs(revenuesQuery);
      const revenuesData = revenuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt)?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt)?.getTime() || 0;
        return bTime - aTime;
      });

      // Fetch projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt)?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt)?.getTime() || 0;
        return bTime - aTime;
      });

      // Calculate project statistics (expenses and revenues for each project)
      const projectsWithStats = projectsData.map(project => {
        const projectExpenses = expensesData.filter(e => e.projectId === project.id);
        const projectRevenues = revenuesData.filter(r => r.projectId === project.id);
        
        const totalExpenses = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalRevenues = projectRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
        const netIncome = totalRevenues - totalExpenses;

        return {
          ...project,
          stats: {
            expensesCount: projectExpenses.length,
            revenuesCount: projectRevenues.length,
            totalExpenses,
            totalRevenues,
            netIncome
          }
        };
      });

      setUserTransactions({
        expenses: expensesData,
        revenues: revenuesData,
        projects: projectsWithStats
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في جلب المعاملات' : 'Error fetching transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Handle show transactions modal
  const handleShowTransactions = async () => {
    if (!selectedUser) return;
    setShowTransactionsModal(true);
    await fetchUserTransactions(selectedUser.id);
  };

  // Handle edit user
  const handleEditUser = () => {
    if (!selectedUser) return;
    setEditFormData({
      displayName: selectedUser.displayName || '',
      email: selectedUser.email || '',
      username: selectedUser.username || ''
    });
    setEditingUser(selectedUser);
    setShowEditModal(true);
  };

  // Handle save edited user
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setUpdating(true);
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        displayName: editFormData.displayName.trim(),
        updatedAt: new Date()
      });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUser.id
            ? { ...user, displayName: editFormData.displayName.trim() }
            : user
        )
      );

      setFilteredUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUser.id
            ? { ...user, displayName: editFormData.displayName.trim() }
            : user
        )
      );

      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser(prev => ({ ...prev, displayName: editFormData.displayName.trim() }));
      }

      toast.success(t.accountUpdated);
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t.updatingError);
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const userRef = doc(db, 'users', selectedUser.id);
      
      // Delete user document from Firestore
      await deleteDoc(userRef);

      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);

      toast.success(t.accountDeleted);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t.deletingError);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-fire-red text-2xl">{t.loading}</div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${t.adminTitle} - ${t.appName}`}
        description={language === 'ar' ? 'لوحة تحكم الإدارة لعرض وإدارة جميع مستخدمي النظام' : 'Admin dashboard to view and manage all system users'}
        keywords={language === 'ar' ? 'لوحة تحكم, إدارة, مستخدمين' : 'admin dashboard, management, users'}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Shield className="text-fire-red" size={32} />
              {t.adminTitle}
            </h1>
            <p className="text-gray-600 dark:text-light-gray/70">
              {t.adminDescription}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-fire-red/20 border border-fire-red/30' 
                : 'bg-fire-red/10 border border-fire-red/20'
            }`}>
              <span className="text-sm font-semibold text-fire-red">
                {t.totalUsers}: {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`p-4 rounded-xl ${
          theme === 'dark' 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-lg ${
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Grid */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={24} className="text-fire-red" />
                {t.userList} ({filteredUsers.length})
              </h2>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-light-gray/70">
                    {searchTerm ? t.noSearchResults : t.noUsers}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedUser?.id === user.id
                          ? 'bg-fire-red/20 border-2 border-fire-red'
                          : theme === 'dark'
                          ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            user.isActive === false
                              ? 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                              : theme === 'dark'
                              ? 'bg-fire-red/20 text-fire-red border border-fire-red/30'
                              : 'bg-fire-red/10 text-fire-red border border-fire-red/20'
                          }`}>
                            {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {user.displayName || user.username || (language === 'ar' ? 'بدون اسم' : 'No name')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                          user.isActive === false
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-green-500/20 text-green-500'
                        }`}>
                          {user.isActive === false ? (
                            <>
                              <XCircle size={14} />
                              {t.inactive}
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} />
                              {t.active}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Mail size={14} />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar size={12} />
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details Panel */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className={`p-6 rounded-xl sticky top-24 ${
                theme === 'dark' 
                  ? 'bg-white/5 border border-white/10' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCheck size={24} className="text-fire-red" />
                    {t.userDetails}
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className={`p-2 rounded-lg transition-all ${
                      theme === 'dark'
                        ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold ${
                      selectedUser.isActive === false
                        ? 'bg-gray-500/20 text-gray-500 border-4 border-gray-500/30'
                        : theme === 'dark'
                        ? 'bg-fire-red/20 text-fire-red border-4 border-fire-red/30'
                        : 'bg-fire-red/10 text-fire-red border-4 border-fire-red/20'
                    }`}>
                      {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        {t.username}
                      </label>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {selectedUser.username || t.unavailable}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        {t.displayName}
                      </label>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {selectedUser.displayName || (language === 'ar' ? 'بدون اسم' : 'No name')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        {t.email}
                      </label>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-900 dark:text-white font-medium break-all">
                          {selectedUser.email || t.unavailable}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        {t.userId}
                      </label>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                          {selectedUser.id}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        {t.createdAt}
                      </label>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(selectedUser.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        {t.accountStatus}
                      </label>
                      <div className={`p-3 rounded-lg flex items-center justify-between ${
                        selectedUser.isActive === false
                          ? 'bg-red-500/10 border border-red-500/20'
                          : 'bg-green-500/10 border border-green-500/20'
                      }`}>
                        <div className="flex items-center gap-2">
                          {selectedUser.isActive === false ? (
                            <>
                              <XCircle size={20} className="text-red-500" />
                              <span className="text-red-500 font-semibold">{t.inactive}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} className="text-green-500" />
                              <span className="text-green-500 font-semibold">{t.active}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                    <button
                      onClick={handleShowTransactions}
                      disabled={loadingTransactions}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-fire-red hover:bg-fire-red/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingTransactions ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{t.loading}</span>
                        </>
                      ) : (
                        <>
                          <Receipt size={20} />
                          <span>{t.transactions}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleEditUser}
                      disabled={updating}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 size={20} />
                      <span>{t.editAccount}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive)}
                      disabled={updating}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        selectedUser.isActive === false
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{t.loading}</span>
                        </>
                      ) : selectedUser.isActive === false ? (
                        <>
                          <UserCheck size={20} />
                          <span>{t.activate}</span>
                        </>
                      ) : (
                        <>
                          <UserX size={20} />
                          <span>{t.deactivate}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={updating}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={20} />
                      <span>{t.deleteAccount}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-6 rounded-xl text-center ${
                theme === 'dark' 
                  ? 'bg-white/5 border border-white/10' 
                  : 'bg-white border border-gray-200'
              }`}>
                <UserCheck className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-light-gray/70">
                  {t.selectUser}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Modal */}
      {showTransactionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl ${
            theme === 'dark' 
              ? 'bg-charcoal border border-white/10' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            } flex items-center justify-between`}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Receipt className="text-fire-red" size={28} />
                  {t.userTransactions}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedUser.displayName || selectedUser.username} - @{selectedUser.username}
                </p>
              </div>
              <button
                onClick={() => setShowTransactionsModal(false)}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire-red"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowDownCircle className="text-red-500" size={24} />
                        <span className="font-semibold text-gray-900 dark:text-white">{t.expensesCount}</span>
                      </div>
                      <p className="text-2xl font-bold text-red-500">
                        {userTransactions.expenses.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t.total}: {userTransactions.expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowUpCircle className="text-green-500" size={24} />
                        <span className="font-semibold text-gray-900 dark:text-white">{t.revenuesCount}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-500">
                        {userTransactions.revenues.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t.total}: {userTransactions.revenues.reduce((sum, r) => sum + (r.amount || 0), 0).toFixed(2)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Folder className="text-blue-500" size={24} />
                        <span className="font-semibold text-gray-900 dark:text-white">{t.projectsCount}</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-500">
                        {userTransactions.projects.length}
                      </p>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ArrowDownCircle className="text-red-500" size={20} />
                      {t.expensesCount} ({userTransactions.expenses.length})
                    </h3>
                    {userTransactions.expenses.length === 0 ? (
                      <div className={`p-8 text-center rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-600 dark:text-gray-400">{t.noExpenses}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userTransactions.expenses.map((expense) => (
                          <div
                            key={expense.id}
                            className={`p-4 rounded-lg ${
                              theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {expense.description || t.noDescription}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {formatDateShort(expense.date || expense.createdAt)}
                                </p>
                                {expense.category && (
                                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                                    theme === 'dark' ? 'bg-fire-red/20 text-fire-red' : 'bg-fire-red/10 text-fire-red'
                                  }`}>
                                    {expense.category}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-red-500">
                                  {expense.amount?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Revenues Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ArrowUpCircle className="text-green-500" size={20} />
                      {t.revenuesCount} ({userTransactions.revenues.length})
                    </h3>
                    {userTransactions.revenues.length === 0 ? (
                      <div className={`p-8 text-center rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-600 dark:text-gray-400">{t.noRevenues}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userTransactions.revenues.map((revenue) => (
                          <div
                            key={revenue.id}
                            className={`p-4 rounded-lg ${
                              theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {revenue.description || t.noDescription}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {formatDateShort(revenue.date || revenue.createdAt)}
                                </p>
                                {revenue.category && (
                                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                                    theme === 'dark' ? 'bg-green-500/20 text-green-500' : 'bg-green-500/10 text-green-500'
                                  }`}>
                                    {revenue.category}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-500">
                                  {revenue.amount?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Projects Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Folder className="text-blue-500" size={20} />
                      {t.projectsCount} ({userTransactions.projects.length})
                    </h3>
                    {userTransactions.projects.length === 0 ? (
                      <div className={`p-8 text-center rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <p className="text-gray-600 dark:text-gray-400">{t.noProjects}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userTransactions.projects.map((project) => (
                          <div
                            key={project.id}
                            className={`p-5 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            } transition-all`}
                          >
                            {/* Project Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Folder className="text-blue-500" size={24} />
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {project.name || t.noName}
                                  </h4>
                                </div>
                                {project.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Project Stats */}
                            {project.stats && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div className={`p-3 rounded-lg ${
                                  theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                                }`}>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t.projectExpenses}</p>
                                  <p className="text-lg font-bold text-red-500">
                                    {project.stats.expensesCount}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {project.stats.totalExpenses.toFixed(2)}
                                  </p>
                                </div>
                                
                                <div className={`p-3 rounded-lg ${
                                  theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                                }`}>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t.projectRevenues}</p>
                                  <p className="text-lg font-bold text-green-500">
                                    {project.stats.revenuesCount}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {project.stats.totalRevenues.toFixed(2)}
                                  </p>
                                </div>

                                <div className={`p-3 rounded-lg ${
                                  theme === 'dark' 
                                    ? project.stats.netIncome >= 0 
                                      ? 'bg-green-500/10 border border-green-500/20' 
                                      : 'bg-red-500/10 border border-red-500/20'
                                    : project.stats.netIncome >= 0 
                                      ? 'bg-green-50 border border-green-200' 
                                      : 'bg-red-50 border border-red-200'
                                }`}>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t.projectNetIncome}</p>
                                  <p className={`text-lg font-bold ${
                                    project.stats.netIncome >= 0 ? 'text-green-500' : 'text-red-500'
                                  }`}>
                                    {project.stats.netIncome >= 0 ? '+' : ''}{project.stats.netIncome.toFixed(2)}
                                  </p>
                                </div>

                                {project.budget && (
                                  <div className={`p-3 rounded-lg ${
                                    theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'
                                  }`}>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t.projectBudget}</p>
                                    <p className="text-lg font-bold text-purple-500">
                                      {project.budget}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Project Details */}
                            <div className={`pt-4 border-t ${
                              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                            }`}>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span>{t.creationDate} {formatDateShort(project.createdAt)}</span>
                                </div>
                                {project.budget && !project.stats && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-blue-500">
                                      {t.projectBudget}: {project.budget}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl ${
            theme === 'dark' 
              ? 'bg-charcoal border border-white/10' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            } flex items-center justify-between`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit2 className="text-blue-500" size={24} />
                {t.editUserData}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.usernameCannotEdit}
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400'
                      : 'bg-gray-50 border border-gray-300 text-gray-500'
                  } cursor-not-allowed`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.emailCannotEdit}
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400'
                      : 'bg-gray-50 border border-gray-300 text-gray-500'
                  } cursor-not-allowed`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.nameRequiredStar} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  placeholder={t.enterUserName}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-fire-red'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-fire-red'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={updating || !editFormData.displayName.trim()}
                  className="flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
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
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2.5 rounded-lg font-semibold transition-all border ${
                    theme === 'dark'
                      ? 'border-white/20 hover:bg-white/10 text-white'
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl ${
            theme === 'dark' 
              ? 'bg-charcoal border border-red-500/30' 
              : 'bg-white border border-red-200'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-red-500/20' : 'border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.confirmDelete}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t.deleteConfirmMessage} <span className="font-semibold text-fire-red">{selectedUser.displayName || selectedUser.username}</span>?
              </p>
              <div className={`mt-4 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
              }`}>
                <p className="text-sm text-red-600 dark:text-red-400">
                  ⚠️ {t.deleteWarning}
                </p>
              </div>
            </div>

            <div className="p-6 flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={updating}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t.deleting}</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>{t.delete}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={updating}
                className={`px-4 py-2.5 rounded-lg font-semibold transition-all border ${
                  theme === 'dark'
                    ? 'border-white/20 hover:bg-white/10 text-white'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                } disabled:opacity-50`}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;

