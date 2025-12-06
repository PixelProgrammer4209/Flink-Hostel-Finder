export interface Location {
    address: string;
    latitude: number;
    longitude: number;
}

export interface Hostel {
    id: string;
    name: string;
    type: 'men' | 'Women';
    price: number;
    seatsAvailable: number;
    totalSeats: number;
    amenities: string[];
    images: string[];
    location: string; // Keeping it simple as a string for now based on your old data
    verified: boolean;
    contactNumber: string; // Warden's number
    description: string;
}

export interface Booking {
  id: string;
  studentName: string;
  studentPhone: string;
  hostelId: string;
  hostelName: string;
  bookingDate: string; 
  amountPaid: number;
  status: 'confirmed' | 'cancelled';
}