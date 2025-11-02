import { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import StatsCard from '../components/StatsCard';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import SEO from '../components/SEO';
import { ArrowDownCircle, DollarSign, Receipt, Plus } from 'lucide-react';

const Expenses = () => {
  const { expenses, deleteExpense, loading } = useTransactions();
  const { currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const count = expenses.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [expenses]);

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
        title={`${t.expensesTitle} - ${t.appName}`}
        description={language === 'ar' ? 'أضف وتتبع جميع مصروفاتك اليومية والشهرية بسهولة. نظام شامل لإدارة المصروفات مع إمكانية التصنيف والتقارير.' : 'Add and track all your daily and monthly expenses easily. Comprehensive expense management system with categorization and reporting.'}
        keywords={language === 'ar' ? 'المصروفات, إدارة المصروفات, تتبع المصروفات, مصروفات شخصية' : 'expenses, expense management, track expenses, personal expenses'}
      />
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.expensesTitle}</h1>
          <p className="text-gray-600 dark:text-light-gray/70">{language === 'ar' ? 'إدارة جميع مصروفاتك' : 'Manage all your expenses'}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all glow-red"
        >
          <Plus size={20} />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={t.totalExpenses}
          value={`${stats.total.toFixed(2)} ${currency}`}
          icon={ArrowDownCircle}
          color="fire-red"
        />
        <StatsCard
          title={language === 'ar' ? 'عدد المعاملات' : 'Number of Transactions'}
          value={stats.count}
          icon={Receipt}
          color="blue-500"
        />
        <StatsCard
          title={t.averageExpense}
          value={`${stats.avg.toFixed(2)} ${currency}`}
          icon={DollarSign}
          color="orange-500"
        />
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={expenses}
        type="expense"
        onDelete={deleteExpense}
        onUpdate={() => {}}
      />

      {showModal && (
        <AddTransactionModal
          type="expense"
          onClose={() => setShowModal(false)}
        />
      )}
      </div>
    </>
  );
};

export default Expenses;

