import React from 'react';
import SeedButton from '../components/SeedButton';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold tracking-tight">Hostel Finder 2.0</h1>
      <p className="mt-4 text-lg text-indigo-100">
        Migration to Next.js + TypeScript in progress...
      </p>

      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition">
          Browse Hostels
        </button>
        <button className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
          Admin Login
        </button>
      </div>

      <div className="mt-12">
        <SeedButton />
      </div>
    </main>
  );
}