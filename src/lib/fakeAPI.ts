// src/lib/fakeAPI.ts
import { Hostel } from '../types';
import { hostels as initialHostels } from '../data/hostels';

const STORAGE_KEY = 'hostel_finder_data';
const SIMULATED_DELAY = 500; // 0.5 seconds delay

/**
 * Helper function to load data.
 * Checks if we have saved data in Local Storage.
 * If yes, use that (it has the latest updates).
 * If no, use the default data from the file.
 */
const loadData = (): Hostel[] => {
  if (typeof window === 'undefined') return initialHostels; // Safety for Next.js server side

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    console.log('Loaded data from Local Storage');
    return JSON.parse(saved);
  }
  return initialHostels;
};

// Load data into memory when the app starts
let hostelsDataSource = loadData();

/**
 * Helper to save changes back to Local Storage
 */
const saveData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hostelsDataSource));
  }
};

// --- API FUNCTIONS ---

export const getHostels = async (): Promise<Hostel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Always return the current state of our data source
      resolve(hostelsDataSource);
    }, SIMULATED_DELAY);
  });
};

export const getHostelById = async (id: string): Promise<Hostel | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hostel = hostelsDataSource.find((h) => h.id === id);
      resolve(hostel);
    }, SIMULATED_DELAY);
  });
};

export const updateHostel = async (id: string, updatedData: Partial<Hostel>): Promise<Hostel | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = hostelsDataSource.findIndex((h) => h.id === id);
      
      if (index === -1) {
        resolve(null); 
        return;
      }

      // Update the specific hostel
      hostelsDataSource[index] = { ...hostelsDataSource[index], ...updatedData };
      
      // SAVE the new state to Local Storage so it persists after refresh
      saveData();

      console.log(`Updated Hostel ${id} and saved to storage:`, hostelsDataSource[index]); 
      resolve(hostelsDataSource[index]);
    }, SIMULATED_DELAY);
  });
};