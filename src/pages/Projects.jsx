import { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO';
import { FolderPlus, Folder, X, Edit2, Trash2, ArrowLeft, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { format } from 'date-fns';

const Projects = () => {
  const { projects, addProject, updateProject, deleteProject, loading: projectsLoading } = useProjects();
  const { expenses, revenues, deleteExpense, deleteRevenue } = useTransactions();
  const { currency, theme } = useTheme();
  
  // Debug: Log projects state
  console.log('Projects component - projects:', projects);
  console.log('Projects component - loading:', projectsLoading);
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
        <div className="text-fire-red text-2xl">جاري التحميل...</div>
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
              <p className="text-gray-600 dark:text-light-gray/70">تفاصيل المشروع</p>
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
              <span>تعديل</span>
            </button>
            <button
              onClick={() => {
                setEditingProject(selectedProject);
                setShowDeleteDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-fire-red/10 hover:bg-fire-red/20 text-fire-red rounded-lg transition-all border border-fire-red/30"
            >
              <Trash2 size={18} />
              <span>حذف</span>
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
              <h3 className="text-gray-600 dark:text-light-gray/70">إجمالي المصروفات</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {projectStats.totalExpenses.toFixed(2)} {currency}
            </p>
            <p className="text-sm text-gray-500 mt-1">{projectStats.expensesCount} معاملة</p>
          </div>
          <div className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-charcoal border-green-500/20'
              : 'bg-white border-green-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpCircle className="text-green-500" size={24} />
              <h3 className="text-gray-600 dark:text-light-gray/70">إجمالي الإيرادات</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {projectStats.totalRevenues.toFixed(2)} {currency}
            </p>
            <p className="text-sm text-gray-500 mt-1">{projectStats.revenuesCount} معاملة</p>
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
              <h3 className="text-gray-600 dark:text-light-gray/70">صافي الدخل</h3>
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
            <span>إضافة مصروف</span>
          </button>
          <button
            onClick={() => setShowRevenueModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            <Plus size={20} />
            <span>إضافة إيراد</span>
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
              المصروفات
            </h2>
            {projectExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد مصروفات</p>
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
                          {expense.date ? format(new Date(expense.date), 'dd/MM/yyyy') : ''}
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
                          {revenue.date ? format(new Date(revenue.date), 'dd/MM/yyyy') : ''}
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تعديل المشروع</h2>
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
                  <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">اسم المشروع *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-charcoal border-fire-red/20 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-fire-red transition-colors`}
                    placeholder="أدخل اسم المشروع"
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
                    إلغاء
                  </button>
                  <button
                    onClick={handleEditProject}
                    className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
                  >
                    تحديث
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteDialog && (
          <ConfirmDialog
            title={transactionToDelete ? 'حذف المعاملة' : 'حذف المشروع'}
            message={
              transactionToDelete
                ? 'هل أنت متأكد من حذف هذه المعاملة؟'
                : 'هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المصروفات والإيرادات المرتبطة به.'
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">المشاريع</h1>
            <p className="text-gray-600 dark:text-light-gray/70">إدارة مشاريعك وملفاتها</p>
          </div>
        <button
          onClick={() => {
            setProjectName('');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
        >
          <FolderPlus size={20} />
          <span>مشروع جديد</span>
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
            لا توجد مشاريع
          </h3>
          <p className="text-gray-600 dark:text-light-gray/70 mb-6">
            ابدأ بإنشاء مشروع جديد لإدارة مصروفاتك وإيراداتك
          </p>
          <button
            onClick={() => {
              setProjectName('');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
          >
            <FolderPlus size={20} />
            <span>إنشاء مشروع</span>
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
                        {projectExpenses.length + projectRevenues.length} معاملة
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
                    <span className="text-gray-600 dark:text-light-gray/70">المصروفات</span>
                    <span className="font-semibold text-fire-red">
                      {totalExpenses.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-light-gray/70">الإيرادات</span>
                    <span className="font-semibold text-green-500">
                      {totalRevenues.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-fire-red/20">
                    <span className="text-gray-900 dark:text-white font-semibold">صافي الدخل</span>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مشروع جديد</h2>
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
                <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">اسم المشروع *</label>
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
                  placeholder="أدخل اسم المشروع"
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
                  إلغاء
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تعديل المشروع</h2>
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
                <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">اسم المشروع *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-charcoal border-fire-red/20 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:border-fire-red transition-colors`}
                  placeholder="أدخل اسم المشروع"
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
                  إلغاء
                </button>
                <button
                  onClick={handleEditProject}
                  className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all"
                >
                  تحديث
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog - shown when not in project details */}
      {showDeleteDialog && !selectedProject && (
        <ConfirmDialog
          title="حذف المشروع"
          message="هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المصروفات والإيرادات المرتبطة به."
          onConfirm={handleDeleteProject}
          onCancel={() => {
            setShowDeleteDialog(false);
            setEditingProject(null);
          }}
        />
      )}
      </div>
    </>
  );
};

export default Projects;

