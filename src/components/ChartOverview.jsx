import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getTranslation } from '../utils/i18n';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChartOverview = ({ expenses, revenues }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = getTranslation(language);
  
  // Month names based on language
  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Default category for unknown
  const otherCategory = language === 'ar' ? 'أخرى' : 'Other';

  // Monthly data
  const monthlyData = useMemo(() => {
    const dataMap = {};
    
    [...expenses, ...revenues].forEach(transaction => {
      const date = new Date(transaction.date);
      const month = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
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
      const category = expense.category || otherCategory;
      categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#E50914', '#FF4444', '#FF6666', '#FF8888', '#FFAAAA', '#FFCCCC'];

  // Custom bar component with gradient and modern styling
  const CustomBar = (props) => {
    const { fill, x, y, width, height, payload } = props;
    const isRevenue = fill === '#22c55e' || fill?.includes('green');
    const gradientId = `gradient-${isRevenue ? 'revenue' : 'expense'}-${x}`;
    const glowId = `glow-${isRevenue ? 'revenue' : 'expense'}-${x}`;
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {isRevenue ? (
              <>
                <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                <stop offset="50%" stopColor="#16a34a" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#15803d" stopOpacity={0.8} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#E50914" stopOpacity={1} />
                <stop offset="50%" stopColor="#cc0812" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#a0060f" stopOpacity={0.8} />
              </>
            )}
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={`url(#${gradientId})`}
          rx={8}
          ry={8}
          filter={`url(#${glowId})`}
          className="bar-rect transition-all duration-300 cursor-pointer"
        />
        {/* Top highlight */}
        <rect
          x={x}
          y={y}
          width={width}
          height={Math.max(height * 0.15, 2)}
          fill="url(#gradient-top)"
          rx={8}
          ry={8}
          opacity={0.4}
        />
      </g>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl ${
          theme === 'dark'
            ? 'bg-charcoal/95 border-fire-red/40 text-white'
            : 'bg-white/95 border-gray-300 text-gray-900'
        }`}>
          <p className={`font-bold mb-2 text-lg ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-light-gray' : 'text-gray-600'
              }`}>
                {entry.name}:
              </span>
              <span className={`font-bold ${
                entry.dataKey === 'revenues' ? 'text-green-500' : 'text-fire-red'
              }`}>
                {entry.value?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Comparison Chart - Modern Design */}
      <div className={`relative bg-gradient-to-br ${
        theme === 'dark'
          ? 'from-charcoal/80 via-charcoal/60 to-charcoal/80 border-fire-red/30'
          : 'from-white via-gray-50/50 to-white border-gray-200'
      } rounded-2xl p-6 border backdrop-blur-xl shadow-xl overflow-hidden animate-fadeInUp`}>
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${
          theme === 'dark' ? 'bg-fire-red' : 'bg-fire-red/30'
        }`} />
        <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${
          theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
        }`} />
        
        {/* Header with icon */}
        <div className="relative flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-fire-red/20 border border-fire-red/30'
              : 'bg-fire-red/10 border border-fire-red/20'
          }`}>
            <svg className="w-5 h-5 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t.monthlyRevenuesExpenses}
          </h3>
        </div>

        {/* Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={monthlyData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              barGap={8}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="gradient-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#333' : '#e5e5e5'} 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke={theme === 'dark' ? '#888' : '#666'} 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme === 'dark' ? '#aaa' : '#666' }}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#888' : '#666'} 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme === 'dark' ? '#aaa' : '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px'
                }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ 
                    color: theme === 'dark' ? '#aaa' : '#666',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {value}
                  </span>
                )}
              />
              <Bar 
                dataKey="revenues" 
                name={t.revenuesCount}
                fill="#22c55e"
                shape={CustomBar}
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                name={t.expensesCount}
                fill="#E50914"
                shape={CustomBar}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution - Modern Design */}
      <div className={`relative bg-gradient-to-br ${
        theme === 'dark'
          ? 'from-charcoal/80 via-charcoal/60 to-charcoal/80 border-fire-red/30'
          : 'from-white via-gray-50/50 to-white border-gray-200'
      } rounded-2xl p-6 border backdrop-blur-xl shadow-xl overflow-hidden animate-fadeInUp`}>
        {/* Decorative background elements */}
        <div className={`absolute top-0 left-0 w-28 h-28 rounded-full blur-3xl opacity-20 ${
          theme === 'dark' ? 'bg-fire-red' : 'bg-fire-red/30'
        }`} />
        <div className={`absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10 ${
          theme === 'dark' ? 'bg-orange-500' : 'bg-orange-400'
        }`} />
        
        {/* Header with icon */}
        <div className="relative flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-fire-red/20 border border-fire-red/30'
              : 'bg-fire-red/10 border border-fire-red/20'
          }`}>
            <svg className="w-5 h-5 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t.expenseDistributionByCategory}
          </h3>
        </div>

        {categoryData.length > 0 ? (
          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <defs>
                  {categoryData.map((entry, index) => {
                    const color = COLORS[index % COLORS.length];
                    const gradientId = `pieGradient-${index}`;
                    return (
                      <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    );
                  })}
                  <filter id="pieGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (percent < 0.05) return null; // Hide labels for small slices
                    return `${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={110}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke={theme === 'dark' ? '#0E0E0E' : '#ffffff'}
                  strokeWidth={2}
                  paddingAngle={3}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index})`}
                      style={{
                        filter: 'url(#pieGlow)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {categoryData.map((entry, index) => {
                const color = COLORS[index % COLORS.length];
                const percentage = ((entry.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-charcoal/50 border border-fire-red/20' 
                        : 'bg-gray-100 border border-gray-200'
                    } transition-all duration-200 hover:scale-105 cursor-pointer`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                    }`}>
                      {entry.name}
                    </span>
                    <span className={`text-xs font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-center h-[320px] ${
            theme === 'dark' ? 'text-light-gray/50' : 'text-gray-500'
          }`}>
            {t.noDataToDisplay}
          </div>
        )}
      </div>

      {/* Trend Line Chart - Modern Design */}
      <div className={`relative bg-gradient-to-br ${
        theme === 'dark'
          ? 'from-charcoal/80 via-charcoal/60 to-charcoal/80 border-fire-red/30'
          : 'from-white via-gray-50/50 to-white border-gray-200'
      } rounded-2xl p-6 border backdrop-blur-xl shadow-xl overflow-hidden animate-fadeInUp lg:col-span-2`}>
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-15 ${
          theme === 'dark' ? 'bg-fire-red' : 'bg-fire-red/30'
        }`} />
        <div className={`absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-15 ${
          theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
        }`} />
        
        {/* Header with icon */}
        <div className="relative flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-fire-red/20 border border-fire-red/30'
              : 'bg-fire-red/10 border border-fire-red/20'
          }`}>
            <svg className="w-5 h-5 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t.revenueExpenseTrend}
          </h3>
        </div>

        {/* Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart 
              data={monthlyData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                {/* Gradient for revenues line area */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                {/* Gradient for expenses line area */}
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E50914" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E50914" stopOpacity={0} />
                </linearGradient>
                {/* Glow filter for lines */}
                <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#333' : '#e5e5e5'} 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke={theme === 'dark' ? '#888' : '#666'} 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme === 'dark' ? '#aaa' : '#666' }}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#888' : '#666'} 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme === 'dark' ? '#aaa' : '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px'
                }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ 
                    color: theme === 'dark' ? '#aaa' : '#666',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {value}
                  </span>
                )}
              />
              {/* Revenue line */}
              <Line 
                type="monotone" 
                dataKey="revenues" 
                stroke="#22c55e" 
                strokeWidth={3}
                name={t.revenuesCount}
                dot={{ 
                  fill: '#22c55e', 
                  r: 5, 
                  strokeWidth: 2, 
                  stroke: theme === 'dark' ? '#0E0E0E' : '#ffffff',
                  filter: 'url(#lineGlow)'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#22c55e',
                  stroke: theme === 'dark' ? '#0E0E0E' : '#ffffff',
                  strokeWidth: 2,
                  filter: 'url(#lineGlow)'
                }}
                filter="url(#lineGlow)"
                animationDuration={800}
              />
              {/* Expense line */}
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#E50914" 
                strokeWidth={3}
                name={t.expensesCount}
                dot={{ 
                  fill: '#E50914', 
                  r: 5, 
                  strokeWidth: 2, 
                  stroke: theme === 'dark' ? '#0E0E0E' : '#ffffff',
                  filter: 'url(#lineGlow)'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#E50914',
                  stroke: theme === 'dark' ? '#0E0E0E' : '#ffffff',
                  strokeWidth: 2,
                  filter: 'url(#lineGlow)'
                }}
                filter="url(#lineGlow)"
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartOverview;

