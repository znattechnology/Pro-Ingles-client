"use client";

import React, { useState } from 'react';
import { useCreateTeacherUnitMutation, useGetCourseUnitsQuery } from '@/src/domains/teacher/practice-courses/api';

// Simple debug page to test unit creation
export default function DebugUnitCreation() {
  const [courseId] = useState('65d5c5e5-9e4f-4c5a-8b3a-2f1e9d0c4b5a'); // Example course ID
  const [unitTitle, setUnitTitle] = useState('');
  const [unitDescription, setUnitDescription] = useState('');
  const [createUnit, { isLoading: isCreating, error: createError }] = useCreateTeacherUnitMutation();
  const { data: unitsData, isLoading: unitsLoading, error: unitsError, refetch } = useGetCourseUnitsQuery(courseId);

  const units = unitsData?.units || [];

  const handleCreateUnit = async () => {
    if (!unitTitle.trim()) return;

    const nextOrder = units.length > 0 ? Math.max(...units.map(u => u.order || 0)) + 1 : 1;
    
    try {
      console.log('🔄 Creating unit with data:', {
        course: courseId,
        title: unitTitle,
        description: unitDescription,
        order: nextOrder
      });

      const result = await createUnit({
        course: courseId,
        title: unitTitle,
        description: unitDescription,
        order: nextOrder
      }).unwrap();

      console.log('✅ Unit created successfully:', result);
      
      // Refetch units
      await refetch();
      
      // Clear form
      setUnitTitle('');
      setUnitDescription('');
      
    } catch (error) {
      console.error('❌ Unit creation failed:', error);
      if (error && typeof error === 'object') {
        console.error('❌ Detailed error:', JSON.stringify(error, null, 2));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Unit Creation</h1>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">Course ID:</label>
          <input 
            type="text" 
            value={courseId} 
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            readOnly 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit Title:</label>
          <input 
            type="text" 
            value={unitTitle}
            onChange={(e) => setUnitTitle(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="Enter unit title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit Description:</label>
          <textarea 
            value={unitDescription}
            onChange={(e) => setUnitDescription(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="Enter unit description"
            rows={3}
          />
        </div>

        <button
          onClick={handleCreateUnit}
          disabled={isCreating || !unitTitle.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
        >
          {isCreating ? 'Creating...' : 'Create Unit'}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Current Units ({units.length})</h2>
        
        {unitsLoading && <p>Loading units...</p>}
        {unitsError && (
          <div className="bg-red-900 p-4 rounded mb-4">
            <p className="font-semibold">Units Loading Error:</p>
            <pre className="text-sm">{JSON.stringify(unitsError, null, 2)}</pre>
          </div>
        )}
        
        {units.length === 0 && !unitsLoading && (
          <p className="text-gray-400">No units found</p>
        )}
        
        {units.map((unit, index) => (
          <div key={unit.id} className="bg-gray-800 p-4 rounded mb-2">
            <h3 className="font-medium">{index + 1}. {unit.title} (Order: {unit.order})</h3>
            <p className="text-sm text-gray-400">{unit.description}</p>
            <p className="text-xs text-gray-500">ID: {unit.id}</p>
          </div>
        ))}
      </div>

      {createError && (
        <div className="mt-8 bg-red-900 p-4 rounded">
          <h3 className="font-semibold text-red-200 mb-2">Creation Error:</h3>
          <pre className="text-sm text-red-100 overflow-auto">
            {JSON.stringify(createError, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-800 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <ul className="text-sm space-y-1">
          <li>Units loading: {unitsLoading ? 'Yes' : 'No'}</li>
          <li>Units count: {units.length}</li>
          <li>Units data: {unitsData ? 'Available' : 'None'}</li>
          <li>Create loading: {isCreating ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    </div>
  );
}