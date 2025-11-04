import { useState } from 'react';
import { useRecurringBills } from '../context/RecurringBillsContext';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import SEO from '../components/SEO';
import { format } from 'date-fns';

const RecurringBills = () => {
  const { bills, loading, addRecurringBill, updateRecurringBill, deleteRecurringBill, processBill, calculateNextDueDate } = useRecurringBills();
  const { addExpense } = useTransactions();
  const { currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [deletingBill, setDeletingBill] = useState(null);
  const [processingBill, setProcessingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    category: '',
    paymentMethod: '',
    nextDueDate: '',
    autoProcess: false,
    reminderDays: 3,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBill) {
        await updateRecurringBill(editingBill.id, formData);
        setEditingBill(null);
      } else {
        await addRecurringBill(formData);
      }
      setShowAddModal(false);
      setFormData({
        name: '',
        amount: '',
        frequency: 'monthly',
        category: '',
        paymentMethod: '',
        nextDueDate: '',
        autoProcess: false,
        reminderDays: 3,
      });
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleDelete = async () => {
    if (deletingBill) {
      await deleteRecurringBill(deletingBill.id);
      setDeletingBill(null);
    }
  };

  const handleProcessBill = async () => {
    if (processingBill) {
      try {
        // Add as expense first
        await addExpense({
          amount: processingBill.amount,
          description: processingBill.name,
          category: processingBill.category || (language === 'ar' ? 'فواتير' : 'Bills'),
          date: new Date().toISOString().split('T')[0],
          paymentMethod: processingBill.paymentMethod || (language === 'ar' ? 'نقد' : 'Cash'),
        });
        
        // Then process the bill (update next due date)
        await processBill(processingBill.id);
        setProcessingBill(null);
      } catch (error) {
        console.error('Error processing bill:', error);
      }
    }
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: t.daily,
      weekly: t.weekly,
      biweekly: t.biweekly,
      monthly: t.monthlyBill,
      quarterly: t.quarterly,
      yearly: t.yearlyBill,
    };
    return labels[frequency] || frequency;
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
        title={`${t.recurringBills} - ${t.appName}`}
        description={language === 'ar' ? 'إدارة الفواتير المتكررة وتذكيرات الاستحقاق' : 'Manage recurring bills and due date reminders'}
      />
      <div className="space-y-6 animate-fadeIn">
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.recurringBills}</h1>
            <p className="text-gray-600 dark:text-light-gray/70">
              {language === 'ar' ? 'إدارة فواتيرك المتكررة وتذكيرات الاستحقاق' : 'Manage your recurring bills and due date reminders'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBill(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all glow-red shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>{t.addRecurringBill}</span>
          </button>
        </div>

        {/* Bills List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-light-gray/50 text-lg">
                {language === 'ar' ? 'لا توجد فواتير متكررة. ابدأ بإضافة فاتورة جديدة.' : 'No recurring bills. Start by adding a new bill.'}
              </p>
            </div>
          ) : (
            bills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.nextDueDate);
              const isDue = daysUntilDue !== null && daysUntilDue <= 0;
              const isWarning = daysUntilDue !== null && daysUntilDue <= (bill.reminderDays || 3) && daysUntilDue > 0;

              return (
                <div
                  key={bill.id}
                  className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{bill.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-light-gray/50">
                        {getFrequencyLabel(bill.frequency)}
                        {bill.category && ` • ${bill.category}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBill(bill);
                          setFormData({
                            name: bill.name,
                            amount: bill.amount,
                            frequency: bill.frequency,
                            category: bill.category || '',
                            paymentMethod: bill.paymentMethod || '',
                            nextDueDate: bill.nextDueDate ? new Date(bill.nextDueDate).toISOString().split('T')[0] : '',
                            autoProcess: bill.autoProcess || false,
                            reminderDays: bill.reminderDays || 3,
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingBill(bill)}
                        className="p-2 text-fire-red hover:bg-fire-red/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-light-gray">{t.amount}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {bill.amount.toFixed(2)} {currency}
                      </span>
                    </div>

                    {bill.nextDueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-light-gray">{t.nextDueDate}</span>
                        <span className={`font-bold ${isDue ? 'text-fire-red' : isWarning ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>
                          {format(new Date(bill.nextDueDate), language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy')}
                        </span>
                      </div>
                    )}

                    {daysUntilDue !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-light-gray">
                          {language === 'ar' ? 'الأيام المتبقية' : 'Days Remaining'}
                        </span>
                        <span className={`font-bold ${isDue ? 'text-fire-red' : isWarning ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>
                          {isDue 
                            ? (language === 'ar' ? 'مستحقة' : 'Due')
                            : `${daysUntilDue} ${language === 'ar' ? 'يوم' : 'days'}`
                          }
                        </span>
                      </div>
                    )}

                    {bill.lastProcessed && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-light-gray/50">{t.lastProcessed}</span>
                        <span className="text-gray-500 dark:text-light-gray/50">
                          {format(new Date(bill.lastProcessed), language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy')}
                        </span>
                      </div>
                    )}

                    {bill.autoProcess && (
                      <div className="flex items-center gap-2 p-2 bg-green-500/10 text-green-500 rounded-lg text-sm">
                        <CheckCircle size={16} />
                        <span>{t.autoProcess}</span>
                      </div>
                    )}

                    {isDue && (
                      <button
                        onClick={() => setProcessingBill(bill)}
                        className="w-full px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        <span>{t.processBill}</span>
                      </button>
                    )}

                    {isWarning && !isDue && (
                      <div className="flex items-center gap-2 p-2 bg-orange-500/10 text-orange-500 rounded-lg text-sm">
                        <AlertCircle size={16} />
                        <span>
                          {language === 'ar' 
                            ? `ستكون مستحقة خلال ${daysUntilDue} ${daysUntilDue === 1 ? 'يوم' : 'أيام'}`
                            : `Due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-charcoal rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingBill ? t.editRecurringBill : t.addRecurringBill}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.billName}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.billAmount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.frequency}
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  >
                    <option value="daily">{t.daily}</option>
                    <option value="weekly">{t.weekly}</option>
                    <option value="biweekly">{t.biweekly}</option>
                    <option value="monthly">{t.monthlyBill}</option>
                    <option value="quarterly">{t.quarterly}</option>
                    <option value="yearly">{t.yearlyBill}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.category} ({t.optional})
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.nextDueDate}
                  </label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.reminderDays}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoProcess"
                    checked={formData.autoProcess}
                    onChange={(e) => setFormData({ ...formData, autoProcess: e.target.checked })}
                    className="w-4 h-4 text-fire-red focus:ring-fire-red border-gray-300 rounded"
                  />
                  <label htmlFor="autoProcess" className="text-sm text-gray-700 dark:text-light-gray">
                    {t.autoProcess}
                  </label>
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
                      setEditingBill(null);
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
        {deletingBill && (
          <ConfirmDialog
            title={t.confirmDelete}
            message={`${language === 'ar' ? 'هل أنت متأكد من حذف الفاتورة المتكررة' : 'Are you sure you want to delete the recurring bill'}: ${deletingBill.name}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingBill(null)}
          />
        )}

        {/* Process Bill Confirmation */}
        {processingBill && (
          <ConfirmDialog
            title={t.processBill}
            message={`${language === 'ar' ? 'هل تريد معالجة الفاتورة' : 'Do you want to process the bill'}: ${processingBill.name}? ${language === 'ar' ? 'سيتم إضافتها كمصروف.' : 'It will be added as an expense.'}`}
            onConfirm={handleProcessBill}
            onCancel={() => setProcessingBill(null)}
          />
        )}
      </div>
    </>
  );
};

export default RecurringBills;

