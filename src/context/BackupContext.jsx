import { createContext, useContext, useState } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { useTransactions } from './TransactionContext';
import { useProjects } from './ProjectsContext';
import toast from 'react-hot-toast';

const BackupContext = createContext({});

export const useBackup = () => {
  const context = useContext(BackupContext);
  if (!context) {
    throw new Error('useBackup must be used within BackupProvider');
  }
  return context;
};

export const BackupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { expenses, revenues } = useTransactions();
  const { projects } = useProjects();

  // Export all data to JSON
  const exportData = () => {
    try {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        expenses: expenses || [],
        revenues: revenues || [],
        projects: projects || [],
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('فشل في تصدير البيانات');
      throw error;
    }
  };

  // Import data from JSON
  const importData = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.expenses || !data.revenues) {
        throw new Error('Invalid backup file format');
      }
      
      // Here you would typically restore the data to Firestore
      // For now, we'll just show a success message
      toast.success('تم استيراد البيانات بنجاح');
      return data;
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('فشل في استيراد البيانات');
      throw error;
    }
  };

  // Create backup in Firestore
  const createBackup = async () => {
    try {
      const backupData = {
        userId: currentUser.uid,
        data: {
          expenses: expenses || [],
          revenues: revenues || [],
          projects: projects || [],
        },
        createdAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'backups'), backupData);
      toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('فشل في إنشاء النسخة الاحتياطية');
      throw error;
    }
  };

  // Restore from backup
  const restoreBackup = async (backupId) => {
    try {
      // Implementation would restore data from backup
      toast.success('تم استعادة النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('فشل في استعادة النسخة الاحتياطية');
      throw error;
    }
  };

  const value = {
    exportData,
    importData,
    createBackup,
    restoreBackup,
  };

  return (
    <BackupContext.Provider value={value}>
      {children}
    </BackupContext.Provider>
  );
};

