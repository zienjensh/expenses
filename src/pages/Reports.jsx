import { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Calendar, FileSpreadsheet, File, X } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportReports';
import toast from 'react-hot-toast';

const Reports = () => {
  const { expenses, revenues } = useTransactions();
  const { currency, theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [timeRange, setTimeRange] = useState('month');
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [exportType, setExportType] = useState(null); // 'csv' | 'excel' | 'pdf'

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

  const handleExportClick = (type) => {
    setExportType(type);
    const defaultName = language === 'ar' ? 'تقرير-مالي' : 'financial-report';
    setFileName(defaultName);
    setShowFileNameModal(true);
  };

  const handleConfirmExport = async () => {
    if (!fileName.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم الملف' : 'Please enter a file name');
      return;
    }

    // Sanitize filename
    const sanitizedFileName = fileName.trim().replace(/[<>:"/\\|?*]/g, '');
    const dateStr = new Date().toISOString().split('T')[0];
    
    let finalFileName;
    if (exportType === 'csv') {
      finalFileName = `${sanitizedFileName}-${dateStr}.csv`;
    } else if (exportType === 'excel') {
      finalFileName = `${sanitizedFileName}-${dateStr}.xlsx`;
    } else if (exportType === 'pdf') {
      finalFileName = `${sanitizedFileName}-${dateStr}.pdf`;
    }

    setShowFileNameModal(false);

    try {
      if (exportType === 'csv') {
        exportToCSV(expenses, revenues, t, currency, language, summary, finalFileName);
        toast.success(language === 'ar' ? 'تم تصدير الملف بنجاح' : 'File exported successfully');
      } else if (exportType === 'excel') {
        await exportToExcel(expenses, revenues, t, currency, language, summary, finalFileName);
        toast.success(language === 'ar' ? 'تم تصدير الملف بنجاح' : 'File exported successfully');
      } else if (exportType === 'pdf') {
        toast.loading(language === 'ar' ? 'جاري تصدير PDF...' : 'Exporting PDF...', { id: 'export-pdf' });
        await exportToPDF(expenses, revenues, t, currency, language, summary, finalFileName);
        toast.success(language === 'ar' ? 'تم تصدير PDF بنجاح' : 'PDF exported successfully', { id: 'export-pdf' });
      }
    } catch (error) {
      console.error('Error exporting file:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التصدير' : 'Error exporting file');
    }
  };

  return (
    <>
      <SEO 
        title={`${t.reportsTitle} - ${t.appName}`}
        description={language === 'ar' ? 'احصل على تقارير مالية مفصلة وشاملة. تحليل المصروفات والإيرادات مع رسوم بيانية تفاعلية.' : 'Get detailed and comprehensive financial reports. Analyze expenses and revenues with interactive charts.'}
        keywords={language === 'ar' ? 'التقارير, تقارير مالية, تحليل مالي, إحصائيات' : 'reports, financial reports, financial analysis, statistics'}
      />
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.reportsTitle}</h1>
          <p className="text-gray-600 dark:text-light-gray/70">{t.reportsDescription}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExportClick('csv')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            title={t.exportCSV}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">{t.exportCSV}</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={() => handleExportClick('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            title={t.exportExcel}
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">{t.exportExcel}</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button
            onClick={() => handleExportClick('pdf')}
            className="flex items-center gap-2 px-4 py-2.5 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all shadow-lg hover:shadow-xl glow-red"
            title={t.exportPDF}
          >
            <File size={18} />
            <span className="hidden sm:inline">{t.exportPDF}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
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

      {/* File Name Modal */}
      {showFileNameModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFileNameModal(false);
            }
          }}
        >
          <div 
            className={`relative w-full max-w-md rounded-2xl border backdrop-blur-xl shadow-2xl animate-fadeIn ${
              theme === 'dark'
                ? 'bg-charcoal/95 border-fire-red/30'
                : 'bg-white/95 border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-fire-red/20' : 'border-gray-200'
            }`}>
              <div>
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.enterFileName}
                </h3>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
                }`}>
                  {t.fileName}
                </p>
              </div>
              <button
                onClick={() => setShowFileNameModal(false)}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-fire-red hover:bg-white/10'
                    : 'text-gray-500 hover:text-fire-red hover:bg-gray-100'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  {t.fileName}
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder={t.fileNamePlaceholder}
                  className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-fire-red focus:border-fire-red ${
                    theme === 'dark'
                      ? 'bg-white/5 border-fire-red/30 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmExport();
                    } else if (e.key === 'Escape') {
                      setShowFileNameModal(false);
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowFileNameModal(false)}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmExport}
                  className="flex-1 px-4 py-3 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all font-medium glow-red"
                >
                  {t.export}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reports;

