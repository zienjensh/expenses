import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Folder,
  FileText, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/expenses', icon: ArrowDownCircle, label: 'المصروفات' },
    { path: '/revenues', icon: ArrowUpCircle, label: 'الإيرادات' },
    { path: '/projects', icon: Folder, label: 'المشاريع' },
    { path: '/reports', icon: FileText, label: 'التقارير' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <aside className="h-full w-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-fire-red mb-8">إدارة المصروفات</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-fire-red text-white glow-red' 
                    : 'text-gray-700 dark:text-light-gray hover:bg-fire-red/10 hover:text-fire-red'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

