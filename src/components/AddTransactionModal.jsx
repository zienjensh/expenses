import { useState } from 'react';
import { X } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

const AddTransactionModal = ({ type, onClose, editData = null }) => {
  const { addExpense, addRevenue, updateExpense, updateRevenue } = useTransactions();
  const [formData, setFormData] = useState({
    amount: editData?.amount || '',
    category: editData?.category || '',
    description: editData?.description || '',
    type: editData?.type || (type === 'expense' ? 'ثابت' : ''),
    paymentMethod: editData?.paymentMethod || 'نقدي',
    date: editData?.date || new Date().toISOString().split('T')[0],
  });

  const expenseCategories = ['طعام', 'مواصلات', 'صحة', 'ترفيه', 'فواتير', 'تسوق', 'أخرى'];
  const revenueCategories = ['راتب', 'استثمار', 'هدية', 'أخرى'];
  const expenseTypes = ['ثابت', 'متغير', 'طوارئ'];
  const paymentMethods = ['نقدي', 'بطاقة ائتمان', 'تحويل بنكي', 'محفظة إلكترونية'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
      };

      if (editData) {
        if (type === 'expense') {
          await updateExpense(editData.id, transactionData);
        } else {
          await updateRevenue(editData.id, transactionData);
        }
      } else {
        if (type === 'expense') {
          await addExpense(transactionData);
        } else {
          await addRevenue(transactionData);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-fire-red/20 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editData ? 'تعديل' : 'إضافة'} {type === 'expense' ? 'مصروف' : 'إيراد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-light-gray hover:text-fire-red transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">المبلغ *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">الفئة *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
            >
              <option value="">اختر الفئة</option>
              {(type === 'expense' ? expenseCategories : revenueCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">نوع المصروف</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
              >
                {expenseTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">طريقة الدفع</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-light-gray/70 mb-2">التاريخ *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-fire-red/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-fire-red transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all glow-red"
            >
              {editData ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;

