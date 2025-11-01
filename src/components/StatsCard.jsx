const StatsCard = ({ title, value, icon: Icon, trend, color = 'fire-red' }) => {
  const colorClasses = {
    'fire-red': 'bg-fire-red/20 text-fire-red',
    'green-500': 'bg-green-500/20 text-green-500',
    'blue-500': 'bg-blue-500/20 text-blue-500',
    'orange-500': 'bg-orange-500/20 text-orange-500',
  };

  const iconClass = colorClasses[color] || colorClasses['fire-red'];

  return (
    <div className="bg-white dark:bg-charcoal/50 rounded-xl p-6 border border-gray-200 dark:border-fire-red/20 hover:border-fire-red/40 transition-all duration-300 glow-red hover:glow-red animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconClass}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-fire-red'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-600 dark:text-light-gray/70 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

export default StatsCard;

