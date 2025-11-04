import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { FolderPlus, Folder, X, Edit2, Trash2, ArrowLeft, Plus, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { format } from 'date-fns';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const Projects = () => {
  const { projects, addProject, updateProject, deleteProject, loading: projectsLoading } = useProjects();
  const { expenses, revenues, deleteExpense, deleteRevenue } = useTransactions();
  const { currency, theme } = useTheme();
  const { language } = useLanguage();
  const { userData: contextUserData, currentUser } = useAuth();
  const [userData, setUserData] = useState(contextUserData);
  const t = getTranslation(language);

  // Month names based on language
  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDateArabic = (date) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };
  
  // Debug: Log projects state
  // Debug logs removed for production
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Listen to user data updates in real-time to get latest projectLimit
  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserData(docSnapshot.data());
          }
        },
        (error) => {
          console.error('Error listening to user data:', error);
        }
      );

      return () => unsubscribe();
    } else {
      setUserData(null);
    }
  }, [currentUser]);

  // Filter expenses and revenues for selected project
  const projectExpenses = selectedProject 
    ? expenses.filter(e => e.projectId === selectedProject.id)
    : [];
  const projectRevenues = selectedProject 
    ? revenues.filter(r => r.projectId === selectedProject.id)
    : [];

  const projectStats = {
    totalExpenses: projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    totalRevenues: projectRevenues.reduce((sum, r) => sum + (r.amount || 0), 0),
    netIncome: projectRevenues.reduce((sum, r) => sum + (r.amount || 0), 0) - 
               projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    expensesCount: projectExpenses.length,
    revenuesCount: projectRevenues.length
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      return;
    }
    
    // Check project limit - check if adding one more project would exceed the limit
    console.log('Checking project limit:', {
      projectLimit: userData?.projectLimit,
      currentProjectsCount: projects.length,
      userData: userData
    });
    
    if (userData?.projectLimit !== null && userData?.projectLimit !== undefined && userData.projectLimit > 0) {
      const currentProjectsCount = projects.length;
      // Check if current count is already at or above the limit
      if (currentProjectsCount >= userData.projectLimit) {
        console.log('Project limit reached!', {
          current: currentProjectsCount,
          limit: userData.projectLimit
        });
        setShowLimitModal(true);
        setShowCreateModal(false);
        return;
      }
    }
    
    try {
      console.log('Creating project with name:', projectName.trim());
      const projectId = await addProject({ name: projectName.trim() });
      console.log('Project created successfully with ID:', projectId);
      setProjectName('');
      setShowCreateModal(false);
      // Force a small delay to allow onSnapshot to update
      setTimeout(() => {
        console.log('Projects after creation:', projects);
      }, 500);
    } catch (error) {
      console.error('Error creating project:', error);
      // Error message is already shown in the context via toast
      // Keep modal open if it's a validation error
      if (error.message.includes('موجود مسبقاً') || error.message.includes('مطلوب')) {
        // Keep modal open and let user fix the name
        return;
      }
      // Close modal for other errors
      setShowCreateModal(false);
    }
  };

  const handleEditProject = async () => {
    if (!projectName.trim() || !editingProject) {
      return;
    }
    try {
      await updateProject(editingProject.id, { name: projectName.trim() });
      setProjectName('');
      setEditingProject(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating project:', error);
      // Error message is already shown in the context via toast
      // Keep modal open if it's a validation error
      if (error.message.includes('موجود مسبقاً') || error.message.includes('مطلوب')) {
        // Keep modal open and let user fix the name
        return;
      }
      // Close modal for other errors
      setShowEditModal(false);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;
    try {
      // Delete all expenses and revenues associated with this project
      const projectExpensesToDelete = expenses.filter(e => e.projectId === editingProject.id);
      const projectRevenuesToDelete = revenues.filter(r => r.projectId === editingProject.id);
      
      for (const expense of projectExpensesToDelete) {
        await deleteExpense(expense.id);
      }
      for (const revenue of projectRevenuesToDelete) {
        await deleteRevenue(revenue.id);
      }
      
      await deleteProject(editingProject.id);
      setShowDeleteDialog(false);
      setEditingProject(null);
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      if (isDeletingExpense) {
        await deleteExpense(transactionToDelete.id);
      } else {
        await deleteRevenue(transactionToDelete.id);
      }
      setTransactionToDelete(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-fire-red text-2xl">{t.loading}</div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProject(null)}
              className={`p-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red border border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-fire-red border border-gray-200'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedProject.name}</h1>
              <p className="text-gray-600 dark:text-light-gray/70">{language === 'ar' ? 'تفاصيل المشروع' : 'Project Details'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingProject(selectedProject);
                setProjectName(selectedProject.name);
                setShowEditModal(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red border border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-fire-red border border-gray-200'
              }`}
            >
              <Edit2 size={18} />
              <span>{t.edit}</span>
            </button>
            <button
              onClick={() => {
                setEditingProject(selectedProject);
                setShowDeleteDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-fire-red/10 hover:bg-fire-red/20 text-fire-red rounded-lg transition-all border border-fire-red/30"
            >
              <Trash2 size={18} />
              <span>{t.delete}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-charcoal border-fire-red/20'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownCircle className="text-fire-red" size={24} />
              <h3 className="text-gray-600 dark:text-light-gray/70">{t.totalExpenses}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {projectStats.totalExpenses.toFixed(2)} {currency}
            </p>
            <p className="text-sm text-gray-500 mt-1">{projectStats.expensesCount} {t.transactionsCount}</p>
          </div>
          <div className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-charcoal border-green-500/20'
              : 'bg-white border-green-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpCircle className="text-green-500" size={24} />
              <h3 className="text-gray-600 dark:text-light-gray/70">{t.totalRevenues}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {projectStats.totalRevenues.toFixed(2)} {currency}
            </p>
            <p className="text-sm text-gray-500 mt-1">{projectStats.revenuesCount} {t.transactionsCount}</p>
          </div>
          <div className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-charcoal border-fire-red/20'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                projectStats.netIncome >= 0 ? 'bg-green-500/20' : 'bg-fire-red/20'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  projectStats.netIncome >= 0 ? 'bg-green-500' : 'bg-fire-red'
                }`} />
              </div>
              <h3 className="text-gray-600 dark:text-light-gray/70">{t.netIncome}</h3>
            </div>
            <p className={`text-2xl font-bold ${
              projectStats.netIncome >= 0 ? 'text-green-500' : 'text-fire-red'
            }`}>
              {projectStats.netIncome >= 0 ? '+' : ''}{projectStats.netIncome.toFixed(2)} {currency}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
          >
            <Plus size={20} />
            <span>{t.addExpense}</span>
          </button>
          <button
            onClick={() => setShowRevenueModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            <Plus size={20} />
            <span>{t.addRevenue}</span>
          </button>
        </div>

        {/* Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses */}
          <div className={`rounded-xl border p-6 ${
            theme === 'dark'
              ? 'bg-charcoal border-fire-red/20'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowDownCircle className="text-fire-red" size={24} />
              {t.expensesCount}
            </h2>
            {projectExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.noExpenses}</p>
            ) : (
              <div className="space-y-3">
                {projectExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-charcoal/50 border-fire-red/10 hover:border-fire-red/30'
                        : 'bg-gray-50 border-gray-200 hover:border-fire-red/30'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {expense.amount?.toFixed(2)} {currency}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            theme === 'dark'
                              ? 'bg-fire-red/20 text-fire-red'
                              : 'bg-fire-red/10 text-fire-red'
                          }`}>
                            {expense.category}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-gray-600 dark:text-light-gray/70 mb-1">
                            {expense.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {expense.date ? formatDateArabic(expense.date) : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setTransactionToDelete(expense);
                          setIsDeletingExpense(true);
                          setShowDeleteDialog(true);
                        }}
                        className="p-2 text-fire-red hover:bg-fire-red/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenues */}
          <div className={`rounded-xl border p-6 ${
            theme === 'dark'
              ? 'bg-charcoal border-green-500/20'
              : 'bg-white border-green-200'
          }`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowUpCircle className="text-green-500" size={24} />
              الإيرادات
            </h2>
            {projectRevenues.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد إيرادات</p>
            ) : (
              <div className="space-y-3">
                {projectRevenues.map((revenue) => (
                  <div
                    key={revenue.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-charcoal/50 border-green-500/10 hover:border-green-500/30'
                        : 'bg-gray-50 border-gray-200 hover:border-green-500/30'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {revenue.amount?.toFixed(2)} {currency}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            theme === 'dark'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-green-500/10 text-green-500'
                          }`}>
                            {revenue.category}
                          </span>
                        </div>
                        {revenue.description && (
                          <p className="text-sm text-gray-600 dark:text-light-gray/70 mb-1">
                            {revenue.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {revenue.date ? formatDateArabic(revenue.date) : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setTransactionToDelete(revenue);
                          setIsDeletingExpense(false);
                          setShowDeleteDialog(true);
                        }}
                        className="p-2 text-fire-red hover:bg-fire-red/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showExpenseModal && (
          <AddTransactionModal
            type="expense"
            onClose={() => setShowExpenseModal(false)}
            projectId={selectedProject.id}
          />
        )}

        {showRevenueModal && (
          <AddTransactionModal
            type="revenue"
            onClose={() => setShowRevenueModal(false)}
            projectId={selectedProject.id}
          />
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
            <div className={`rounded-xl p-6 w-full max-w-md border ${
              theme === 'dark'
                ? 'bg-charcoal border-fire-red/20'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'تعديل المشروع' : 'Edit Project'}</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProject(null);
                    setProjectName('');
                  }}
                  className="text-gray-600 dark:text-light-gray hover:text-fire-red transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.projectName} *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-charcoal border-fire-red/20 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-fire-red transition-colors`}
                    placeholder={language === 'ar' ? 'أدخل اسم المشروع' : 'Enter project name'}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProject(null);
                      setProjectName('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleEditProject}
                    className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteDialog && (
          <ConfirmDialog
            title={transactionToDelete ? (language === 'ar' ? 'حذف المعاملة' : 'Delete Transaction') : (language === 'ar' ? 'حذف المشروع' : 'Delete Project')}
            message={
              transactionToDelete
                ? (language === 'ar' ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?')
                : (language === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المصروفات والإيرادات المرتبطة به.' : 'Are you sure you want to delete this project? All associated expenses and revenues will be deleted.')
            }
            onConfirm={transactionToDelete ? handleDeleteTransaction : handleDeleteProject}
            onCancel={() => {
              setShowDeleteDialog(false);
              setEditingProject(null);
              setTransactionToDelete(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="المشاريع - إدارة مشاريعك المالية"
        description="أنشئ وأدر مشاريعك المالية المختلفة. ربط المصروفات والإيرادات بكل مشروع لتتبع أفضل."
        keywords="المشاريع, إدارة المشاريع, مشاريع مالية, تتبع المشاريع"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.projectsTitle}</h1>
            <p className="text-gray-600 dark:text-light-gray/70">{language === 'ar' ? 'إدارة مشاريعك وملفاتها' : 'Manage your projects and files'}</p>
          </div>
        <button
          onClick={() => {
            setProjectName('');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
        >
          <FolderPlus size={20} />
          <span>{t.createProject}</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${
          theme === 'dark'
            ? 'bg-charcoal border-fire-red/20'
            : 'bg-white border-gray-200'
        }`}>
          <Folder size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t.noProjects}
          </h3>
          <p className="text-gray-600 dark:text-light-gray/70 mb-6">
            {t.createProjectDescription}
          </p>
          <button
            onClick={() => {
              setProjectName('');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
          >
            <FolderPlus size={20} />
            <span>{language === 'ar' ? 'إنشاء مشروع' : 'Create Project'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectExpenses = expenses.filter(e => e.projectId === project.id);
            const projectRevenues = revenues.filter(r => r.projectId === project.id);
            const totalExpenses = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const totalRevenues = projectRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
            const netIncome = totalRevenues - totalExpenses;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-6 rounded-xl border cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-charcoal border-fire-red/20 hover:border-fire-red/40 hover:shadow-lg hover:shadow-fire-red/10'
                    : 'bg-white border-gray-200 hover:border-fire-red/40 hover:shadow-lg'
                } group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-fire-red/20 text-fire-red'
                        : 'bg-fire-red/10 text-fire-red'
                    }`}>
                      <Folder size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-fire-red transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {projectExpenses.length + projectRevenues.length} {t.transactionsCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setProjectName(project.name);
                        setShowEditModal(true);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'bg-white/5 hover:bg-white/10 text-light-gray hover:text-fire-red'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-fire-red'
                      }`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 rounded-lg bg-fire-red/10 hover:bg-fire-red/20 text-fire-red transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-light-gray/70">{t.expensesCount}</span>
                    <span className="font-semibold text-fire-red">
                      {totalExpenses.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-light-gray/70">{t.revenuesCount}</span>
                    <span className="font-semibold text-green-500">
                      {totalRevenues.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-fire-red/20">
                    <span className="text-gray-900 dark:text-white font-semibold">{t.netIncome}</span>
                    <span className={`font-bold ${
                      netIncome >= 0 ? 'text-green-500' : 'text-fire-red'
                    }`}>
                      {netIncome >= 0 ? '+' : ''}{netIncome.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className={`rounded-xl p-6 w-full max-w-md border ${
            theme === 'dark'
              ? 'bg-charcoal border-fire-red/20'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'مشروع جديد' : 'New Project'}</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setProjectName('');
                }}
                className="text-gray-600 dark:text-light-gray hover:text-fire-red transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.projectName} *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject();
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-charcoal border-fire-red/20 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:border-fire-red transition-colors`}
                  placeholder={language === 'ar' ? 'أدخل اسم المشروع' : 'Enter project name'}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setProjectName('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
                >
                  إنشاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - shown when not in project details */}
      {showEditModal && !selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className={`rounded-xl p-6 w-full max-w-md border ${
            theme === 'dark'
              ? 'bg-charcoal border-fire-red/20'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'تعديل المشروع' : 'Edit Project'}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                  setProjectName('');
                }}
                className="text-gray-600 dark:text-light-gray hover:text-fire-red transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">{t.projectName} *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-charcoal border-fire-red/20 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:border-fire-red transition-colors`}
                  placeholder={language === 'ar' ? 'أدخل اسم المشروع' : 'Enter project name'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProject(null);
                    setProjectName('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleEditProject}
                  className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog - shown when not in project details */}
      {showDeleteDialog && !selectedProject && (
        <ConfirmDialog
          title={language === 'ar' ? 'حذف المشروع' : 'Delete Project'}
          message={language === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المصروفات والإيرادات المرتبطة به.' : 'Are you sure you want to delete this project? All associated expenses and revenues will be deleted.'}
          onConfirm={handleDeleteProject}
          onCancel={() => {
            setShowDeleteDialog(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Project Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl ${
            theme === 'dark' 
              ? 'bg-charcoal border border-white/10' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            } flex items-center justify-between`}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <AlertCircle className="text-fire-red" size={28} />
                {t.projectLimitReached}
              </h2>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setShowCreateModal(false);
                }}
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
            <div className="p-6">
              <div className={`mb-4 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-fire-red/10 border border-fire-red/20' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t.contactDeveloperMessage}
                </p>
              </div>
              
              {userData?.projectLimit !== undefined && (
                <div className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-light-gray' : 'text-gray-600'}`}>
                      {t.currentProjectLimit}:
                    </span>
                    <span className="text-sm font-bold text-blue-500">{userData.projectLimit}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-sm ${theme === 'dark' ? 'text-light-gray' : 'text-gray-600'}`}>
                      {t.projectsUsed}:
                    </span>
                    <span className="text-sm font-bold text-red-500">
                      {projects.length} / {userData.projectLimit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setShowCreateModal(false);
                }}
                className="w-full px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg font-medium transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Projects;

