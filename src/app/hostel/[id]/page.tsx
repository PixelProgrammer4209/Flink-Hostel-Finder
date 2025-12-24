"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useHostels } from "@/context/HostelContext";
import { Hostel } from "@/types";
import { X } from "lucide-react";
import { addBooking } from "@/lib/firebaseAPI"; // Use Firebase Direct
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable";

export default function HostelDetails() {
  const { id } = useParams();
  const { hostels, loading } = useHostels();
  const [hostel, setHostel] = useState<Hostel | undefined>(undefined);
  const router = useRouter();

  // Booking Form State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: ''
  });

  useEffect(() => {
    if (!loading && hostels.length > 0) {
      const found = hostels.find((h) => h.id === id);
      setHostel(found);
    }
  }, [id, hostels, loading]);

  // Handle Form Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('sending');

    // 1. Prepare Data
    const payload = {
      studentName: formData.name,
      studentPhone: formData.phone,
      joiningDate: formData.date,
      hostelId: hostel!.id,
      hostelName: hostel!.name,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    try {
      // 2. Call the Transactional API (Atomic operation)
      // We pass the full payload which includes hostelId
      const result = await addBooking(payload);

      if (result && hostel) {
        setBookingStatus('success');

        // 3. Generate PDF immediately
        generatePDF(
          formData.name,
          formData.phone,
          hostel.name,
          hostel.contactNumber,
          hostel.type,
          formData.date
        );

        // 4. Optimistic UI Update (Visual feedback)
        setHostel({
          ...hostel,
          seatsAvailable: hostel.seatsAvailable - 1,
          seatsReserved: (hostel.seatsReserved || 0) + 1
        });

        setTimeout(() => {
          setIsBookingOpen(false);
          setBookingStatus('idle');
          setFormData({ name: '', phone: '', date: '' });
          // Alert removed because the PDF download is the "Success" indicator
        }, 2000);
      } else {
        throw new Error("Transaction returned false");
      }

    } catch (error) {
      console.error("Booking Error:", error);
      // If the transaction fails (e.g., no beds left), this runs:
      alert("Booking Failed: " + error);
      setBookingStatus('error');
    }
  };

  const generatePDF = (studentName: string, studentPhone: string, hostelName: string, ownerContact: string, roomType: string, joiningDate: string) => {
    const doc = new jsPDF();

    // Customizable Header
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo 600 color
    doc.text("Hostel Finder by Flink", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("In Association with GECT PTA", 105, 30, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    doc.setTextColor(0);

    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Details']],
      body: [
        ["Student Name", studentName],
        ["Student Phone", studentPhone],
        ["Hostel Reserved", hostelName],
        ["Room Category", roomType],
        ["Owner Contact", ownerContact],
        ["Expected Joining", joiningDate],
        ["Status", "Reservation Successful / Pending Approval"],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 11, cellPadding: 5 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Please contact the owner within 24 hours to confirm your deal.", 105, finalY, { align: "center" });
    doc.text("After 24 hours the reservation may expire if not approved.", 105, finalY + 7, { align: "center" });

    doc.save(`Booking_${studentName}_${hostelName}.pdf`);
  };

  if (loading) return <div className="p-20 text-center">Loading details...</div>;
  if (!hostel) return <div className="p-20 text-center">Hostel not found</div>;

  return (
    <main className="min-h-screen bg-white relative">

      {/* 1. Image Header */}
      <div className="relative w-full h-80 md:h-96 bg-gray-200">
        <Image
          src={hostel.images[0] || "/file.svg"}
          alt={hostel.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white max-w-7xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{hostel.name}</h1>
          <p className="text-lg opacity-90">📍 {hostel.location}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* 2. Left Column: Details */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About this Hostel</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {hostel.description || "No description provided."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {hostel.amenities?.map((item, index) => (
                <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* 3. Right Column: Booking Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500">Rent per month</span>
              <span className="text-3xl font-bold text-indigo-600">₹{hostel.price}</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type</span>
                <span className="font-semibold capitalize">{hostel.type}</span>
              </div>

              {/* --- UPDATED SEAT DISPLAY --- */}
              <div className="flex justify-between text-sm items-start">
                <span className="text-gray-600 pt-1">Seats Available</span>
                <div className="text-right">
                  <span className="font-bold text-green-600 text-lg">
                    {hostel.seatsAvailable} / {hostel.totalSeats}
                  </span>
                  {/* Show "Reserved" text if any seats are pending */}
                  {(hostel.seatsReserved || 0) > 0 && (
                    <div className="text-xs text-orange-500 font-medium animate-pulse">
                      ⚠️ {hostel.seatsReserved} Reserved
                    </div>
                  )}
                </div>
              </div>
              {/* --------------------------- */}

              
            </div>

            {/* OPEN MODAL BUTTON */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition shadow-lg transform active:scale-95"
            >
              Reserve Seat
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              *Booking requires admin verification
            </p>
          </div>
        </div>
      </div>

      {/* --- 4. BOOKING FORM MODAL (POPUP) --- */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Booking Request</h3>
              <button onClick={() => setIsBookingOpen(false)} className="hover:bg-indigo-500 p-1 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                You are booking <span className="font-bold text-gray-800">{hostel.name}</span>.
                Please enter your details below.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Joining Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingStatus === 'sending' || bookingStatus === 'success'}
                className={`w-full py-3 rounded-xl font-bold text-white transition mt-4 ${bookingStatus === 'success'
                  ? 'bg-green-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {bookingStatus === 'sending' ? 'Sending...' :
                  bookingStatus === 'success' ? 'Request Sent! ✓' : 'Confirm Booking'}
              </button>

            </form>
          </div>
        </div>
      )}

    </main>
  );
}