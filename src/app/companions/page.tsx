'use client';

import { useState, useEffect } from 'react';
import { AICompanion } from '@/lib/ai-companions';

export default function CompanionsPage() {
  const [companions, setCompanions] = useState<AICompanion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanions();
  }, []);

  const fetchCompanions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-companions');
      if (!response.ok) {
        throw new Error('Failed to fetch companions');
      }
      const data = await response.json();
      setCompanions(data.companions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const seedCompanions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-companions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'seed' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed companions');
      }
      
      await fetchCompanions(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Companions</h1>
          <p className="text-lg text-gray-600">
            Meet your AI companions with unique personalities and traits
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {companions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No companions found. Seed the database to get started.</p>
            <button
              onClick={seedCompanions}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seed Default Companions
            </button>
          </div>
        )}

        {companions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion) => (
              <div
                key={companion.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{companion.avatar}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{companion.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    companion.isPremium 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {companion.subscriptionTier}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{companion.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Energy Cost:</span>
                    <span className="font-medium">⚡ {companion.energyCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      companion.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {companion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      View Personality
                    </summary>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {companion.personality}
                    </p>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}

        {companions.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={seedCompanions}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Re-seed Companions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
