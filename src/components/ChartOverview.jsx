import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChartOverview = ({ expenses, revenues }) => {
  // Monthly data
  const monthlyData = useMemo(() => {
    const dataMap = {};
    
    [...expenses, ...revenues].forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('ar', { month: 'long', year: 'numeric' });
      if (!dataMap[month]) {
        dataMap[month] = { month, expenses: 0, revenues: 0 };
      }
      if (expenses.some(e => e.id === transaction.id)) {
        dataMap[month].expenses += transaction.amount || 0;
      } else {
        dataMap[month].revenues += transaction.amount || 0;
      }
    });

    return Object.values(dataMap).slice(-6).reverse();
  }, [expenses, revenues]);

  // Category data
  const categoryData = useMemo(() => {
    const categoryMap = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'أخرى';
      categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#E50914', '#FF4444', '#FF6666', '#FF8888', '#FFAAAA', '#FFCCCC'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Comparison Chart */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الإيرادات والمصروفات الشهرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
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
            <Bar dataKey="revenues" fill="#22c55e" name="الإيرادات" />
            <Bar dataKey="expenses" fill="#E50914" name="المصروفات" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">توزيع المصروفات حسب الفئة</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-light-gray/50">
            لا توجد بيانات لعرضها
          </div>
        )}
      </div>

      {/* Trend Line Chart */}
      <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20 lg:col-span-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">اتجاه الإيرادات والمصروفات</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
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
            <Line type="monotone" dataKey="revenues" stroke="#22c55e" strokeWidth={2} name="الإيرادات" />
            <Line type="monotone" dataKey="expenses" stroke="#E50914" strokeWidth={2} name="المصروفات" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartOverview;

