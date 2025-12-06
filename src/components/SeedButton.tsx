'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { hostels } from '../data/hostels';
import { writeBatch, collection, doc } from 'firebase/firestore';

export default function SeedButton() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Starting upload...');

        try {
            const batch = writeBatch(db);

            hostels.forEach((hostel) => {
                const docRef = doc(collection(db, 'hostels'), hostel.id);
                batch.set(docRef, hostel);
            });

            await batch.commit();
            setStatus('Success! 22 hostels uploaded.');
        } catch (error) {
            console.error('Error seeding data:', error);
            setStatus('Error uploading data. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white max-w-sm mx-auto my-8 text-center">
            <h3 className="text-lg font-bold mb-2">Admin Tool</h3>
            <p className="text-sm text-gray-600 mb-4">
                Upload {hostels.length} dummy hostels to Firestore.
            </p>

            <button
                onClick={handleSeed}
                disabled={loading}
                className={`px-4 py-2 rounded text-white font-medium transition-colors ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {loading ? 'Uploading...' : 'Seed Database'}
            </button>

            {status && (
                <p className={`mt-3 text-sm font-medium ${status.includes('Error') ? 'text-red-600' : 'text-green-600'
                    }`}>
                    {status}
                </p>
            )}
        </div>
    );
}
