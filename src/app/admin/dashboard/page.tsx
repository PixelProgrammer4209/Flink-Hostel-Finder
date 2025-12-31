'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Important for redirecting
import { useHostels } from '@/context/HostelContext';
import { Hostel } from '@/types';
import { auth } from '@/lib/firebase'; // Ensure this matches your firebase.ts path
import { onAuthStateChanged } from 'firebase/auth';
import { getBookings, updateBookingStatus } from '@/lib/firebaseAPI';
import { uploadImage } from '@/lib/cloudinary';
import { Booking } from '@/types';
import { Plus, Edit2, Trash2, Search, Building2, MapPin, Phone, IndianRupee, BedDouble, X, Check, Clock, User, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  // 1. Get Global Data & Functions from Context
  const { hostels, addHostel, deleteHostel, triggerUpdate } = useHostels();
  const router = useRouter();

  // 2. Local State
  const [loadingAuth, setLoadingAuth] = useState(true); // To show a spinner while checking login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New State for Bookings & Tabs
  const [activeTab, setActiveTab] = useState<'hostels' | 'bookings'>('hostels');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // 3. Form State
  const [formData, setFormData] = useState<Partial<Hostel>>({
    name: '',
    location: '',
    price: 0,
    contactNumber: '',
    seatsAvailable: 0,
    type: 'men',
    images: []
  });

  // New State for Image Upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // --- SECURITY GUARD: CHECK LOGIN STATUS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, allow access
        setLoadingAuth(false);
        fetchBookings(); // Fetch bookings when authorized
      } else {
        // User is NOT logged in, kick them out
        router.push('/admin');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    const data = await getBookings();
    // Sort by timestamp desc (newest first)
    // Assuming timestamp is ISO string or firebase timestamp
    const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setBookings(sorted);
    setLoadingBookings(false);
  };

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ name: '', location: '', price: 0, contactNumber: '', seatsAvailable: 0, type: 'men', images: [] });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hostel: Hostel) => {
    setIsEditMode(true);
    setFormData(hostel);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // 1. Upload new images if any
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await Promise.all(selectedFiles.map(file => uploadImage(file)));
      }

      // 2. Combine with existing images
      const finalImages = [...(formData.images || []), ...uploadedUrls];

      // fallback image if none exist
      if (finalImages.length === 0) {
        finalImages.push('/images/hostel1.jpg');
      }

      const finalData = { ...formData, images: finalImages };

      if (isEditMode && formData.id) {
        // SCENARIO A: Updating
        await triggerUpdate(formData.id, finalData);
        alert("Hostel Updated Successfully!");
      } else {
        // SCENARIO B: Creating
        const newHostel: Hostel = {
          ...finalData as Hostel,
          id: Date.now().toString(),
          verified: true,
          amenities: ['WiFi', 'Mess'],
          totalSeats: finalData.seatsAvailable || 10,
          description: 'New hostel added via Admin Dashboard'
        };
        await addHostel(newHostel);
        alert("New Hostel Created!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(`Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this hostel? This cannot be undone.")) {
      await deleteHostel(id);
    }
  };

  const handleBookingAction = async (id: string, hostelId: string, status: 'confirmed' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status.toUpperCase()} this booking?`)) return;

    const success = await updateBookingStatus(id, hostelId, status);
    if (success) {
      alert(`Booking ${status} successfully!`);
      fetchBookings(); // Refresh list
      triggerUpdate(hostelId, {}); // Trigger context refresh to update seat counts locally if needed (optional)
    } else {
      alert("Failed to update booking.");
    }
  };

  const filteredHostels = hostels.filter(hostel =>
    (hostel.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hostel.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOADING VIEW (While checking if user is logged in) ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* HEADER SECTION */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* LOGOUT BUTTON */}
              <button
                onClick={() => auth.signOut()}
                className="text-sm text-gray-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Hostel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* TABS */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('hostels')}
            className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'hostels'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Hostels
          </button>
          <button
            onClick={() => { setActiveTab('bookings'); fetchBookings(); }}
            className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'bookings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Booking Requests
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'hostels' ? (
          <>
            {/* Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Hostel Database</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your properties and listings</p>
              </div>
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search hostels..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hostel Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Mo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHostels.length > 0 ? (
                      filteredHostels.map((hostel) => (
                        <tr key={hostel.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{hostel.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                              {hostel.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                              {hostel.contactNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                              {(hostel.price || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${(hostel.type || 'men').toLowerCase() === 'men' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'
                              }`}>
                              {hostel.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${hostel.seatsAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              <BedDouble className="w-3.5 h-3.5" />
                              {hostel.seatsAvailable > 0 ? `${hostel.seatsAvailable} Beds` : 'Full'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(hostel)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(hostel.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-900">No hostels found</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {searchTerm ? `No results for "${searchTerm}"` : "Get started by adding a new hostel."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredHostels.length}</span> results
                </span>
              </div>
            </div>
          </>
        ) : (
          /* BOOKINGS TAB CONTENT */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Incoming Reservations</h2>
              <button onClick={fetchBookings} className="text-sm text-blue-600 hover:underline">Refresh</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hostel</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.filter(b => b.status === 'pending').length > 0 ? (
                      bookings.filter(b => b.status === 'pending').map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                <User className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
                                <div className="text-xs text-gray-500">{booking.studentPhone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-700">
                              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                              {booking.hostelName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {booking.joiningDate}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {booking.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleBookingAction(booking.id, booking.hostelId, 'confirmed')}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking.id, booking.hostelId, 'rejected')}
                                  className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium rounded-md transition-colors"
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No actions available</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <Clock className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-900">No bookings yet</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* POPUP FORM MODAL */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal panel */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Hostel Details' : 'Add New Hostel'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                      placeholder="e.g. Sunrise Stay"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                        placeholder="e.g. North Campus"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                          value={formData.price || ''}
                          onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seats Available</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                        value={formData.seatsAvailable || ''}
                        onChange={e => setFormData({ ...formData, seatsAvailable: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 transition-shadow h-[42px]"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as 'men' | 'Women' })}
                      >
                        <option value="men">Men's Hostel</option>
                        <option value="Women">Women's Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                          placeholder="98765..."
                          value={formData.contactNumber}
                          onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Images</label>

                    {/* Existing Images */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="mb-4 grid grid-cols-4 gap-2">
                        {formData.images.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img src={url} alt={`Hostel ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* File Input */}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="font-medium text-blue-600 hover:text-blue-500">Upload images</span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        {selectedFiles.length > 0 && (
                          <div className="mt-2 text-sm text-green-600 font-medium">
                            {selectedFiles.length} files selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="relative px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      {isEditMode ? 'Update' : 'Save'}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-20">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div >
        )
      }

    </div >
  );
}