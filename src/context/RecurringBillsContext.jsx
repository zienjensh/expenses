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

const RecurringBillsContext = createContext({});

export const useRecurringBills = () => {
  const context = useContext(RecurringBillsContext);
  if (!context) {
    throw new Error('useRecurringBills must be used within RecurringBillsProvider');
  }
  return context;
};

export const RecurringBillsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recurring bills
  useEffect(() => {
    if (!currentUser) {
      setBills([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'recurringBills'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
        nextDueDate: doc.data().nextDueDate?.toMillis?.() || doc.data().nextDueDate,
        lastProcessed: doc.data().lastProcessed?.toMillis?.() || doc.data().lastProcessed
      })).sort((a, b) => {
        if (a.nextDueDate && b.nextDueDate) {
          const aTime = typeof a.nextDueDate === 'number' ? a.nextDueDate : new Date(a.nextDueDate).getTime();
          const bTime = typeof b.nextDueDate === 'number' ? b.nextDueDate : new Date(b.nextDueDate).getTime();
          return aTime - bTime;
        }
        return 0;
      });
      setBills(billsData);
      setLoading(false);
    }, (error) => {
      // Only log/show error if not a permissions error
      if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
        console.error('Error fetching recurring bills:', error);
        toast.error('حدث خطأ في تحميل الفواتير المتكررة');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Calculate next due date based on frequency
  const calculateNextDueDate = (lastDate, frequency) => {
    const date = lastDate ? new Date(lastDate) : new Date();
    const nextDate = new Date(date);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  };

  // Check for due bills and send reminders
  useEffect(() => {
    if (!currentUser || !bills.length) return;

    const now = new Date();
    bills.forEach(bill => {
      if (!bill.nextDueDate) return;
      
      const dueDate = new Date(bill.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      const reminderDays = bill.reminderDays || 3;
      
      // Send reminder if within reminder days
      if (daysUntilDue <= reminderDays && daysUntilDue >= 0 && !bill.reminderSent) {
        toast(`تذكير: فاتورة ${bill.name} مستحقة في ${daysUntilDue} ${daysUntilDue === 1 ? 'يوم' : 'أيام'}`, { icon: '⏰' });
        // You might want to update the bill to mark reminder as sent
      }
      
      // Auto-process if enabled and due
      if (bill.autoProcess && daysUntilDue <= 0 && !bill.lastProcessed) {
        processBill(bill.id);
      }
    });
  }, [bills, currentUser]);

  const addRecurringBill = async (billData) => {
    try {
      const nextDueDate = billData.nextDueDate 
        ? new Date(billData.nextDueDate)
        : calculateNextDueDate(null, billData.frequency);
      
      const docRef = await addDoc(collection(db, 'recurringBills'), {
        ...billData,
        userId: currentUser.uid,
        nextDueDate: Timestamp.fromDate(nextDueDate),
        createdAt: Timestamp.now(),
        autoProcess: billData.autoProcess || false,
        reminderDays: billData.reminderDays || 3,
      });
      
      toast.success('تم إضافة الفاتورة المتكررة بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding recurring bill:', error);
      toast.error('فشل في إضافة الفاتورة المتكررة');
      throw error;
    }
  };

  const updateRecurringBill = async (id, billData) => {
    try {
      const updateData = { ...billData };
      if (billData.nextDueDate) {
        updateData.nextDueDate = Timestamp.fromDate(new Date(billData.nextDueDate));
      }
      await updateDoc(doc(db, 'recurringBills', id), updateData);
      toast.success('تم تحديث الفاتورة المتكررة بنجاح');
    } catch (error) {
      console.error('Error updating recurring bill:', error);
      toast.error('فشل في تحديث الفاتورة المتكررة');
      throw error;
    }
  };

  const deleteRecurringBill = async (id) => {
    try {
      await deleteDoc(doc(db, 'recurringBills', id));
      toast.success('تم حذف الفاتورة المتكررة بنجاح');
    } catch (error) {
      console.error('Error deleting recurring bill:', error);
      toast.error('فشل في حذف الفاتورة المتكررة');
      throw error;
    }
  };

  const processBill = async (id) => {
    try {
      const bill = bills.find(b => b.id === id);
      if (!bill) throw new Error('Bill not found');
      
      // Note: addExpense should be called from a component that has access to useTransactions
      // For now, we'll just update the bill status
      // You can integrate this with TransactionContext in the component that uses this function
      
      // Update next due date
      const nextDueDate = calculateNextDueDate(bill.nextDueDate, bill.frequency);
      await updateDoc(doc(db, 'recurringBills', id), {
        lastProcessed: Timestamp.now(),
        nextDueDate: Timestamp.fromDate(nextDueDate),
      });
      
      toast.success(`تم معالجة الفاتورة ${bill.name} بنجاح`);
      return { bill, nextDueDate }; // Return bill data so component can add expense
    } catch (error) {
      console.error('Error processing bill:', error);
      toast.error('فشل في معالجة الفاتورة');
      throw error;
    }
  };

  const value = {
    bills,
    loading,
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    processBill,
    calculateNextDueDate,
  };

  return (
    <RecurringBillsContext.Provider value={value}>
      {children}
    </RecurringBillsContext.Provider>
  );
};

