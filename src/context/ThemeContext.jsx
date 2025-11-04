import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Map currency codes to symbols for display
const getCurrencySymbol = (code) => {
  const currencyMap = {
    'ر.س': 'ر.س',
    '$': '$',
    '€': '€',
    'GBP': 'ج.م',
    'د.إ': 'د.إ',
    '£': 'ج.م', // fallback for old saved values
    'جنيه': 'ج.م' // fallback for old saved values
  };
  return currencyMap[code] || code;
};

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    // Handle old values that might be "جنيه" or "£"
    if (savedCurrency === 'جنيه' || savedCurrency === '£') {
      return 'GBP';
    }
    return savedCurrency || 'GBP'; // Default to Egyptian Pound (جنيه مصري)
  });

  const [currencyLoading, setCurrencyLoading] = useState(true);

  // Load currency from Firestore when user logs in
  useEffect(() => {
    const loadUserCurrency = async () => {
      if (!currentUser) {
        // If no user, use localStorage as fallback
        const savedCurrency = localStorage.getItem('currency');
        if (savedCurrency === 'جنيه' || savedCurrency === '£') {
          setCurrency('GBP');
        } else if (savedCurrency) {
          setCurrency(savedCurrency);
        }
        setCurrencyLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.currency) {
            // Use currency from Firestore
            setCurrency(userData.currency);
            // Sync with localStorage as backup
            localStorage.setItem('currency', userData.currency);
          } else {
            // If no currency in Firestore, check localStorage and save to Firestore
            const savedCurrency = localStorage.getItem('currency');
            let currencyToUse = savedCurrency || 'GBP'; // Default to Egyptian Pound
            if (savedCurrency === 'جنيه' || savedCurrency === '£') {
              currencyToUse = 'GBP';
            }
            
            // Save to Firestore
            await updateDoc(userDocRef, { currency: currencyToUse });
            setCurrency(currencyToUse);
            localStorage.setItem('currency', currencyToUse);
          }
        } else {
          // User document doesn't exist, create it with default currency
          const savedCurrency = localStorage.getItem('currency');
          let currencyToUse = savedCurrency || 'GBP'; // Default to Egyptian Pound
          if (savedCurrency === 'جنيه' || savedCurrency === '£') {
            currencyToUse = 'GBP';
          }
          
          await setDoc(userDocRef, {
            userId: currentUser.uid,
            currency: currencyToUse,
            createdAt: new Date()
          });
          setCurrency(currencyToUse);
          localStorage.setItem('currency', currencyToUse);
        }
      } catch (error) {
        console.error('Error loading user currency:', error);
        // Fallback to localStorage on error
        const savedCurrency = localStorage.getItem('currency');
        if (savedCurrency === 'جنيه' || savedCurrency === '£') {
          setCurrency('GBP');
        } else if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } finally {
        setCurrencyLoading(false);
      }
    };

    loadUserCurrency();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0E0E0E';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F2F2F2';
    }
  }, [theme]);

  // Save currency to Firestore when it changes (only if user is logged in)
  useEffect(() => {
    if (!currentUser || currencyLoading) return;

    const saveCurrency = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, { currency });
        } else {
          await setDoc(userDocRef, {
            userId: currentUser.uid,
            currency,
            createdAt: new Date()
          });
        }
        // Also save to localStorage as backup
        localStorage.setItem('currency', currency);
      } catch (error) {
        console.error('Error saving currency to Firestore:', error);
        // Still save to localStorage as fallback
        localStorage.setItem('currency', currency);
      }
    };

    saveCurrency();
  }, [currency, currentUser, currencyLoading]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    // Firestore save will happen in useEffect above
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    currency: getCurrencySymbol(currency),
    currencyCode: currency,
    setCurrency: updateCurrency
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

