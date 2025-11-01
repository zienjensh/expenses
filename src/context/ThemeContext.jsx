import { createContext, useContext, useState, useEffect } from 'react';

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
    return savedCurrency || 'ر.س';
  });

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

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
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

