import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const [adminStatus, setAdminStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        setAdminStatus(false);
        setChecking(false);
        return;
      }

      try {
        const admin = await isAdmin();
        setAdminStatus(admin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminStatus(false);
      } finally {
        setChecking(false);
      }
    };

    if (!loading && currentUser) {
      checkAdminAccess();
    } else if (!loading && !currentUser) {
      setChecking(false);
      setAdminStatus(false);
    }
  }, [currentUser, loading, isAdmin]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-charcoal">
        <div className="text-fire-red text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!adminStatus) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;

