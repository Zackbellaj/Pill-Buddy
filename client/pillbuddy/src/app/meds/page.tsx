// src/app/meds/page.tsx
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
  schedule: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

export default function MedListPage() {
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
        toast.error('Failed to load medications');
      } finally {
        setLoading(false);
      }
    };
    fetchMeds();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      await api.delete(`/meds/${id}`);
      setMeds(meds.filter((med) => med._id !== id));
      toast.success('Medication deleted');
    } catch (err) {
      toast.error('Failed to delete medication');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading medications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Medications</h1>
        <Link
          href="/meds/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Medication
        </Link>
      </div>

      {meds.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>You haven’t added any medications yet.</p>
          <Link href="/meds/create" className="text-indigo-600 underline mt-2 inline-block">
            Add your first medication
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {meds.map((med) => (
            <div
              key={med._id}
              className="flex justify-between items-center p-5 bg-white rounded-xl shadow-sm border"
            >
              <div>
                <h2 className="font-bold text-lg">{med.name}</h2>
                <p className="text-gray-600 text-sm">{med.dosage || 'No dosage specified'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => {
                    if (med.schedule[slot]) {
                      return (
                        <span
                          key={slot}
                          className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize"
                        >
                          {slot}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/meds/${med._id}/edit`}
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(med._id)}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <Link href="/dashboard" className="text-gray-600 hover:underline flex items-center gap-1">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}