'use client'; // Required for client-side interactivity

import React, { useState } from 'react';
import './dashstyle.css'; // Importing the CSS file

// 1. Define the data shape (Fixes TS errors)
interface Hostel {
  id: number;
  name: string;
  owner: string;
  phone: string;
  bedsFree: number;
  status: 'Active' | 'Full' | 'Maintenance'; // Specific allowed strings
}

// 2. Mock Data (Dummy data as requested)
const initialHostels: Hostel[] = [
  { id: 1, name: 'Sunshine Backpackers', owner: 'Rahul Sharma', phone: '+91 98765 43210', bedsFree: 5, status: 'Active' },
  { id: 2, name: 'Blue Moon Hostel', owner: 'Anita Roy', phone: '+91 88888 77777', bedsFree: 0, status: 'Full' },
  { id: 3, name: 'City Central Stay', owner: 'Vikram Singh', phone: '+91 99999 11111', bedsFree: 12, status: 'Active' },
  { id: 4, name: 'Mountain View Dorms', owner: 'Priya Patel', phone: '+91 77777 22222', bedsFree: 3, status: 'Active' },
  { id: 5, name: 'Riverside Retreat', owner: 'Amit Das', phone: '+91 55555 66666', bedsFree: 8, status: 'Active' },
];

export default function AdminDashboard() {
  const [hostels, setHostels] = useState<Hostel[]>(initialHostels);
  const [totalVisitors, setTotalVisitors] = useState<number>(12450);

  // --- Button Operations (Mock Logic) ---

  const handleAddHostel = () => {
    // Simulates adding a random new hostel
    const newHostel: Hostel = {
      id: Date.now(),
      name: `New Hostel ${Math.floor(Math.random() * 100)}`,
      owner: 'New Owner',
      phone: '000-000-0000',
      bedsFree: 10,
      status: 'Active'
    };
    setHostels([...hostels, newHostel]);
    alert("New mock hostel added!");
  };

  const handleUpdateHostel = () => {
    alert("This button will open an 'Edit Details' popup in the future.");
  };

  const handleDeleteHostel = () => {
    if (hostels.length > 0) {
      // Simulates deleting the last hostel in the list
      const updatedList = [...hostels];
      updatedList.pop(); 
      setHostels(updatedList);
    } else {
      alert("No hostels left to delete!");
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* Top Section: Stats & Actions */}
      <div className="dashboard-header">
        
        {/* Left: Visitor Count */}
        <div className="stat-card">
          <h3>Total Visitors</h3>
          <div className="stat-number">{totalVisitors.toLocaleString()}</div>
          <span className="stat-subtext">↗ 12% increase this month</span>
        </div>

        {/* Right: Operation Buttons */}
        <div className="actions-panel">
          <h3>Manage Hostels</h3>
          <div className="button-group">
            <button className="btn btn-add" onClick={handleAddHostel}>
              <span className="icon">+</span> Add Hostel
            </button>
            <button className="btn btn-update" onClick={handleUpdateHostel}>
              <span className="icon">✎</span> Update Details
            </button>
            <button className="btn btn-delete" onClick={handleDeleteHostel}>
              <span className="icon">🗑</span> Delete Hostel
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Data Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <h2>Hostel Database</h2>
          <span className="badge">{hostels.length} Records Found</span>
        </div>
        
        <table className="hostel-table">
          <thead>
            <tr>
              <th>Hostel Name</th>
              <th>Owner Name</th>
              <th>Owner Phone</th>
              <th>Beds Free</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hostels.length > 0 ? (
              hostels.map((hostel) => (
                <tr key={hostel.id}>
                  <td className="fw-bold">{hostel.name}</td>
                  <td>{hostel.owner}</td>
                  <td>{hostel.phone}</td>
                  <td>
                    {/* Logic to show red if 0 beds, blue otherwise */}
                    <span className={`bed-count ${hostel.bedsFree === 0 ? 'full' : ''}`}>
                      {hostel.bedsFree} Beds
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${hostel.status === 'Active' ? 'green' : 'red'}`}></span>
                    {hostel.status}
                  </td>
                  <td>
                    <button className="btn-sm">View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* FIXED: using {6} instead of "6" prevents the TS error */}
                <td colSpan={6} style={{textAlign: 'center', padding: '20px', color: '#888'}}>
                  No hostels found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}