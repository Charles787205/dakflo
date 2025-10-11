'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminSidebar from '@/components/admin/sidebar';

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isApproved?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    fieldCollectors: 0,
    labTechs: 0,
    extExperts: 0
  });

  // Mock data - In real app, this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        _id: '1',
        username: 'field_collector',
        name: 'Maria Santos',
        email: 'maria@dakflo.com',
        role: 'field_collector',
        isActive: true,
        isApproved: true,
        createdAt: '2025-10-01T08:00:00Z',
        lastLogin: '2025-10-06T09:30:00Z'
      },
      {
        _id: '2',
        username: 'lab_tech',
        name: 'Juan Cruz',
        email: 'juan@dakflo.com',
        role: 'lab_tech',
        isActive: true,
        isApproved: true,
        createdAt: '2025-10-02T10:15:00Z',
        lastLogin: '2025-10-06T08:45:00Z'
      },
      {
        _id: '3',
        username: 'pending_field1',
        name: 'Ana Reyes',
        email: 'ana@dakflo.com',
        role: 'field_collector',
        isActive: false,
        isApproved: false,
        createdAt: '2025-10-05T14:20:00Z'
      },
      {
        _id: '4',
        username: 'pending_lab1',
        name: 'Roberto Kim',
        email: 'roberto@dakflo.com',
        role: 'lab_tech',
        isActive: false,
        isApproved: false,
        createdAt: '2025-10-05T16:45:00Z'
      },
      {
        _id: '5',
        username: 'pending_expert1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@dakflo.com',
        role: 'ext_expert',
        isActive: false,
        isApproved: false,
        createdAt: '2025-10-06T09:10:00Z'
      }
    ];

    setUsers(mockUsers);
    
    // Calculate stats
    const newStats = {
      total: mockUsers.length,
      pending: mockUsers.filter(u => !u.isApproved).length,
      approved: mockUsers.filter(u => u.isApproved).length,
      fieldCollectors: mockUsers.filter(u => u.role === 'field_collector').length,
      labTechs: mockUsers.filter(u => u.role === 'lab_tech').length,
      extExperts: mockUsers.filter(u => u.role === 'ext_expert').length
    };
    setStats(newStats);
    setLoading(false);
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      // In real app, this would call an API
      console.log('Approving user:', userId);
      
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isApproved: true, isActive: true }
          : user
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));

      alert('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      // In real app, this would call an API
      console.log('Rejecting user:', userId);
      
      setUsers(prev => prev.filter(user => user._id !== userId));

      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        pending: prev.pending - 1
      }));

      alert('User rejected and removed!');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user');
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      // In real app, this would call an API
      console.log('Deactivating user:', userId);
      
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isActive: false }
          : user
      ));

      alert('User deactivated successfully!');
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Error deactivating user');
    }
  };

  const filteredUsers = users.filter(user => {
    switch (selectedTab) {
      case 'pending':
        return !user.isApproved;
      case 'approved':
        return user.isApproved;
      default:
        return true;
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'field_collector':
        return 'bg-blue-100 text-blue-800';
      case 'lab_tech':
        return 'bg-green-100 text-green-800';
      case 'ext_expert':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isApproved: boolean, isActive: boolean) => {
    if (!isApproved) return 'bg-yellow-100 text-yellow-800';
    if (isActive) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isApproved: boolean, isActive: boolean) => {
    if (!isApproved) return 'Pending';
    if (isActive) return 'Active';
    return 'Inactive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return ( <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
              <p className="text-gray-600">Manage users and system access</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Logged in as: <span className="font-medium text-gray-900">{session?.user?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Field Collectors</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.fieldCollectors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lab Techs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.labTechs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Experts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.extExperts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'pending', label: 'Pending Approval', count: stats.pending },
                { key: 'approved', label: 'Approved Users', count: stats.approved },
                { key: 'all', label: 'All Users', count: stats.total }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as 'pending' | 'approved' | 'all')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    selectedTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    selectedTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>No users found in this category</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isApproved || false, user.isActive)}`}>
                          {getStatusText(user.isApproved || false, user.isActive)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!user.isApproved && (
                            <>
                              <button
                                onClick={() => handleApprove(user._id)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Approve User"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReject(user._id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Reject User"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          {user.isApproved && user.isActive && user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeactivate(user._id)}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors"
                              title="Deactivate User"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
                              </svg>
                            </button>
                          )}
                          <button
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
      </div>
      </div>
    </div>
  );
}
