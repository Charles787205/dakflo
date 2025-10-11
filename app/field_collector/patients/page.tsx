 'use client';

import React from 'react';
import Link from 'next/link';
import SidePanel from '@/components/field_collector/sidepanel';
import type { Patient } from '@/models/patient';

// UI Patient interface for display purposes (extends the model for UI-specific fields)
interface UIPatient extends Omit<Patient, '_id'> {
  id: string; // UI uses 'id' instead of '_id'
  status: 'Active' | 'Inactive' | 'Pending'; // UI-specific status field
}

// Sample patient data - In a real app, this would come from a database
const samplePatients: UIPatient[] = [
  {
    id: 'PT001',
    firstName: 'Maria',
    lastName: 'Santos',
    age: 28,
    gender: 'female',
    dateOfBirth: '1997-01-15',
    civilStatus: 'single',
    phoneNumber: '+63 912 345 6789',
    address: 'Barangay San Jose, Bataan',
    barangay: 'San Jose',
    municipality: 'Bataan',
    province: 'Bataan',
    createdAt: new Date('2025-09-08'),
    updatedAt: new Date('2025-09-08'),
    status: 'Active'
  },
  {
    id: 'PT002',
    firstName: 'Juan',
    lastName: 'Cruz',
    age: 45,
    gender: 'male',
    dateOfBirth: '1980-03-22',
    civilStatus: 'married',
    phoneNumber: '+63 917 888 9999',
    address: 'Barangay Poblacion, Bataan',
    barangay: 'Poblacion',
    municipality: 'Bataan',
    province: 'Bataan',
    createdAt: new Date('2025-09-07'),
    updatedAt: new Date('2025-09-07'),
    status: 'Pending'
  },
  {
    id: 'PT003',
    firstName: 'Ana',
    lastName: 'Reyes',
    age: 32,
    gender: 'female',
    dateOfBirth: '1993-11-08',
    civilStatus: 'divorced',
    phoneNumber: '+63 920 111 2222',
    address: 'Barangay Bagac, Bataan',
    barangay: 'Bagac',
    municipality: 'Bataan',
    province: 'Bataan',
    createdAt: new Date('2025-09-06'),
    updatedAt: new Date('2025-09-06'),
    status: 'Active'
  }
];

const PatientsPage = () => {
  const [patients, setPatients] = React.useState<UIPatient[]>(samplePatients);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'All' | 'Active' | 'Inactive' | 'Pending'>('All');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch patients from API and map to UI shape
  type ApiPatient = {
    _id?: string
    id?: string
    firstName?: string
    middleName?: string
    lastName?: string
    age?: number
    ageInYears?: number
    dateOfBirth?: string
    gender?: string
    civilStatus?: string
    phoneNumber?: string
    contact?: string
    phone?: string
    address?: string
    barangay?: string
    municipality?: string
    province?: string
    createdAt?: string
    dateRegistered?: string
    updatedAt?: string
    status?: string
  }

  const fetchPatients = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/field_collector/patients');
      if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
      const data = await res.json();
      // API returns patients with _id as string (see server implementation)
      const mapped: UIPatient[] = (data.patients || []).map((p: ApiPatient) => ({
        id: p._id || p.id || (p._id ? String(p._id) : ''),
        firstName: p.firstName || '',
        middleName: p.middleName || null,
        lastName: p.lastName || '',
        age: typeof p.age === 'number' ? p.age : (typeof p.ageInYears === 'number' ? p.ageInYears : null),
        dateOfBirth: p.dateOfBirth || null,
        gender: (p.gender === 'male' || p.gender === 'female' || p.gender === 'other') ? p.gender : null,
        civilStatus: (p.civilStatus === 'single' || p.civilStatus === 'married' || p.civilStatus === 'divorced' || p.civilStatus === 'widowed' || p.civilStatus === 'separated') ? p.civilStatus : null,
        phoneNumber: p.phoneNumber || p.contact || p.phone || null,
        address: p.address || null,
        barangay: p.barangay || null,
        municipality: p.municipality || null,
        province: p.province || null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        status: (p.status === 'Active' || p.status === 'Inactive' || p.status === 'Pending') ? (p.status as 'Active' | 'Inactive' | 'Pending') : 'Active'
      }));
      setPatients(mapped);
    } catch (err: unknown) {
      console.error('Error fetching patients', err);
      let message = 'Failed to load patients';
      if (err && typeof err === 'object' && 'message' in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message = (err as any).message ?? message;
      }
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Action handlers (placeholders)
  const handleView = (id: string) => {
    // navigate to patient detail page if exists, otherwise alert
    if (typeof window !== 'undefined') {
      const url = `/field_collector/patients/${encodeURIComponent(id)}`;
      // if route exists, prefer navigation else fallback to alert
      // For now we'll navigate to the URL (page may be implemented later)
      window.location.href = url;
    }
  };

  const handleEdit = (id: string) => {
    alert(`Edit patient ${id} (not implemented yet)`);
  };

  const handleDelete = (id: string) => {
    const ok = confirm('Delete this patient? This action cannot be undone.');
    if (!ok) return;
    alert(`Deleted patient ${id} (not actually deleted in this demo)`);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SidePanel />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600">Manage patient information and records</p>
            </div>
            <Link
              href="/field_collector/patients/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Patient</span>
            </Link>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchPatients}
                className="px-3 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
              >
                Refresh
              </button>
              {loading && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          </div>

          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Active' | 'Inactive' | 'Pending')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender/Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p>No patients found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.middleName && `${patient.middleName} `}{patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.dateOfBirth && (
                              <>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} • </>
                            )}
                            Registered: {new Date(patient.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.age ? `${patient.age} years` : 'N/A'} • {patient.gender || 'N/A'}
                          {patient.civilStatus && (
                            <div className="text-xs text-gray-500 capitalize">
                              {patient.civilStatus}
                            </div>
                          )}
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                          <div>{patient.address || 'No address'}</div>
                          {patient.barangay && patient.municipality && (
                            <div className="text-xs text-gray-500">
                              {patient.barangay}, {patient.municipality}
                              {patient.province && `, ${patient.province}`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => handleView(patient.id)} className="text-blue-600 hover:text-blue-900 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button onClick={() => handleEdit(patient.id)} className="text-green-600 hover:text-green-900 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-900 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-semibold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.filter(p => p.status === 'Active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.filter(p => p.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.filter(p => p.status === 'Inactive').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
