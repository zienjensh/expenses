import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-charcoal">
        <div className="text-fire-red text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

