import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
import { saveToOfflineStorage, loadFromOfflineStorage, STORE_EXPENSES, STORE_REVENUES } from '../utils/offlineStorage';
import { logActivity } from '../utils/activityLogger';
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
  const saveIntervalRef = useRef(null);

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

    // Load from offline storage first
    loadFromOfflineStorage(STORE_EXPENSES, currentUser.uid).then(offlineData => {
      if (offlineData.length > 0) {
        setExpenses(offlineData);
        setLoading(false);
      }
    });

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const expensesData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to plain object for offline storage
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt
        };
      }).sort((a, b) => {
        // Sort by date if available (most recent first)
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        // Fallback to createdAt
        if (a.createdAt && b.createdAt) {
          const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
          const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });
      setExpenses(expensesData);
      
      // Save to offline storage
      await saveToOfflineStorage(STORE_EXPENSES, expensesData, currentUser.uid);
      
      setLoading(false);
    }, async (error) => {
      console.error('Error fetching expenses:', error);
      
      // Try to load from offline storage on error
      const offlineData = await loadFromOfflineStorage(STORE_EXPENSES, currentUser.uid);
      if (offlineData.length > 0) {
        setExpenses(offlineData);
        // Only show toast if not a permissions error (user might not be logged in properly)
        if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
          toast('تم تحميل البيانات من التخزين المحلي', { icon: 'ℹ️' });
        }
      } else {
        // Only show error if not a permissions error
        if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
          toast.error('حدث خطأ في تحميل المصروفات');
        }
      }
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

    // Load from offline storage first
    loadFromOfflineStorage(STORE_REVENUES, currentUser.uid).then(offlineData => {
      if (offlineData.length > 0 && revenues.length === 0) {
        setRevenues(offlineData);
      }
    });

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const revenuesData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to plain object for offline storage
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt
        };
      }).sort((a, b) => {
        // Sort by date if available (most recent first)
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        // Fallback to createdAt
        if (a.createdAt && b.createdAt) {
          const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
          const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });
      setRevenues(revenuesData);
      
      // Save to offline storage
      await saveToOfflineStorage(STORE_REVENUES, revenuesData, currentUser.uid);
    }, async (error) => {
      console.error('Error fetching revenues:', error);
      
      // Try to load from offline storage on error
      const offlineData = await loadFromOfflineStorage(STORE_REVENUES, currentUser.uid);
      if (offlineData.length > 0) {
        setRevenues(offlineData);
        // Only show toast if not a permissions error (user might not be logged in properly)
        if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
          toast('تم تحميل البيانات من التخزين المحلي', { icon: 'ℹ️' });
        }
      } else {
        // Only show error if not a permissions error
        if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
          toast.error('حدث خطأ في تحميل الإيرادات');
        }
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Auto-save to offline storage every 0.5 seconds
  useEffect(() => {
    if (!currentUser) return;

    saveIntervalRef.current = setInterval(async () => {
      if (expenses.length > 0) {
        await saveToOfflineStorage(STORE_EXPENSES, expenses, currentUser.uid);
      }
      if (revenues.length > 0) {
        await saveToOfflineStorage(STORE_REVENUES, revenues, currentUser.uid);
      }
    }, 500); // Save every 0.5 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [expenses, revenues, currentUser]);

  const addExpense = async (expenseData) => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        // projectId is optional, can be undefined if not associated with a project
      });
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'add',
        'expense',
        docRef.id,
        {
          description: expenseData.description || 'مصروف بدون وصف',
          amount: expenseData.amount,
          category: expenseData.category
        }
      );
      
      toast.success('تم إضافة المصروف بنجاح');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('فشل في إضافة المصروف');
      throw error;
    }
  };

  const addRevenue = async (revenueData) => {
    try {
      const docRef = await addDoc(collection(db, 'revenues'), {
        ...revenueData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        // projectId is optional, can be undefined if not associated with a project
      });
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'add',
        'revenue',
        docRef.id,
        {
          description: revenueData.description || 'إيراد بدون وصف',
          amount: revenueData.amount,
          category: revenueData.category
        }
      );
      
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
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'edit',
        'expense',
        id,
        {
          description: expenseData.description || 'مصروف بدون وصف',
          amount: expenseData.amount,
          category: expenseData.category
        }
      );
      
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
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'edit',
        'revenue',
        id,
        {
          description: revenueData.description || 'إيراد بدون وصف',
          amount: revenueData.amount,
          category: revenueData.category
        }
      );
      
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
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'delete',
        'expense',
        id,
        { description: 'تم حذف المصروف' }
      );
      
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
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'delete',
        'revenue',
        id,
        { description: 'تم حذف الإيراد' }
      );
      
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

