import { useState } from 'react';
import { useBudgets } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { Plus, Edit, Trash2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ConfirmDialog from '../components/ConfirmDialog';
import SEO from '../components/SEO';

const Budgets = () => {
  const { budgets, loading, addBudget, updateBudget, deleteBudget, calculateBudgetSpending } = useBudgets();
  const { currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [addingMoney, setAddingMoney] = useState(null);
  const [addedAmount, setAddedAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    category: '',
    enableAlerts: true,
    alertThreshold: 80,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, formData);
        setEditingBudget(null);
      } else {
        await addBudget(formData);
      }
      setShowAddModal(false);
      setFormData({
        name: '',
        amount: '',
        period: 'monthly',
        category: '',
        enableAlerts: true,
        alertThreshold: 80,
      });
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDelete = async () => {
    if (deletingBudget) {
      await deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
    }
  };

  const handleAddMoney = async () => {
    if (addingMoney && addedAmount) {
      try {
        const currentAmount = addingMoney.amount || 0;
        await updateBudget(addingMoney.id, {
          amount: currentAmount + parseFloat(addedAmount)
        });
        setAddingMoney(null);
        setAddedAmount('');
      } catch (error) {
        console.error('Error adding money to budget:', error);
      }
    }
  };

  const chartData = budgets.map(budget => {
    const { spent, remaining, percentage } = calculateBudgetSpending(budget);
    return {
      name: budget.name,
      spent,
      remaining: Math.max(0, remaining),
      percentage: Math.min(100, percentage),
    };
  });

  const COLORS = ['#E50914', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA15E'];

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
        title={`${t.budgets} - ${t.appName}`}
        description={language === 'ar' ? 'إدارة ميزانياتك الشهرية والسنوية وتتبع الإنفاق' : 'Manage your monthly and yearly budgets and track spending'}
      />
      <div className="space-y-6 animate-fadeIn">
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.budgets}</h1>
            <p className="text-gray-600 dark:text-light-gray/70">
              {language === 'ar' ? 'إدارة ميزانياتك وتتبع الإنفاق' : 'Manage your budgets and track spending'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBudget(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all glow-red shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>{t.addBudget}</span>
          </button>
        </div>

        {/* Budget Chart */}
        {budgets.length > 0 && (
          <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.budgetChart}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budgets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-light-gray/50 text-lg">
                {language === 'ar' ? 'لا توجد ميزانيات. ابدأ بإضافة ميزانية جديدة.' : 'No budgets. Start by adding a new budget.'}
              </p>
            </div>
          ) : (
            budgets.map((budget) => {
              const { spent, remaining, percentage } = calculateBudgetSpending(budget);
              const isExceeded = percentage >= 100;
              const isWarning = percentage >= (budget.alertThreshold || 80);

              return (
                <div
                  key={budget.id}
                  className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{budget.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-light-gray/50">
                        {budget.period === 'monthly' ? t.monthly : t.yearly}
                        {budget.category && ` • ${budget.category}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBudget(budget);
                          setFormData({
                            name: budget.name,
                            amount: budget.amount,
                            period: budget.period,
                            category: budget.category || '',
                            enableAlerts: budget.enableAlerts,
                            alertThreshold: budget.alertThreshold || 80,
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingBudget(budget)}
                        className="p-2 text-fire-red hover:bg-fire-red/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-light-gray">{t.spent}</span>
                        <span className={`text-sm font-bold ${isExceeded ? 'text-fire-red' : 'text-gray-900 dark:text-white'}`}>
                          {spent.toFixed(2)} {currency}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            isExceeded
                              ? 'bg-fire-red'
                              : isWarning
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-light-gray">{t.remaining}</span>
                      <span className={`font-bold ${remaining < 0 ? 'text-fire-red' : 'text-green-500'}`}>
                        {remaining.toFixed(2)} {currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-light-gray">{t.budgetAmount}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {budget.amount.toFixed(2)} {currency}
                      </span>
                    </div>

                    {isExceeded && (
                      <div className="flex items-center gap-2 p-2 bg-fire-red/10 text-fire-red rounded-lg text-sm">
                        <AlertTriangle size={16} />
                        <span>{t.budgetExceeded}</span>
                      </div>
                    )}

                    {isWarning && !isExceeded && (
                      <div className="flex items-center gap-2 p-2 bg-orange-500/10 text-orange-500 rounded-lg text-sm">
                        <AlertTriangle size={16} />
                        <span>{t.budgetWarning}</span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setAddingMoney(budget);
                        setAddedAmount('');
                      }}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <DollarSign size={18} />
                      <span>{t.addMoney}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Money Modal */}
        {addingMoney && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-charcoal rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t.addToBudget}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.budgetName}
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">{addingMoney.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {language === 'ar' ? 'المبلغ المضاف' : 'Amount to Add'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={addedAmount}
                    onChange={(e) => setAddedAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder={`${currency} ${language === 'ar' ? '0.00' : '0.00'}`}
                    required
                    autoFocus
                  />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-light-gray mb-1">
                    {language === 'ar' ? 'الميزانية الحالية' : 'Current Budget'}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {addingMoney.amount.toFixed(2)} {currency}
                  </p>
                  {addedAmount && parseFloat(addedAmount) > 0 && (
                    <p className="text-sm text-gray-600 dark:text-light-gray mt-2">
                      {language === 'ar' ? 'الميزانية الجديدة' : 'New Budget'}: {(addingMoney.amount + parseFloat(addedAmount)).toFixed(2)} {currency}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddMoney}
                    disabled={!addedAmount || parseFloat(addedAmount) <= 0}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {t.add}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingMoney(null);
                      setAddedAmount('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-charcoal rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingBudget ? t.editBudget : t.addBudget}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.budgetName}
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
                    {t.budgetAmount}
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
                    {t.budgetPeriod}
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  >
                    <option value="monthly">{t.monthly}</option>
                    <option value="yearly">{t.yearly}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.budgetCategory} ({t.optional})
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder={language === 'ar' ? 'مثال: طعام، مواصلات' : 'e.g., Food, Transportation'}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableAlerts"
                    checked={formData.enableAlerts}
                    onChange={(e) => setFormData({ ...formData, enableAlerts: e.target.checked })}
                    className="w-4 h-4 text-fire-red focus:ring-fire-red border-gray-300 rounded"
                  />
                  <label htmlFor="enableAlerts" className="text-sm text-gray-700 dark:text-light-gray">
                    {t.enableAlerts}
                  </label>
                </div>

                {formData.enableAlerts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                      {t.alertThreshold}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.alertThreshold}
                      onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    />
                  </div>
                )}

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
                      setEditingBudget(null);
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
        {deletingBudget && (
          <ConfirmDialog
            title={t.confirmDelete}
            message={`${language === 'ar' ? 'هل أنت متأكد من حذف الميزانية' : 'Are you sure you want to delete the budget'}: ${deletingBudget.name}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingBudget(null)}
          />
        )}
      </div>
    </>
  );
};

export default Budgets;

