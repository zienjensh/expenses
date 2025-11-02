import { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Calendar } from 'lucide-react';

const Reports = () => {
  const { expenses, revenues } = useTransactions();
  const { currency } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [timeRange, setTimeRange] = useState('month');

  const COLORS = ['#E50914', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Month names based on language
  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Default category
  const otherCategory = language === 'ar' ? 'أخرى' : 'Other';

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    const dataMap = {};
    
    [...expenses, ...revenues].forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!dataMap[monthKey]) {
        dataMap[monthKey] = { month: monthName, expenses: 0, revenues: 0, net: 0 };
      }
      
      if (expenses.some(e => e.id === transaction.id)) {
        dataMap[monthKey].expenses += transaction.amount || 0;
      } else {
        dataMap[monthKey].revenues += transaction.amount || 0;
      }
      dataMap[monthKey].net = dataMap[monthKey].revenues - dataMap[monthKey].expenses;
    });

    return Object.values(dataMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [expenses, revenues]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const expenseMap = {};
    const revenueMap = {};
    
    expenses.forEach(expense => {
      const cat = expense.category || otherCategory;
      expenseMap[cat] = (expenseMap[cat] || 0) + (expense.amount || 0);
    });
    
    revenues.forEach(revenue => {
      const cat = revenue.category || otherCategory;
      revenueMap[cat] = (revenueMap[cat] || 0) + (revenue.amount || 0);
    });

    return {
      expenses: Object.entries(expenseMap).map(([name, value]) => ({ name, value })),
      revenues: Object.entries(revenueMap).map(([name, value]) => ({ name, value }))
    };
  }, [expenses, revenues]);

  // Summary stats
  const summary = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalRevenues = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const net = totalRevenues - totalExpenses;
    const expenseRatio = totalRevenues > 0 ? (totalExpenses / totalRevenues) * 100 : 0;
    
    return { totalExpenses, totalRevenues, net, expenseRatio };
  }, [expenses, revenues]);

  const handleExportCSV = () => {
    const csvData = [
      [t.type, t.amount, t.category, t.description, t.date],
      ...expenses.map(e => [t.expenseTransaction, e.amount, e.category, e.description || '', e.date]),
      ...revenues.map(r => [t.revenueTransaction, r.amount, r.category, r.description || '', r.date])
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <>
      <SEO 
        title={`${t.reportsTitle} - ${t.appName}`}
        description={language === 'ar' ? 'احصل على تقارير مالية مفصلة وشاملة. تحليل المصروفات والإيرادات مع رسوم بيانية تفاعلية.' : 'Get detailed and comprehensive financial reports. Analyze expenses and revenues with interactive charts.'}
        keywords={language === 'ar' ? 'التقارير, تقارير مالية, تحليل مالي, إحصائيات' : 'reports, financial reports, financial analysis, statistics'}
      />
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.reportsTitle}</h1>
          <p className="text-gray-600 dark:text-light-gray/70">{t.reportsDescription}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all glow-red"
        >
          <Download size={20} />
          <span>{t.exportCSV}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <p className="text-gray-600 dark:text-light-gray/70 mb-2">{t.totalExpenses}</p>
          <p className="text-2xl font-bold text-fire-red">{summary.totalExpenses.toFixed(2)} {currency}</p>
        </div>
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <p className="text-gray-600 dark:text-light-gray/70 mb-2">{t.totalRevenues}</p>
          <p className="text-2xl font-bold text-green-500">{summary.totalRevenues.toFixed(2)} {currency}</p>
        </div>
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <p className="text-gray-600 dark:text-light-gray/70 mb-2">{t.netIncome}</p>
          <p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-500' : 'text-fire-red'}`}>
            {summary.net.toFixed(2)} {currency}
          </p>
        </div>
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <p className="text-gray-600 dark:text-light-gray/70 mb-2">{t.expenseRatio}</p>
          <p className="text-2xl font-bold text-orange-500">{summary.expenseRatio.toFixed(1)}%</p>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.monthlyComparison}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#F2F2F2" fontSize={12} />
            <YAxis stroke="#F2F2F2" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #E50914',
                borderRadius: '8px',
                color: '#F2F2F2'
              }}
            />
            <Legend />
            <Bar dataKey="revenues" fill="#22c55e" name={t.revenuesCount} />
            <Bar dataKey="expenses" fill="#E50914" name={t.expensesCount} />
            <Bar dataKey="net" fill="#3b82f6" name={t.netIncomeLabel} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.expenseDistribution}</h2>
          {categoryBreakdown.expenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown.expenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #E50914',
                    borderRadius: '8px',
                    color: '#F2F2F2'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-600 dark:text-light-gray/50">
              لا توجد بيانات
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.revenueDistribution}</h2>
          {categoryBreakdown.revenues.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown.revenues}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.revenues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #E50914',
                    borderRadius: '8px',
                    color: '#F2F2F2'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-600 dark:text-light-gray/50">
              لا توجد بيانات
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.financialPerformanceTrend}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#F2F2F2" fontSize={12} />
            <YAxis stroke="#F2F2F2" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #E50914',
                borderRadius: '8px',
                color: '#F2F2F2'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenues" stroke="#22c55e" strokeWidth={3} name={t.revenuesCount} />
            <Line type="monotone" dataKey="expenses" stroke="#E50914" strokeWidth={3} name={t.expensesCount} />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name={t.netIncomeLabel} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>
    </>
  );
};

export default Reports;

