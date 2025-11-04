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

const CustomCategoriesContext = createContext({});

export const useCustomCategories = () => {
  const context = useContext(CustomCategoriesContext);
  if (!context) {
    throw new Error('useCustomCategories must be used within CustomCategoriesProvider');
  }
  return context;
};

export const CustomCategoriesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { expenses, revenues } = useTransactions();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default categories
  const defaultCategories = [
    { name: 'طعام', icon: '🍔', color: '#FF6B6B' },
    { name: 'مواصلات', icon: '🚗', color: '#4ECDC4' },
    { name: 'تسوق', icon: '🛒', color: '#45B7D1' },
    { name: 'صحة', icon: '🏥', color: '#96CEB4' },
    { name: 'ترفيه', icon: '🎬', color: '#FFEAA7' },
    { name: 'فواتير', icon: '💡', color: '#DDA15E' },
    { name: 'تعليم', icon: '📚', color: '#9B59B6' },
    { name: 'أخرى', icon: '📦', color: '#95A5A6' },
  ];

  // Fetch custom categories
  useEffect(() => {
    if (!currentUser) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'customCategories'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt
      }));
      setCategories(categoriesData);
      setLoading(false);
    }, (error) => {
      // Only log/show error if not a permissions error
      if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
        console.error('Error fetching custom categories:', error);
        toast.error('حدث خطأ في تحميل الفئات المخصصة');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Get all categories (default + custom)
  const getAllCategories = () => {
    const customCategoriesMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat;
      return acc;
    }, {});
    
    return defaultCategories.map(cat => ({
      ...cat,
      ...customCategoriesMap[cat.name],
      isDefault: true,
    })).concat(
      categories.filter(cat => !defaultCategories.find(dc => dc.name === cat.name))
    );
  };

  // Get category statistics
  const getCategoryStatistics = (categoryName) => {
    const categoryExpenses = expenses.filter(e => e.category === categoryName);
    const categoryRevenues = revenues.filter(r => r.category === categoryName);
    
    const totalExpenses = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalRevenues = categoryRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const transactionCount = categoryExpenses.length + categoryRevenues.length;
    
    return {
      totalExpenses,
      totalRevenues,
      transactionCount,
      netAmount: totalRevenues - totalExpenses,
    };
  };

  const addCategory = async (categoryData) => {
    try {
      const docRef = await addDoc(collection(db, 'customCategories'), {
        ...categoryData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
      });
      
      toast.success('تم إضافة الفئة بنجاح');
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('فشل في إضافة الفئة');
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      await updateDoc(doc(db, 'customCategories', id), categoryData);
      toast.success('تم تحديث الفئة بنجاح');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('فشل في تحديث الفئة');
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'customCategories', id));
      toast.success('تم حذف الفئة بنجاح');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('فشل في حذف الفئة');
      throw error;
    }
  };

  const value = {
    categories,
    defaultCategories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getCategoryStatistics,
  };

  return (
    <CustomCategoriesContext.Provider value={value}>
      {children}
    </CustomCategoriesContext.Provider>
  );
};

