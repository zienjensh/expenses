import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { logActivity } from '../utils/activityLogger';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // List of admin user IDs (can be modified based on your needs)
  // You can also set isAdmin: true in the user document in Firestore instead
  const ADMIN_USER_IDS = [
    'ikNkNLykEeUtXiecovWJSlVg2K33',
  ];

  // Check if current user is admin
  const checkIsAdmin = async () => {
    if (!currentUser) return false;
    
    try {
      // First check if user document has isAdmin field
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Check isAdmin field in user document
        if (userData.isAdmin === true) {
          return true;
        }
      }
      
      // Fallback: Check against hardcoded admin list
      if (ADMIN_USER_IDS.includes(currentUser.uid)) {
        return true;
      }
      
      // Fallback: Check by email (if needed)
      // if (ADMIN_EMAILS.includes(currentUser.email)) {
      //   return true;
      // }
      
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Check if username exists
  const checkUsernameExists = async (username) => {
    const usernameLower = username.toLowerCase().trim();
    
    try {
      // Try to get username document directly by ID first (faster and doesn't need index)
      const usernameDocRef = doc(db, 'usernames', usernameLower);
      const usernameDocSnap = await getDoc(usernameDocRef);
      
      if (usernameDocSnap.exists()) {
        return true;
      }

      // Fallback: query by username field (requires index)
      const q = query(collection(db, 'usernames'), where('username', '==', usernameLower));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const signup = async (username, email, password, displayName) => {
    // Validate username
    const usernameLower = username.toLowerCase().trim();
    
    if (!usernameLower || usernameLower.length < 3) {
      throw new Error('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameLower)) {
      throw new Error('اسم المستخدم يمكن أن يحتوي فقط على أحرف إنجليزية وأرقام وشرطة سفلية');
    }

    // Check if username already exists
    const usernameExists = await checkUsernameExists(usernameLower);
    if (usernameExists) {
      throw new Error('اسم المستخدم موجود مسبقاً');
    }

    // Create user with Firebase Auth (still uses email internally)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Save username mapping in Firestore
    await setDoc(doc(db, 'usernames', usernameLower), {
      username: usernameLower,
      email: email,
      userId: userCredential.user.uid,
      createdAt: new Date()
    });

    // Also save username in users collection
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      userId: userCredential.user.uid,
      username: usernameLower,
      email: email,
      displayName: displayName || '',
      createdAt: new Date()
    });

    return userCredential;
  };

  const login = async (username, password) => {
    const usernameLower = username.toLowerCase().trim();

    try {
      // Try to get username document directly by ID first (faster and doesn't need index)
      const usernameDocRef = doc(db, 'usernames', usernameLower);
      const usernameDocSnap = await getDoc(usernameDocRef);

      let email = null;

      if (usernameDocSnap.exists()) {
        // Found by document ID
        email = usernameDocSnap.data().email;
      } else {
        // Fallback: query by username field (requires index)
        const q = query(collection(db, 'usernames'), where('username', '==', usernameLower));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }

        email = querySnapshot.docs[0].data().email;
      }

      if (!email) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }

      // Login with email (Firebase Auth requires email)
      return signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Check if it's a permissions error
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        throw new Error('خطأ في الصلاحيات. يرجى التأكد من نشر قواعد Firestore الجديدة في Firebase Console.');
      }
      // Re-throw original error
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    let previousUserId = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Log login activity when user changes from null to a user
      if (user && !previousUserId) {
        try {
          await logActivity(
            user.uid,
            'login',
            'account',
            user.uid,
            { description: 'تسجيل الدخول إلى النظام' }
          );
        } catch (error) {
          console.error('Error logging login activity:', error);
        }
      }
      
      // Log logout activity when user changes from a user to null
      if (!user && previousUserId) {
        try {
          await logActivity(
            previousUserId,
            'logout',
            'account',
            previousUserId,
            { description: 'تسجيل الخروج من النظام' }
          );
        } catch (error) {
          console.error('Error logging logout activity:', error);
        }
      }
      
      previousUserId = user?.uid || null;
      setCurrentUser(user);
      
      // Fetch user data from Firestore if user is logged in
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          
          // Use onSnapshot for real-time updates
          const unsubscribeUserData = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                setUserData(docSnapshot.data());
              } else {
                setUserData(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error listening to user data:', error);
              // Fallback to getDoc if onSnapshot fails
              getDoc(userDocRef).then((userDocSnap) => {
                if (userDocSnap.exists()) {
                  setUserData(userDocSnap.data());
                } else {
                  setUserData(null);
                }
                setLoading(false);
              }).catch((err) => {
                console.error('Error fetching user data:', err);
                setLoading(false);
              });
            }
          );
          
          return () => {
            unsubscribeUserData();
          };
        } catch (error) {
          console.error('Error setting up user data listener:', error);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    loading,
    checkUsernameExists,
    isAdmin: checkIsAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

