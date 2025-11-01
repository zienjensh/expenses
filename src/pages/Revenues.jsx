import { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import StatsCard from '../components/StatsCard';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import SEO from '../components/SEO';
import { ArrowUpCircle, DollarSign, Receipt, Plus } from 'lucide-react';

const Revenues = () => {
  const { revenues, deleteRevenue, loading } = useTransactions();
  const { currency } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => {
    const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const count = revenues.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [revenues]);

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
        title="الإيرادات - تتبع إيراداتك"
        description="سجل وتتبع جميع إيراداتك. أضف مصادر دخلك المختلفة واحصل على تقارير مفصلة."
        keywords="الإيرادات, تتبع الإيرادات, الدخل, مصادر الدخل"
      />
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">الإيرادات</h1>
          <p className="text-gray-600 dark:text-light-gray/70">إدارة جميع إيراداتك</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
        >
          <Plus size={20} />
          <span>إضافة إيراد</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="إجمالي الإيرادات"
          value={`${stats.total.toFixed(2)} ${currency}`}
          icon={ArrowUpCircle}
          color="green-500"
        />
        <StatsCard
          title="عدد المعاملات"
          value={stats.count}
          icon={Receipt}
          color="blue-500"
        />
        <StatsCard
          title="متوسط الإيراد"
          value={`${stats.avg.toFixed(2)} ${currency}`}
          icon={DollarSign}
          color="orange-500"
        />
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={revenues}
        type="revenue"
        onDelete={deleteRevenue}
        onUpdate={() => {}}
      />

      {showModal && (
        <AddTransactionModal
          type="revenue"
          onClose={() => setShowModal(false)}
        />
      )}
      </div>
    </>
  );
};

export default Revenues;

