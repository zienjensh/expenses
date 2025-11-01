import { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import StatsCard from '../components/StatsCard';
import ChartOverview from '../components/ChartOverview';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import SEO from '../components/SEO';
import { DollarSign, ArrowDownCircle, ArrowUpCircle, TrendingUp, Plus } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { expenses, revenues, loading } = useTransactions();
  const { currency } = useTheme();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);

  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalRevenues = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const netIncome = totalRevenues - totalExpenses;
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const avgRevenue = revenues.length > 0 ? totalRevenues / revenues.length : 0;

    return {
      totalExpenses,
      totalRevenues,
      netIncome,
      avgExpense,
      avgRevenue,
    };
  }, [expenses, revenues]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ ...e, transactionType: 'expense' })),
      ...revenues.map(r => ({ ...r, transactionType: 'revenue' }))
    ];
    return all
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses, revenues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-fire-red text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="لوحة التحكم - إدارة المصروفات والإيرادات"
        description="نظرة شاملة على وضعك المالي. تتبع إجمالي المصروفات والإيرادات وصافي الدخل مع رسوم بيانية تفاعلية."
        keywords="لوحة التحكم, إدارة مالية, نظرة عامة, إحصائيات مالية"
      />
      <div className="space-y-6">
        <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">لوحة التحكم</h1>
          <p className="text-gray-600 dark:text-light-gray/70">نظرة شاملة على وضعك المالي</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-xl transition-all glow-red shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">إضافة مصروف</span>
            <span className="sm:hidden">مصروف</span>
          </button>
          <button
            onClick={() => setShowRevenueModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">إضافة إيراد</span>
            <span className="sm:hidden">إيراد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المصروفات"
          value={`${stats.totalExpenses.toFixed(2)} ${currency}`}
          icon={ArrowDownCircle}
          color="fire-red"
        />
        <StatsCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenues.toFixed(2)} ${currency}`}
          icon={ArrowUpCircle}
          color="green-500"
        />
        <StatsCard
          title="صافي الدخل"
          value={`${stats.netIncome.toFixed(2)} ${currency}`}
          icon={TrendingUp}
          color={stats.netIncome >= 0 ? 'green-500' : 'fire-red'}
          trend={stats.totalRevenues > 0 ? parseFloat(((stats.netIncome / stats.totalRevenues) * 100).toFixed(1)) : 0}
        />
        <StatsCard
          title="متوسط المصروف"
          value={`${stats.avgExpense.toFixed(2)} ${currency}`}
          icon={DollarSign}
          color="orange-500"
        />
      </div>

      {/* Charts */}
      <ChartOverview expenses={expenses} revenues={revenues} />

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">المعاملات الأخيرة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-fire-red/20">
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">الفئة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-light-gray">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-light-gray/50">
                    لا توجد معاملات حديثة
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 dark:border-fire-red/10 hover:bg-gray-50 dark:hover:bg-fire-red/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.transactionType === 'expense' 
                          ? 'bg-fire-red/20 text-fire-red' 
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {transaction.transactionType === 'expense' ? 'مصروف' : 'إيراد'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${
                      transaction.transactionType === 'expense' ? 'text-fire-red' : 'text-green-500'
                    }`}>
                      {transaction.transactionType === 'expense' ? '-' : '+'} {transaction.amount?.toFixed(2)} {currency}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-light-gray">{transaction.category}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-light-gray/70">
                      {format(new Date(transaction.date), 'yyyy-MM-dd')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modals */}
      {showExpenseModal && (
        <AddTransactionModal
          type="expense"
          onClose={() => setShowExpenseModal(false)}
        />
      )}

      {showRevenueModal && (
        <AddTransactionModal
          type="revenue"
          onClose={() => setShowRevenueModal(false)}
        />
      )}
      </div>
    </>
  );
};

export default Dashboard;

