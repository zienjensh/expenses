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

const GoalsContext = createContext({});

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within GoalsProvider');
  }
  return context;
};

export const GoalsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { revenues, expenses } = useTransactions();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch goals
  useEffect(() => {
    if (!currentUser) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'financialGoals'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
        targetDate: doc.data().targetDate?.toMillis?.() || doc.data().targetDate
      })).sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
          const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        return 0;
      });
      setGoals(goalsData);
      setLoading(false);
    }, (error) => {
      // Only log/show error if not a permissions error
      if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
        console.error('Error fetching goals:', error);
        toast.error('حدث خطأ في تحميل الأهداف');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Calculate goal progress
  const calculateGoalProgress = (goal) => {
    if (!goal) return { progress: 0, percentage: 0, monthlyContribution: 0, daysRemaining: 0 };
    
    const totalRevenues = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netSavings = totalRevenues - totalExpenses;
    
    const currentAmount = goal.currentAmount || 0;
    const targetAmount = goal.goalAmount || 0;
    const progress = currentAmount;
    const percentage = targetAmount > 0 ? (progress / targetAmount) * 100 : 0;
    
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    const now = new Date();
    const daysRemaining = targetDate ? Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24))) : 0;
    
    const monthsRemaining = daysRemaining / 30;
    const remainingAmount = Math.max(0, targetAmount - progress);
    const monthlyContribution = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
    
    return { progress, percentage, monthlyContribution, daysRemaining, remainingAmount };
  };

  // Check for achieved goals
  useEffect(() => {
    if (!currentUser || !goals.length) return;

    goals.forEach(goal => {
      const { percentage } = calculateGoalProgress(goal);
      
      if (percentage >= 100 && !goal.achieved) {
        toast.success(`تهانينا! تم تحقيق الهدف: ${goal.name}`);
        // You might want to update the goal in Firestore to mark it as achieved
      }
    });
  }, [goals, revenues, expenses, currentUser]);

  const addGoal = async (goalData) => {
    try {
      const docRef = await addDoc(collection(db, 'financialGoals'), {
        ...goalData,
        userId: currentUser.uid,
        currentAmount: goalData.currentAmount || 0,
        targetDate: goalData.targetDate ? Timestamp.fromDate(new Date(goalData.targetDate)) : null,
        createdAt: Timestamp.now(),
        achieved: false,
      });
      
      toast.success('تم إضافة الهدف بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('فشل في إضافة الهدف');
      throw error;
    }
  };

  const updateGoal = async (id, goalData) => {
    try {
      const updateData = { ...goalData };
      if (goalData.targetDate) {
        updateData.targetDate = Timestamp.fromDate(new Date(goalData.targetDate));
      }
      await updateDoc(doc(db, 'financialGoals', id), updateData);
      toast.success('تم تحديث الهدف بنجاح');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('فشل في تحديث الهدف');
      throw error;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await deleteDoc(doc(db, 'financialGoals', id));
      toast.success('تم حذف الهدف بنجاح');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('فشل في حذف الهدف');
      throw error;
    }
  };

  const addContribution = async (id, amount) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');
      
      const newAmount = (goal.currentAmount || 0) + amount;
      await updateDoc(doc(db, 'financialGoals', id), {
        currentAmount: newAmount,
        achieved: newAmount >= goal.goalAmount,
      });
      
      toast.success('تم إضافة المساهمة بنجاح');
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('فشل في إضافة المساهمة');
      throw error;
    }
  };

  const value = {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    calculateGoalProgress,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

