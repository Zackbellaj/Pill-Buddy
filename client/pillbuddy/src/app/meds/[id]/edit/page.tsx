// src/app/meds/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated } from '../../../../lib/auth';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Med {
  name: string;
  dosage: string;
  schedule: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

export default function EditMedPage() {
  const params = useParams();
  const id = params.id as string;
  const [med, setMed] = useState<Med | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const fetchMed = async () => {
      try {
        const res = await api.get(`/meds/${id}`);
        const data = res.data;
        setMed(data);
        setName(data.name);
        setDosage(data.dosage || '');
        setSchedule(data.schedule);
      } catch (err) {
        toast.error('Failed to load medication');
        router.push('/meds');
      } finally {
        setLoading(false);
      }
    };

    fetchMed();
  }, [id]);

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

    setSaving(true);
    try {
      await api.put(`/meds/${id}`, { name, dosage, schedule });
      toast.success('Medication updated!');
      router.push('/meds');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update medication');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading medication...</div>;
  }

  if (!med) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Medication</h1>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 mb-2 font-medium">Dosage</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., 500mg"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Schedule</label>
          <p className="text-sm text-gray-600 mb-3">Select active time slots:</p>
          <div className="flex flex-wrap gap-3">
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`px-4 py-2 rounded-lg capitalize font-medium ${
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
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Update Medication'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/meds')}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}