import { SymptomReport, Tip } from './constants';

const OFFLINE_REPORTS_KEY = 'offlineSymptomReports';
const ALL_REPORTS_KEY = 'symptomReports';
const TIPS_KEY = 'quickActionTips';

/**
 * A generic utility to save data to localStorage.
 * @param key The storage key.
 * @param data The data to save.
 */
const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage with key "${key}"`, e);
  }
};

/**
 * A generic utility to load data from localStorage.
 * @param key The storage key.
 * @param defaultValue A default value to return if the key is not found or parsing fails.
 * @returns The parsed data or the default value.
 */
const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to load from localStorage with key "${key}"`, e);
    return defaultValue;
  }
};

// --- Symptom Reports Management ---

export const getStoredSymptomReports = (initialData: SymptomReport[]): SymptomReport[] => {
  return loadFromLocalStorage<SymptomReport[]>(ALL_REPORTS_KEY, initialData);
};

export const saveSymptomReports = (reports: SymptomReport[]): void => {
  saveToLocalStorage(ALL_REPORTS_KEY, reports);
};

// --- Offline Queue Management ---

export const getOfflineQueue = (): SymptomReport[] => {
  return loadFromLocalStorage<SymptomReport[]>(OFFLINE_REPORTS_KEY, []);
};

export const addToOfflineQueue = (report: SymptomReport): void => {
  const queue = getOfflineQueue();
  queue.push(report);
  saveToLocalStorage(OFFLINE_REPORTS_KEY, queue);
};

export const clearOfflineQueue = (): void => {
  localStorage.removeItem(OFFLINE_REPORTS_KEY);
};

// --- Tips Management ---

export const getStoredTips = (initialData: Tip[]): Tip[] => {
  return loadFromLocalStorage<Tip[]>(TIPS_KEY, initialData);
}

export const saveTips = (tips: Tip[]): void => {
  saveToLocalStorage(TIPS_KEY, tips);
}

// --- Storage Usage Calculation ---

/**
 * Calculates the total size of data stored in localStorage for this app.
 * @returns The size in bytes.
 */
export const getLocalStorageUsage = (): number => {
    let totalBytes = 0;
    const keys = [OFFLINE_REPORTS_KEY, ALL_REPORTS_KEY, TIPS_KEY];
    for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
            // In JavaScript, each character is typically 2 bytes (UTF-16).
            totalBytes += item.length * 2;
        }
    }
    return totalBytes;
};