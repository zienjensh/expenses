import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { theme } = useTheme();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-20 left-0 right-0 z-[10000] px-4 py-3 ${
      theme === 'dark'
        ? 'bg-fire-red/90 text-white'
        : 'bg-fire-red text-white'
    } flex items-center justify-center gap-2 animate-fadeIn`}>
      <WifiOff size={20} />
      <span className="text-sm font-semibold">أنت غير متصل بالإنترنت - التطبيق يعمل في الوضع Offline</span>
    </div>
  );
};

export default OfflineIndicator;

