// src/app/meds/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateMedPage() {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push('/auth/login');
    return null;
  }

  const toggleSlot = (slot: keyof typeof schedule) => {
    setSchedule((prev) => ({
      ...prev,
      [slot]: !prev[slot],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Medication name is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/meds', { name, dosage, schedule });
      toast.success('Medication added successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Medication</h1>
        <Link href="/meds" className="text-indigo-600 hover:underline text-sm">
          ← View All
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-5">
          <label className="block text-gray-700 mb-2 font-medium">Medication Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="e.g., Metformin"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 mb-2 font-medium">Dosage (optional)</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="e.g., 500mg twice daily"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Schedule</label>
          <p className="text-sm text-gray-600 mb-3">Select when you take this medication:</p>
          <div className="flex flex-wrap gap-3">
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`px-4 py-2 rounded-lg capitalize font-medium transition ${
                  schedule[slot]
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : 'Save Medication'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}