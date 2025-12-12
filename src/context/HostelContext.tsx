// src/context/HostelContext.tsx
"use client"; // This tells Next.js this file runs in the browser, not the server.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hostel } from '../types';
import * as fakeAPI from '../lib/fakeAPI';
import { applyFilters, FilterCriteria } from '../lib/filters';

// 1. Define the shape of our "Bridge"
// This tells the UI members: "Here are the variables and functions you can use."
interface HostelContextType {
  hostels: Hostel[];            // The full list of hostels (useful for Admin)
  filteredHostels: Hostel[];    // The filtered list (useful for Students)
  loading: boolean;             // True if we are still fetching data
  triggerUpdate: (id: string, data: Partial<Hostel>) => Promise<void>; // Function to update data
  filterData: (criteria: FilterCriteria) => void; // Function to filter data
}

// Create the context (initially undefined)
const HostelContext = createContext<HostelContextType | undefined>(undefined);

// 2. The Provider Component
// This wraps the whole app and provides the data to every page.
export const HostelProvider = ({ children }: { children: ReactNode }) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  // On Load: Fetch data from our Fake API
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fakeAPI.getHostels();
      setHostels(data);
      setFilteredHostels(data); // Initially, show all hostels
      setLoading(false);
    };
    load();
  }, []);

  // Logic: Handle Filtering (For Member 1 - Student UI)
  const filterData = (criteria: FilterCriteria) => {
    const result = applyFilters(hostels, criteria);
    setFilteredHostels(result);
  };

  // Logic: Handle Updates (For Member 3 - Admin Dashboard)
  const triggerUpdate = async (id: string, data: Partial<Hostel>) => {
    // 1. Update the "database"
    const updatedHostel = await fakeAPI.updateHostel(id, data);
    
    if (updatedHostel) {
      // 2. Update the local state immediately so the user sees the change
      setHostels((prev) => 
        prev.map((h) => (h.id === id ? updatedHostel : h))
      );
      // Update filtered list too, just in case the updated hostel is currently shown
      setFilteredHostels((prev) => 
        prev.map((h) => (h.id === id ? updatedHostel : h))
      );
    }
  };

  return (
    <HostelContext.Provider value={{ hostels, filteredHostels, loading, triggerUpdate, filterData }}>
      {children}
    </HostelContext.Provider>
  );
};

// 3. Custom Hook
// This is a shortcut. Your team members will just write: const { filteredHostels } = useHostels();
export const useHostels = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostels must be used within a HostelProvider');
  }
  return context;
};