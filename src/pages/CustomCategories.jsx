import { useState } from 'react';
import { useCustomCategories } from '../context/CustomCategoriesContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { Plus, Edit, Trash2, Tag, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ConfirmDialog from '../components/ConfirmDialog';
import SEO from '../components/SEO';

const CustomCategories = () => {
  const { 
    categories, 
    defaultCategories, 
    loading, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    getAllCategories,
    getCategoryStatistics 
  } = useCustomCategories();
  const { currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#95A5A6',
  });

  // Popular icons (emojis)
  const popularIcons = [
    '🍔', '🚗', '🛒', '🏥', '🎬', '💡', '📚', '📦',
    '🍕', '☕', '✈️', '🏠', '👕', '💊', '🎮', '🎵',
    '🍔', '🚕', '🛍️', '💻', '📱', '🎨', '🏋️', '🧘',
    '🍰', '🍺', '🚇', '⛽', '🏖️', '🎪', '🎭', '🎯'
  ];

  // Popular colors
  const popularColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA15E',
    '#9B59B6', '#95A5A6', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
    '#E67E22', '#1ABC9C', '#34495E', '#9B59B6', '#E91E63', '#00BCD4',
    '#FF9800', '#795548', '#607D8B', '#8BC34A', '#FF5722', '#3F51B5'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setEditingCategory(null);
      } else {
        await addCategory(formData);
      }
      setShowAddModal(false);
      setFormData({
        name: '',
        icon: '📦',
        color: '#95A5A6',
      });
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const allCategories = getAllCategories();
  
  // Chart data for category statistics
  const chartData = allCategories.map(cat => {
    const stats = getCategoryStatistics(cat.name);
    return {
      name: cat.name,
      expenses: stats.totalExpenses,
      revenues: stats.totalRevenues,
      transactions: stats.transactionCount,
      color: cat.color || '#95A5A6',
    };
  }).filter(item => item.transactions > 0);

  const COLORS = chartData.map(item => item.color);

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
        title={`${t.customCategories} - ${t.appName}`}
        description={language === 'ar' ? 'إدارة الفئات المخصصة مع أيقونات وألوان مخصصة' : 'Manage custom categories with custom icons and colors'}
      />
      <div className="space-y-6 animate-fadeIn">
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.customCategories}</h1>
            <p className="text-gray-600 dark:text-light-gray/70">
              {language === 'ar' ? 'إدارة فئاتك المخصصة مع أيقونات وألوان خاصة' : 'Manage your custom categories with custom icons and colors'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all glow-red shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>{t.addCategory}</span>
          </button>
        </div>

        {/* Statistics Chart */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.categoryStatistics}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-light-gray mb-3">
                  {language === 'ar' ? 'توزيع المصروفات حسب الفئة' : 'Expenses by Category'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, expenses }) => `${name}: ${expenses.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="expenses"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-light-gray mb-3">
                  {language === 'ar' ? 'عدد المعاملات حسب الفئة' : 'Transactions by Category'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="#E50914" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Default Categories */}
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.defaultCategories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {defaultCategories.map((category, index) => {
              const stats = getCategoryStatistics(category.name);
              return (
                <div
                  key={`default-${index}`}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-fire-red/20 hover:border-fire-red/40 transition-colors cursor-default"
                  style={{ borderColor: category.color }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                      <div 
                        className="w-full h-2 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-light-gray">{t.totalExpenses}</span>
                      <span className="font-bold text-fire-red">{stats.totalExpenses.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-light-gray">{t.totalRevenues}</span>
                      <span className="font-bold text-green-500">{stats.totalRevenues.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-light-gray">{language === 'ar' ? 'المعاملات' : 'Transactions'}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{stats.transactionCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Categories */}
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.customCategories}</h2>
            <span className="text-sm text-gray-500 dark:text-light-gray/50">
              {categories.length} {language === 'ar' ? 'فئة مخصصة' : 'custom categories'}
            </span>
          </div>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="mx-auto mb-4 text-gray-400 dark:text-light-gray/50" size={48} />
              <p className="text-gray-500 dark:text-light-gray/50 text-lg">
                {language === 'ar' ? 'لا توجد فئات مخصصة. ابدأ بإضافة فئة جديدة.' : 'No custom categories. Start by adding a new category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const stats = getCategoryStatistics(category.name);
                return (
                  <div
                    key={category.id}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-fire-red/20 hover:border-fire-red/40 transition-all relative group"
                    style={{ borderColor: category.color || '#95A5A6' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{category.icon || '📦'}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                          <div 
                            className="w-full h-2 rounded-full mt-1"
                            style={{ backgroundColor: category.color || '#95A5A6' }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setFormData({
                              name: category.name,
                              icon: category.icon || '📦',
                              color: category.color || '#95A5A6',
                            });
                            setShowAddModal(true);
                          }}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(category)}
                          className="p-1.5 text-fire-red hover:bg-fire-red/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-light-gray">{t.totalExpenses}</span>
                        <span className="font-bold text-fire-red">{stats.totalExpenses.toFixed(2)} {currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-light-gray">{t.totalRevenues}</span>
                        <span className="font-bold text-green-500">{stats.totalRevenues.toFixed(2)} {currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-light-gray">{language === 'ar' ? 'المعاملات' : 'Transactions'}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.transactionCount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-fire-red/10">
                        <span className="text-gray-600 dark:text-light-gray">{language === 'ar' ? 'صافي المبلغ' : 'Net Amount'}</span>
                        <span className={`font-bold ${stats.netAmount >= 0 ? 'text-green-500' : 'text-fire-red'}`}>
                          {stats.netAmount >= 0 ? '+' : ''}{stats.netAmount.toFixed(2)} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-charcoal rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingCategory ? t.editCategory : t.addCategory}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.categoryName}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    required
                    placeholder={language === 'ar' ? 'مثال: صالون، صيدلية' : 'e.g., Salon, Pharmacy'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-2">
                    {t.categoryIcon}
                  </label>
                  <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-fire-red/20 rounded-lg">
                    {popularIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-2 text-2xl rounded-lg transition-all hover:scale-110 ${
                          formData.icon === icon 
                            ? 'bg-fire-red/20 ring-2 ring-fire-red' 
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-light-gray">{language === 'ar' ? 'الأيقونة المختارة:' : 'Selected icon:'}</span>
                    <span className="text-2xl">{formData.icon}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-2">
                    {t.categoryColor}
                  </label>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {popularColors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                          formData.color === color 
                            ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-2' 
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 rounded-lg border border-gray-300 dark:border-fire-red/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                      placeholder="#95A5A6"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-300 dark:border-fire-red/20"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-light-gray">{formData.color}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-colors"
                  >
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCategory(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingCategory && (
          <ConfirmDialog
            title={t.confirmDelete}
            message={`${language === 'ar' ? 'هل أنت متأكد من حذف الفئة' : 'Are you sure you want to delete the category'}: ${deletingCategory.name}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingCategory(null)}
          />
        )}
      </div>
    </>
  );
};

export default CustomCategories;

