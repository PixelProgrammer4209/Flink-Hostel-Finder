// src/lib/filters.ts
import { Hostel } from '../types';

// This defines what kind of filters the users can apply
export interface FilterCriteria {
  gender: 'men' | 'Women' | 'all';
  maxPrice: number;    // User wants hostels cheaper than this
  searchTerm: string;  // User types a location or name
  verifiedOnly: boolean;
}

// Default values for when the page first loads
export const initialFilters: FilterCriteria = {
  gender: 'all',
  maxPrice: 10000, // Set a high default so all hostels show up initially
  searchTerm: '',
  verifiedOnly: false,
};

/**
 * This is the main logic function.
 * It takes the FULL list of hostels and the user's choices (criteria).
 * It returns a NEW list containing only the matching hostels.
 */
export const applyFilters = (hostels: Hostel[], criteria: FilterCriteria): Hostel[] => {
  return hostels.filter((hostel) => {
    
    // 1. Filter by Gender
    if (criteria.gender !== 'all') {
      // We convert to lowercase to avoid issues like 'Men' vs 'men'
      if (hostel.type.toLowerCase() !== criteria.gender.toLowerCase()) {
        return false; // Skip this hostel
      }
    }

    // 2. Filter by Price
    if (hostel.price > criteria.maxPrice) {
      return false;
    }

    // 3. Filter by Search (Location or Name)
    if (criteria.searchTerm.trim() !== '') {
      const search = criteria.searchTerm.toLowerCase();
      // Check if the search text matches the Name OR the Location
      const matchesName = hostel.name.toLowerCase().includes(search);
      const matchesLocation = hostel.location.toLowerCase().includes(search);
      
      if (!matchesName && !matchesLocation) {
        return false;
      }
    }

    // 4. Filter by "Verified Only" tag
    if (criteria.verifiedOnly && !hostel.verified) {
      return false;
    }

    // If it passed all checks, keep it!
    return true;
  });
};