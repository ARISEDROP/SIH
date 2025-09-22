import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../lib/translations';

export const useTranslation = () => {
  const { language } = useAppContext();

  const t = useCallback((key: string): any => {
    const keys = key.split('.');
    
    const findValue = (lang: string) => {
        let result: any = translations[lang];
        for (const k of keys) {
            if (result === undefined) return undefined;
            result = result[k];
        }
        return result;
    };

    let value = findValue(language);
    if (value === undefined) {
        value = findValue('en-US');
    }
    
    return value === undefined ? key : value;
  }, [language]);

  const t_html = (key: string, replacements: {[key: string]: string} = {}) => {
    let raw_string = t(key);
    for(const r in replacements) {
      raw_string = raw_string.replaceAll(`{${r}}`, replacements[r]);
    }
    return raw_string;
  }

  return { t, t_html };
};
