import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TransactionContext = createContext({});

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch expenses
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    // Use query without orderBy to avoid index requirement
    // We'll sort in JavaScript instead
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        // Sort by date if available (most recent first)
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        // Fallback to createdAt
        if (a.createdAt && b.createdAt) {
          const aTime = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime();
          const bTime = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });
      setExpenses(expensesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching expenses:', error);
      toast.error('حدث خطأ في تحميل المصروفات');
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch revenues
  useEffect(() => {
    if (!currentUser) {
      setRevenues([]);
      return;
    }

    // Use query without orderBy to avoid index requirement
    // We'll sort in JavaScript instead
    const q = query(
      collection(db, 'revenues'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revenuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        // Sort by date if available (most recent first)
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        // Fallback to createdAt
        if (a.createdAt && b.createdAt) {
          const aTime = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime();
          const bTime = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });
      setRevenues(revenuesData);
    }, (error) => {
      console.error('Error fetching revenues:', error);
      toast.error('حدث خطأ في تحميل الإيرادات');
    });

    return unsubscribe;
  }, [currentUser]);

  const addExpense = async (expenseData) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId: currentUser.uid,
        createdAt: Timestamp.now()
      });
      toast.success('تم إضافة المصروف بنجاح');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('فشل في إضافة المصروف');
      throw error;
    }
  };

  const addRevenue = async (revenueData) => {
    try {
      await addDoc(collection(db, 'revenues'), {
        ...revenueData,
        userId: currentUser.uid,
        createdAt: Timestamp.now()
      });
      toast.success('تم إضافة الإيراد بنجاح');
    } catch (error) {
      console.error('Error adding revenue:', error);
      toast.error('فشل في إضافة الإيراد');
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      await updateDoc(doc(db, 'expenses', id), expenseData);
      toast.success('تم تحديث المصروف بنجاح');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('فشل في تحديث المصروف');
      throw error;
    }
  };

  const updateRevenue = async (id, revenueData) => {
    try {
      await updateDoc(doc(db, 'revenues', id), revenueData);
      toast.success('تم تحديث الإيراد بنجاح');
    } catch (error) {
      console.error('Error updating revenue:', error);
      toast.error('فشل في تحديث الإيراد');
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('تم حذف المصروف بنجاح');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('فشل في حذف المصروف');
      throw error;
    }
  };

  const deleteRevenue = async (id) => {
    try {
      await deleteDoc(doc(db, 'revenues', id));
      toast.success('تم حذف الإيراد بنجاح');
    } catch (error) {
      console.error('Error deleting revenue:', error);
      toast.error('فشل في حذف الإيراد');
      throw error;
    }
  };

  const value = {
    expenses,
    revenues,
    loading,
    addExpense,
    addRevenue,
    updateExpense,
    updateRevenue,
    deleteExpense,
    deleteRevenue
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

