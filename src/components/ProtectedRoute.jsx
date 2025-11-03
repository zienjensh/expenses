import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MaintenanceMode from './MaintenanceMode';
import AccountDisabledModal from './AccountDisabledModal';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, userData, isAdmin } = useAuth();
  const [adminStatus, setAdminStatus] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser && !loading) {
        try {
          const admin = await isAdmin();
          setAdminStatus(admin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setAdminStatus(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else if (!currentUser && !loading) {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, loading, isAdmin]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-charcoal">
        <div className="text-fire-red text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if account is disabled (isActive === false)
  // Admins can always access even if their account is disabled
  const isAccountDisabled = userData?.isActive === false && !adminStatus;

  // If account is disabled and user is not admin, show disabled modal and block all access
  if (isAccountDisabled) {
    return (
      <>
        <div className="fixed inset-0 bg-black/90 z-[9998] pointer-events-auto" />
        <AccountDisabledModal />
      </>
    );
  }

  return (
    <MaintenanceMode>
      {children}
    </MaintenanceMode>
  );
};

export default ProtectedRoute;

