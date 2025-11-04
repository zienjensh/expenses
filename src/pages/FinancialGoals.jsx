import { useState } from 'react';
import { useGoals } from '../context/GoalsContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import { Plus, Edit, Trash2, Target, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ConfirmDialog from '../components/ConfirmDialog';
import SEO from '../components/SEO';

const FinancialGoals = () => {
  const { goals, loading, addGoal, updateGoal, deleteGoal, addContribution, calculateGoalProgress } = useGoals();
  const { currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [addingMoney, setAddingMoney] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    goalAmount: '',
    currentAmount: '',
    targetDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, formData);
        setEditingGoal(null);
      } else {
        await addGoal(formData);
      }
      setShowAddModal(false);
      setFormData({
        name: '',
        goalAmount: '',
        currentAmount: '',
        targetDate: '',
      });
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async () => {
    if (deletingGoal) {
      await deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  const handleAddMoney = async () => {
    if (addingMoney && contributionAmount) {
      try {
        await addContribution(addingMoney.id, parseFloat(contributionAmount));
        setAddingMoney(null);
        setContributionAmount('');
      } catch (error) {
        console.error('Error adding contribution:', error);
      }
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
        title={`${t.financialGoals} - ${t.appName}`}
        description={language === 'ar' ? 'إدارة أهدافك المالية وتتبع التقدم' : 'Manage your financial goals and track progress'}
      />
      <div className="space-y-6 animate-fadeIn">
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.financialGoals}</h1>
            <p className="text-gray-600 dark:text-light-gray/70">
              {language === 'ar' ? 'حدد أهدافك المالية وتتبع تقدمك' : 'Set your financial goals and track your progress'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all glow-red shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>{t.addGoal}</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-light-gray/50 text-lg">
                {language === 'ar' ? 'لا توجد أهداف. ابدأ بإضافة هدف جديد.' : 'No goals. Start by adding a new goal.'}
              </p>
            </div>
          ) : (
            goals.map((goal) => {
              const { progress, percentage, monthlyContribution, daysRemaining, remainingAmount } = calculateGoalProgress(goal);
              const isAchieved = percentage >= 100;

              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${isAchieved ? 'bg-green-500/20' : 'bg-fire-red/20'}`}>
                        <Target className={isAchieved ? 'text-green-500' : 'text-fire-red'} size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                        {goal.targetDate && (
                          <p className="text-sm text-gray-500 dark:text-light-gray/50">
                            {new Date(goal.targetDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setFormData({
                            name: goal.name,
                            goalAmount: goal.goalAmount,
                            currentAmount: goal.currentAmount || 0,
                            targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingGoal(goal)}
                        className="p-2 text-fire-red hover:bg-fire-red/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-light-gray">{t.progress}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            isAchieved ? 'bg-green-500' : 'bg-fire-red'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-light-gray">{t.currentAmount}</span>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {progress.toFixed(2)} {currency}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-light-gray">{t.goalAmount}</span>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {goal.goalAmount.toFixed(2)} {currency}
                        </p>
                      </div>
                    </div>

                    {!isAchieved && (
                      <>
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-light-gray mb-1">{t.monthlyContribution}</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {monthlyContribution.toFixed(2)} {currency}
                          </p>
                        </div>

                        {daysRemaining > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-light-gray">{t.daysRemaining}</span>
                            <span className="font-bold text-fire-red">{daysRemaining} {language === 'ar' ? 'يوم' : 'days'}</span>
                          </div>
                        )}
                      </>
                    )}

                    {isAchieved && (
                      <div className="flex items-center gap-2 p-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold">
                        <Target size={16} />
                        <span>{t.goalAchieved}</span>
                      </div>
                    )}

                    {!isAchieved && (
                      <button
                        onClick={() => {
                          setAddingMoney(goal);
                          setContributionAmount('');
                        }}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        <DollarSign size={18} />
                        <span>{t.addMoney}</span>
                      </button>
                    )}
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
                {t.addContribution}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.goalName}
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">{addingMoney.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.contributionAmount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder={`${currency} ${language === 'ar' ? '0.00' : '0.00'}`}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddMoney}
                    disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {t.add}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingMoney(null);
                      setContributionAmount('');
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
                {editingGoal ? t.editGoal : t.addGoal}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.goalName}
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
                    {t.goalAmount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.currentAmount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-light-gray mb-1">
                    {t.targetDate}
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-fire-red/20 rounded-lg bg-white dark:bg-charcoal text-gray-900 dark:text-white focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  />
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
                      setEditingGoal(null);
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
        {deletingGoal && (
          <ConfirmDialog
            title={t.confirmDelete}
            message={`${language === 'ar' ? 'هل أنت متأكد من حذف الهدف' : 'Are you sure you want to delete the goal'}: ${deletingGoal.name}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingGoal(null)}
          />
        )}
      </div>
    </>
  );
};

export default FinancialGoals;

