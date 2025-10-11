'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/sidebar';

interface User {
  _id: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Mock data for demonstration
  const getMockUsers = useCallback((): User[] => [
    {
      _id: '1',
      username: 'john_collector',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      role: 'field_collector',
      isApproved: true,
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-01-20T14:22:00Z'
    },
    {
      _id: '2',
      username: 'sarah_lab',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      role: 'lab_tech',
      isApproved: false,
      isActive: false,
      createdAt: '2024-01-18T09:15:00Z'
    },
    {
      _id: '3',
      username: 'mike_expert',
      firstName: 'Dr. Mike',
      lastName: 'Brown',
      email: 'mike@example.com',
      role: 'ext_expert',
      isApproved: true,
      isActive: true,
      createdAt: '2024-01-10T16:45:00Z',
      lastLogin: '2024-01-19T11:30:00Z'
    },
    {
      _id: '4',
      username: 'jane_collector',
      firstName: 'Jane',
      lastName: 'Davis',
      email: 'jane@example.com',
      role: 'field_collector',
      isApproved: false,
      isActive: false,
      createdAt: '2024-01-22T13:20:00Z'
    },
    {
      _id: '5',
      username: 'admin_user',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'admin',
      isApproved: true,
      isActive: true,
      createdAt: '2024-01-01T08:00:00Z',
      lastLogin: '2024-01-22T15:45:00Z'
    }
  ], []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          // Fallback to mock data if API fails
          setUsers(getMockUsers());
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data if API fails
        setUsers(getMockUsers());
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getMockUsers]);

  const handleUserAction = async (userId: string, action: 'approve' | 'reject' | 'activate' | 'deactivate' | 'delete') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });

      if (response.ok) {
        // Update local state to reflect the change
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              switch (action) {
                case 'approve':
                  return { ...user, isApproved: true, isActive: true };
                case 'reject':
                  return user; // User will be removed by filter below
                case 'activate':
                  return { ...user, isActive: true };
                case 'deactivate':
                  return { ...user, isActive: false };
                default:
                  return user;
              }
            }
            return user;
          }).filter(user => action !== 'reject' || user._id !== userId)
        );
        
        // Show success message
        alert(`User ${action}d successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`An error occurred while performing the ${action} action.`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'field_collector': return 'bg-green-100 text-green-800';
      case 'lab_tech': return 'bg-blue-100 text-blue-800';
      case 'ext_expert': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.isApproved) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.middleName || ''} ${user.lastName} ${user.suffix || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    
    const matchesTab = (() => {
      switch (activeTab) {
        case 'pending': return !user.isApproved;
        case 'approved': return user.isApproved && user.isActive;
        case 'rejected': return user.isApproved === false;
        default: return true;
      }
    })();

    return matchesSearch && matchesRole && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts, permissions, and access</p>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/add-user'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="sm:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="field_collector">Field Collector</option>
                <option value="lab_tech">Lab Technician</option>
                <option value="ext_expert">External Expert</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'All Users', count: users.length },
              { id: 'pending', name: 'Pending Approval', count: users.filter(u => !u.isApproved).length },
              { id: 'approved', name: 'Active Users', count: users.filter(u => u.isApproved && u.isActive).length },
              { id: 'rejected', name: 'Inactive Users', count: users.filter(u => u.isApproved === false || !u.isActive).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Users Table */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.middleName && `${user.middleName} `}{user.lastName} {user.suffix && `${user.suffix}`}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!user.isApproved && (
                              <button
                                onClick={() => handleUserAction(user._id, 'approve')}
                                className="text-green-600 hover:text-green-900 px-2 py-1 border border-green-300 rounded text-xs"
                              >
                                Approve
                              </button>
                            )}
                            {user.isApproved && !user.isActive && (
                              <button
                                onClick={() => handleUserAction(user._id, 'activate')}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-300 rounded text-xs"
                              >
                                Activate
                              </button>
                            )}
                            {user.isActive && (
                              <button
                                onClick={() => handleUserAction(user._id, 'deactivate')}
                                className="text-yellow-600 hover:text-yellow-900 px-2 py-1 border border-yellow-300 rounded text-xs"
                              >
                                Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(user._id, 'delete')}
                              className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}