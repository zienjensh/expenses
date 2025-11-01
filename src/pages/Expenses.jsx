import { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import StatsCard from '../components/StatsCard';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import { ArrowDownCircle, DollarSign, Receipt, Plus } from 'lucide-react';

const Expenses = () => {
  const { expenses, deleteExpense, loading } = useTransactions();
  const { currency } = useTheme();
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
        <div className="text-fire-red text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">المصروفات</h1>
          <p className="text-gray-600 dark:text-light-gray/70">إدارة جميع مصروفاتك</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all glow-red"
        >
          <Plus size={20} />
          <span>إضافة مصروف</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="إجمالي المصروفات"
          value={`${stats.total.toFixed(2)} ${currency}`}
          icon={ArrowDownCircle}
          color="fire-red"
        />
        <StatsCard
          title="عدد المعاملات"
          value={stats.count}
          icon={Receipt}
          color="blue-500"
        />
        <StatsCard
          title="متوسط المصروف"
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
  );
};

export default Expenses;

