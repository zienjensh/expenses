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
import { useTransactions } from './TransactionContext';
import toast from 'react-hot-toast';

const BudgetContext = createContext({});

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { expenses } = useTransactions();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch budgets
  useEffect(() => {
    if (!currentUser) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt
      })).sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
          const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });
      setBudgets(budgetsData);
      setLoading(false);
    }, (error) => {
      // Only log/show error if not a permissions error
      if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
        console.error('Error fetching budgets:', error);
        toast.error('حدث خطأ في تحميل الميزانيات');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Calculate budget spending
  const calculateBudgetSpending = (budget) => {
    if (!budget || !expenses) return { spent: 0, remaining: budget?.amount || 0, percentage: 0 };
    
    const now = new Date();
    const budgetStart = budget.startDate ? new Date(budget.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const budgetEnd = budget.endDate ? new Date(budget.endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= budgetStart && expenseDate <= budgetEnd &&
             (!budget.category || expense.category === budget.category);
    });
    
    const spent = relevantExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const remaining = Math.max(0, (budget.amount || 0) - spent);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return { spent, remaining, percentage };
  };

  // Check budget alerts
  useEffect(() => {
    if (!currentUser || !budgets.length) return;

    budgets.forEach(budget => {
      if (!budget.enableAlerts) return;
      
      const { percentage } = calculateBudgetSpending(budget);
      const threshold = budget.alertThreshold || 80;
      
      if (percentage >= threshold && percentage < 100 && !budget.alertShown) {
        toast.warning(`تحذير: تم استهلاك ${percentage.toFixed(1)}% من ميزانية ${budget.name}`);
        // Mark alert as shown (you might want to store this in Firestore)
      }
      
      if (percentage >= 100 && !budget.exceededAlertShown) {
        toast.error(`تم تجاوز ميزانية ${budget.name}!`);
        // Mark exceeded alert as shown
      }
    });
  }, [budgets, expenses, currentUser]);

  const addBudget = async (budgetData) => {
    try {
      const now = new Date();
      let startDate, endDate;
      
      if (budgetData.period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (budgetData.period === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }
      
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budgetData,
        userId: currentUser.uid,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        createdAt: Timestamp.now(),
        enableAlerts: budgetData.enableAlerts || false,
        alertThreshold: budgetData.alertThreshold || 80,
      });
      
      toast.success('تم إضافة الميزانية بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('فشل في إضافة الميزانية');
      throw error;
    }
  };

  const updateBudget = async (id, budgetData) => {
    try {
      await updateDoc(doc(db, 'budgets', id), budgetData);
      toast.success('تم تحديث الميزانية بنجاح');
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('فشل في تحديث الميزانية');
      throw error;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
      toast.success('تم حذف الميزانية بنجاح');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('فشل في حذف الميزانية');
      throw error;
    }
  };

  const value = {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    calculateBudgetSpending,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

