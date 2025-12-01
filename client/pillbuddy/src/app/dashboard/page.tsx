// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../../lib/auth';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Med {
  _id: string;
  name: string;
  dosage: string;
  schedule: Record<string, boolean>;
  doses: { date: string; taken: Record<string, boolean> }[];
}

export default function Dashboard() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const fetchMeds = async () => {
      try {
        const res = await api.get('/meds');
        setMeds(res.data);
      } catch (err) {
        toast.error('Failed to load meds');
      } finally {
        setLoading(false);
      }
    };
    fetchMeds();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const toggleDose = async (id: string, slot: string) => {
    try {
      const res = await api.post(`/meds/${id}/dose`, { timeSlot: slot });
      setMeds((prev) =>
        prev.map((med) => (med._id === id ? res.data : med))
      );
    } catch (err) {
      toast.error('Failed to update dose');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Today’s Medications</h1>
        <Link
          href="/meds/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Add Med
        </Link>
      </div>

      {meds.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>No medications yet.</p>
          <Link href="/meds/create" className="text-indigo-600 underline">
            Add your first medication
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meds.map((med) => {
            const todayDose = med.doses.find((d) => d.date === today)?.taken || {
              morning: false,
              afternoon: false,
              evening: false,
              night: false,
            };

            return (
              <div key={med._id} className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="font-bold text-lg">{med.name}</h2>
                <p className="text-gray-600 text-sm">{med.dosage}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => {
                    if (!med.schedule[slot]) return null;
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleDose(med._id, slot)}
                        className={`px-3 py-1 rounded-full text-xs capitalize ${
                          todayDose[slot]
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <Link href="/meds" className="text-indigo-600 hover:underline">
          View all medications →
        </Link>
      </div>
    </div>
  );
}