"use client";

import React, { useState, useEffect } from "react";
import HostelCard from "@/components/hostelcard"; 
import { useHostels } from "@/context/HostelContext";

export default function Home() {
  const { filteredHostels, filterData, loading } = useHostels();
  
  const [filters, setFilters] = useState({
    gender: "all" as "all" | "men" | "Women",
    maxPrice: 10000,
    searchTerm: "",
    verifiedOnly: false,
  });

  useEffect(() => {
    filterData(filters);
  }, [filters, filterData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleGenderChange = (gender: "all" | "men" | "Women") => {
    setFilters({ ...filters, gender });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, maxPrice: Number(e.target.value) });
  };

  const handleVerifiedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, verifiedOnly: e.target.checked });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* --- 1. HERO SECTION --- */}
      <div className="w-full py-16 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
        <div className="text-center space-y-4 mb-8 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
            Hostel Finder
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-light">
            The safest and most affordable student accommodation near GEC Thrissur.
          </p>
        </div>

        <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl mx-4">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by hostel name or location..."
              className="w-full px-5 py-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-inner"
            />
            <p className="text-center text-indigo-200 text-xs opacity-70">
              Type above to search instantly
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN LAYOUT --- */}
      {/* UPDATED: max-w-[1600px] makes the whole page much wider, shifting filters left */}
      <div className="max-w-[1600px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* --- LEFT SIDEBAR (Fixed narrower width) --- */}
        {/* UPDATED: w-64 is a fixed width, preventing it from eating up card space */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              <button 
                onClick={() => setFilters({ gender: "all", maxPrice: 10000, searchTerm: "", verifiedOnly: false })}
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                Reset
              </button>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-3 text-gray-700">Gender</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.gender === "all"}
                    onChange={() => handleGenderChange("all")}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span>All Hostels</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.gender === "men"}
                    onChange={() => handleGenderChange("men")}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span>Boys Only</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.gender === "Women"}
                    onChange={() => handleGenderChange("Women")}
                    className="w-5 h-5 text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <span>Girls Only</span>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Max Price</h3>
                <span className="text-indigo-600 font-bold">₹{filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="3000"
                max="15000"
                step="500"
                value={filters.maxPrice}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹3k</span>
                <span>₹15k</span>
              </div>
            </div>

            <div className="mb-6 pt-6 border-t border-gray-100">
              <label className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition">
                <span className="font-semibold text-gray-700 group-hover:text-indigo-700 transition">
                  Verified Only
                </span>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={handleVerifiedChange}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* --- RIGHT CONTENT --- */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredHostels.length}</span> results
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredHostels.length > 0 ? (
            /* UPDATED: gap-x-20 adds HUGE horizontal space, gap-y-12 keeps vertical normal */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-12 justify-items-center">
              {filteredHostels.map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  id={hostel.id}  
                  name={hostel.name}
                  type={hostel.type.toLowerCase() === "men" ? "Boys" : "Girls"}
                  image={hostel.images[0] || "/file.svg"}
                  distance={hostel.location} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-xl text-gray-400 mb-4">No hostels match your filters.</p>
              <button
                onClick={() => setFilters({ gender: "all", maxPrice: 10000, searchTerm: "", verifiedOnly: false })}
                className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full font-semibold hover:bg-indigo-200 transition"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}