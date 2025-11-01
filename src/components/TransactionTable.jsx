import { useState } from 'react';
import { Edit, Trash2, Search, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AddTransactionModal from './AddTransactionModal';
import ConfirmDialog from './ConfirmDialog';
import { format } from 'date-fns';

const TransactionTable = ({ transactions, type, onDelete, onUpdate }) => {
  const { currency } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-light-gray/50" size={20} />
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 bg-white dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
        >
          <option value="">جميع الفئات</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-charcoal/50 border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
        >
          <option value="">جميع طرق الدفع</option>
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">الفئة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">الوصف</th>
                {type === 'expense' && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">النوع</th>
                )}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">طريقة الدفع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">التاريخ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-light-gray">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-fire-red/10">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={type === 'expense' ? 7 : 6} className="px-6 py-8 text-center text-gray-500 dark:text-light-gray/50">
                    لا توجد معاملات
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
                    <td className="px-6 py-4 text-gray-700 dark:text-light-gray">{transaction.category}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">{transaction.description || '-'}</td>
                    {type === 'expense' && (
                      <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">{transaction.type || '-'}</td>
                    )}
                    <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">{transaction.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-light-gray/70">
                      {format(new Date(transaction.date), 'yyyy-MM-dd')}
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
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          الإجمالي: <span className={type === 'expense' ? 'text-fire-red' : 'text-green-500'}>
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
          title="تأكيد الحذف"
          message="هل أنت متأكد من حذف هذه المعاملة؟"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default TransactionTable;

