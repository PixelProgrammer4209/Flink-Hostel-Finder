// src/context/HostelContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Hostel } from '../types';
import * as firebaseAPI from '../lib/firebaseAPI';
import { applyFilters, FilterCriteria } from '../lib/filters';

interface HostelContextType {
  hostels: Hostel[];
  filteredHostels: Hostel[];
  loading: boolean;
  triggerUpdate: (id: string, data: Partial<Hostel>) => Promise<void>;
  filterData: (criteria: FilterCriteria) => void;
  addHostel: (hostel: Hostel) => Promise<void>;
  deleteHostel: (id: string) => Promise<void>;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider = ({ children }: { children: ReactNode }) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  // On Load: Fetch data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await firebaseAPI.getHostels();
      setHostels(data);
      setFilteredHostels(data);
      setLoading(false);
    };
    load();
  }, []);

  // --- THE FIX IS HERE ---
  // We use useCallback to ensure this function doesn't change on every render
  const filterData = useCallback((criteria: FilterCriteria) => {
    // We filter the ORIGINAL 'hostels' list, not the already filtered one
    const result = applyFilters(hostels, criteria);
    setFilteredHostels(result);
  }, [hostels]); // Only re-create this function if the main 'hostels' list changes

  const triggerUpdate = async (id: string, data: Partial<Hostel>) => {
    const updatedHostel = await firebaseAPI.updateHostel(id, data);
    if (updatedHostel) {
      setHostels((prev) => prev.map((h) => (h.id === id ? updatedHostel : h)));
      setFilteredHostels((prev) => prev.map((h) => (h.id === id ? updatedHostel : h)));
    }
  };

  const addHostelData = async (newHostel: Hostel) => {
    const savedHostel = await firebaseAPI.addHostel(newHostel);
    setHostels((prev) => [...prev, savedHostel]);
    setFilteredHostels((prev) => [...prev, savedHostel]);
  };

  const deleteHostelData = async (id: string) => {
    await firebaseAPI.deleteHostel(id);
    setHostels((prev) => prev.filter((h) => h.id !== id));
    setFilteredHostels((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <HostelContext.Provider value={{
      hostels,
      filteredHostels,
      loading,
      triggerUpdate,
      filterData,
      addHostel: addHostelData,
      deleteHostel: deleteHostelData
    }}>
      {children}
    </HostelContext.Provider>
  );
};

export const useHostels = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostels must be used within a HostelProvider');
  }
  return context;
};