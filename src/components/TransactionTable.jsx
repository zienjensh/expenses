import { useState } from 'react';
import { Edit, Trash2, Search, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomCategories } from '../context/CustomCategoriesContext';
import { getTranslation } from '../utils/i18n';
import AddTransactionModal from './AddTransactionModal';
import ConfirmDialog from './ConfirmDialog';
import { format } from 'date-fns';

const TransactionTable = ({ transactions, type, onDelete, onUpdate }) => {
  const { currency } = useTheme();
  const { language } = useLanguage();
  const { getAllCategories } = useCustomCategories();
  const t = getTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Get all categories with icons and colors
  const allCategories = getAllCategories();
  const getCategoryInfo = (categoryName) => {
    return allCategories.find(cat => cat.name === categoryName) || { 
      name: categoryName, 
      icon: '📦', 
      color: '#95A5A6' 
    };
  };

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
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const categories = [...new Set(transactions.map(t => t.category))];
  const paymentMethods = [...new Set(transactions.map(t => t.paymentMethod))];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || transaction.category === filterCategory;
    const matchesPayment = !filterPaymentMethod || transaction.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  const handleEdit = (transaction) => {
    setEditData(transaction);
  };

  const handleDelete = async (id) => {
    await onDelete(id);
    setDeleteId(null);
  };

  const total = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50`} size={20} />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-2 ${language === 'ar' ? 'pr-10' : 'pl-10'} bg-white dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors`}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
        >
          <option value="">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
          {categories.map(cat => {
            const categoryInfo = getCategoryInfo(cat);
            return (
              <option key={cat} value={cat}>
                {categoryInfo.icon} {categoryInfo.name}
              </option>
            );
          })}
        </select>
        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
        >
          <option value="">{language === 'ar' ? 'جميع طرق الدفع' : 'All Payment Methods'}</option>
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl border border-gray-200 dark:border-fire-red/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-fire-red/10">
              <tr>
                <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-600 dark:text-light-gray`}>{t.amount}</th>
                <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-600 dark:text-light-gray`}>{t.category}</th>
                <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-600 dark:text-light-gray`}>{t.description}</th>
                {type === 'expense' && (
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-600 dark:text-light-gray`}>{t.expenseType}</th>
                )}
                <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-600 dark:text-light-gray`}>{t.paymentMethod}</th>
                <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-600 dark:text-light-gray`}>{t.date}</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-light-gray">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-fire-red/10">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={type === 'expense' ? 7 : 6} className="px-6 py-8 text-center text-gray-500 dark:text-light-gray/50">
                    {type === 'expense' ? t.noExpenses : t.noRevenues}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-fire-red/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`font-bold ${type === 'expense' ? 'text-fire-red' : 'text-green-500'}`}>
                        {type === 'expense' ? '-' : '+'} {transaction.amount?.toFixed(2)} {currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const categoryInfo = getCategoryInfo(transaction.category);
                          return (
                            <>
                              <span className="text-lg">{categoryInfo.icon}</span>
                              <span className="text-gray-700 dark:text-light-gray">{categoryInfo.name}</span>
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: categoryInfo.color }}
                                title={categoryInfo.color}
                              />
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">{transaction.description || '-'}</td>
                    {type === 'expense' && (
                      <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">{transaction.type || '-'}</td>
                    )}
                    <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">{transaction.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">
                      {formatDateArabic(transaction.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteId(transaction.id)}
                          className="p-2 text-fire-red hover:bg-fire-red/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className={language === 'ar' ? 'text-right' : 'text-left'}>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {t.total}: <span className={type === 'expense' ? 'text-fire-red' : 'text-green-500'}>
            {total.toFixed(2)} {currency}
          </span>
        </p>
      </div>

      {editData && (
        <AddTransactionModal
          type={type}
          editData={editData}
          onClose={() => setEditData(null)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={language === 'ar' ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?'}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default TransactionTable;

