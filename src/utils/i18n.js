import { ar } from '../translations/ar';
import { en } from '../translations/en';

export const translations = {
  ar,
  en
};

export const getTranslation = (language) => {
  return translations[language] || translations.ar;
};

