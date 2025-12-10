import React from 'react';
// We comment out the Seeder so it doesn't accidentally run again
// import SeedButton from "@/components/SeedButton"; 

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      
      {/* 1. Hero Section: Title & Subtitle */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-md">
          Hostel Finder
        </h1>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto font-light">
          The safest and most affordable student accommodation near MEC. 
          Verified reviews, real photos, and instant booking.
        </p>
      </div>

      {/* 2. The Search Area (Future Placeholder) */}
      <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
        <div className="flex flex-col gap-4">
            {/* Fake Search Bar for UI Visualization */}
            <input 
              type="text" 
              placeholder="Search by hostel name or location..." 
              className="w-full px-5 py-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-inner"
            />
            
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition shadow-lg">
                Find Hostels
              </button>
              {/* Note: The "Admin Login" button is GONE. */}
            </div>
        </div>
        <p className="text-center text-indigo-200 text-xs mt-4 opacity-70">
          Showing 22 Verified Hostels in Thrikkakara
        </p>
      </div>

      {/* 3. Footer / Trust Badge */}
      <div className="mt-16 opacity-60 text-sm font-medium tracking-wide">
        TRUSTED BY 500+ STUDENTS
      </div>

    </main>
  );
}