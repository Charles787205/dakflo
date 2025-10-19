'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SampleResult {
  _id: string
  sampleType: string
  collectionDate: string
  status: string
  labStatus?: string
  labComments?: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  collectedBy?: string
}

export default function PatientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<SampleResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || session?.user?.role !== 'patient') {
      router.push('/patient-login')
      return
    }

    fetchResults()
  }, [session, status, router])

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      const response = await fetch('/api/patient/results')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch results')
      }
      
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error('Error fetching results:', err)
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string, labStatus?: string) => {
    if (labStatus === 'approved') return 'bg-green-100 text-green-800'
    if (labStatus === 'rejected') return 'bg-red-100 text-red-800'
    if (status === 'completed') return 'bg-blue-100 text-blue-800'
    if (status === 'processing') return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string, labStatus?: string) => {
    if (labStatus === 'approved') return 'Approved - Results Available'
    if (labStatus === 'rejected') return 'Sample Rejected'
    if (labStatus === 'pending') return 'Under Lab Review'
    if (status === 'completed') return 'Sample Processed'
    if (status === 'processing') return 'Sample Processing'
    if (status === 'pending') return 'Sample Collected - Pending'
    return status
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/patient-login' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Lab Results</h1>
              <p className="text-gray-600">Welcome, {session?.user?.name || session?.user?.username}</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => router.push('/profile')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                My Profile
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections For Now</h3>
              <p className="text-gray-600">
                No samples have been collected yet. Check back later or contact your healthcare provider.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {results.map((result) => (
                  <li key={result._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 capitalize">
                            {result.sampleType} Sample
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status, result.labStatus)}`}>
                            {getStatusText(result.status, result.labStatus)}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>Collection Date:</strong> {new Date(result.collectionDate).toLocaleDateString()}</p>
                          {result.collectedBy && (
                            <p><strong>Collected By:</strong> {result.collectedBy}</p>
                          )}
                          {result.notes && (
                            <p><strong>Notes:</strong> {result.notes}</p>
                          )}
                        </div>

                        {/* Lab Results Section */}
                        {result.labStatus === 'approved' && result.labComments && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Lab Results</h4>
                            <p className="text-green-700">{result.labComments}</p>
                            {result.reviewedBy && result.reviewedAt && (
                              <div className="mt-2 text-xs text-green-600">
                                Reviewed by {result.reviewedBy} on {new Date(result.reviewedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {result.labStatus === 'rejected' && result.labComments && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">Sample Rejected</h4>
                            <p className="text-red-700">{result.labComments}</p>
                            {result.reviewedBy && result.reviewedAt && (
                              <div className="mt-2 text-xs text-red-600">
                                Reviewed by {result.reviewedBy} on {new Date(result.reviewedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pending Review */}
                        {result.labStatus === 'pending' && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">Under Review</h4>
                            <p className="text-yellow-700">Your sample is currently being reviewed by our lab technicians. Results will be available soon.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}