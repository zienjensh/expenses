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
import { saveToOfflineStorage, loadFromOfflineStorage, STORE_PROJECTS } from '../utils/offlineStorage';
import { logActivity } from '../utils/activityLogger';
import toast from 'react-hot-toast';

const ProjectsContext = createContext({});

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
};

export const ProjectsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const saveIntervalRef = useRef(null);

  // Fetch projects
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.uid)
    );

    // Load from offline storage first
    loadFromOfflineStorage(STORE_PROJECTS, currentUser.uid).then(offlineData => {
      if (offlineData.length > 0) {
        setProjects(offlineData);
        setLoading(false);
      }
    });

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        console.log('Projects snapshot received:', snapshot.docs.length, 'projects');
        const projectsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Project data:', { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt
          };
        }).sort((a, b) => {
          // Sort by createdAt (most recent first)
          if (a.createdAt && b.createdAt) {
            const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
            const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
            return bTime - aTime;
          }
          return 0;
        });
        console.log('Projects after sort:', projectsData);
        setProjects(projectsData);
        
        // Save to offline storage
        await saveToOfflineStorage(STORE_PROJECTS, projectsData, currentUser.uid);
        
        setLoading(false);
      }, 
      async (error) => {
        // Only log/show error if not a permissions error (user might not be fully authenticated)
        const isPermissionError = error.message?.includes('permissions') || 
                                   error.code?.includes('permission') ||
                                   error.code === 'permission-denied';
        
        if (!isPermissionError) {
          console.error('Error fetching projects:', error);
        }
        
        // Try to load from offline storage on error
        const offlineData = await loadFromOfflineStorage(STORE_PROJECTS, currentUser.uid);
        if (offlineData.length > 0) {
          setProjects(offlineData);
          // Only show toast if not a permissions error
          if (!isPermissionError) {
            toast('تم تحميل البيانات من التخزين المحلي', { icon: 'ℹ️' });
          }
        } else {
          // Only show error if not a permissions error
          if (!isPermissionError) {
            toast.error('حدث خطأ في تحميل المشاريع');
          }
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Auto-save to offline storage every 0.5 seconds
  useEffect(() => {
    if (!currentUser) return;

    saveIntervalRef.current = setInterval(async () => {
      if (projects.length > 0) {
        await saveToOfflineStorage(STORE_PROJECTS, projects, currentUser.uid);
      }
    }, 500); // Save every 0.5 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [projects, currentUser]);

  const addProject = async (projectData) => {
    try {
      // Check for duplicate project name
      const projectName = projectData.name?.trim();
      if (!projectName) {
        throw new Error('اسم المشروع مطلوب');
      }

      // Check if project with same name already exists
      const existingProjects = projects.filter(p => 
        p.name?.trim().toLowerCase() === projectName.toLowerCase()
      );

      if (existingProjects.length > 0) {
        toast.error('اسم المشروع موجود مسبقاً. يرجى اختيار اسم آخر');
        throw new Error('اسم المشروع موجود مسبقاً');
      }

      const projectToAdd = {
        ...projectData,
        name: projectName,
        userId: currentUser.uid,
        createdAt: Timestamp.now()
      };
      console.log('Adding project:', projectToAdd);
      const docRef = await addDoc(collection(db, 'projects'), projectToAdd);
      console.log('Project added with ID:', docRef.id);
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'add',
        'project',
        docRef.id,
        {
          description: projectName,
          budget: projectData.budget
        }
      );
      
      toast.success('تم إنشاء المشروع بنجاح');
      // Note: onSnapshot will automatically update the projects list
      return docRef.id;
    } catch (error) {
      console.error('Error adding project:', error);
      // Only show toast if it's not the duplicate name error (already shown)
      if (!error.message.includes('موجود مسبقاً')) {
        toast.error('فشل في إنشاء المشروع: ' + error.message);
      }
      throw error;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      // Check for duplicate project name (excluding current project)
      const projectName = projectData.name?.trim();
      if (!projectName) {
        throw new Error('اسم المشروع مطلوب');
      }

      // Check if another project with same name already exists
      const existingProjects = projects.filter(p => 
        p.id !== id && p.name?.trim().toLowerCase() === projectName.toLowerCase()
      );

      if (existingProjects.length > 0) {
        toast.error('اسم المشروع موجود مسبقاً. يرجى اختيار اسم آخر');
        throw new Error('اسم المشروع موجود مسبقاً');
      }

      await updateDoc(doc(db, 'projects', id), {
        ...projectData,
        name: projectName
      });
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'edit',
        'project',
        id,
        {
          description: projectName,
          budget: projectData.budget
        }
      );
      
      toast.success('تم تحديث المشروع بنجاح');
    } catch (error) {
      console.error('Error updating project:', error);
      // Only show toast if it's not the duplicate name error (already shown)
      if (!error.message.includes('موجود مسبقاً')) {
        toast.error('فشل في تحديث المشروع');
      }
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      // Get project name before deletion for logging
      const project = projects.find(p => p.id === id);
      
      await deleteDoc(doc(db, 'projects', id));
      
      // Log activity
      await logActivity(
        currentUser.uid,
        'delete',
        'project',
        id,
        { description: project?.name || 'مشروع' }
      );
      toast.success('تم حذف المشروع بنجاح');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('فشل في حذف المشروع');
      throw error;
    }
  };

  const value = {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

