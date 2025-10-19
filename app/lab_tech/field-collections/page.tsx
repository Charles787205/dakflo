'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import LabTechSidebar from '@/components/lab_tech/sidebar'

interface SampleFile {
  id: string
  filename: string
  mimetype: string
  size: number
}

interface Sample {
  _id: string
  patientId: string
  patientName?: string
  sampleType: string
  notes?: string
  files: SampleFile[]
  uploadedAt: string
  labStatus?: 'pending' | 'approved' | 'rejected'
  labComments?: string
  reviewedBy?: string
  reviewedAt?: string
}

export default function FieldCollectionsPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  // Review state
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewComments, setReviewComments] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchSamples = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/field_collector/sample-collection/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch samples: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSamples(data.samples || [])
    } catch (error) {
      console.error('Error fetching samples:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch samples')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSamples()
  }, [fetchSamples])

  const filteredSamples = samples.filter(sample => {
    if (filterStatus === 'all') return true
    return (sample.labStatus || 'pending') === filterStatus
  })

  const handleViewImages = (sample: Sample) => {
    setSelectedSample(sample)
    setCurrentImageIndex(0)
    setShowImageModal(true)
    setIsFullscreen(false)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setShowReviewForm(false)
    setReviewComments('')
    setSelectedSample(null)
    setCurrentImageIndex(0)
    setIsFullscreen(false)
  }

  const nextImage = () => {
    if (selectedSample && currentImageIndex < selectedSample.files.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <LabTechSidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Collections</h1>
              <p className="text-gray-600">Browse and review all field collection samples</p>
            </div>
            <button
              onClick={fetchSamples}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Collections</p>
                  <p className="text-2xl font-semibold text-gray-900">{samples.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {samples.filter(s => (s.labStatus || 'pending') === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {samples.filter(s => s.labStatus === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {samples.filter(s => s.labStatus === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Collections Table */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading collections...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSamples.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No field collections found
                        </td>
                      </tr>
                    ) : (
                      filteredSamples.map((sample) => (
                        <tr key={sample._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {sample.patientName || sample.patientId}
                            </div>
                            {sample.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {sample.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {sample.sampleType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {sample.files.length > 0 && (
                                <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                                  <Image
                                    src={`/api/field_collector/sample-collection/files/${sample.files[0].id}`}
                                    alt="Sample preview"
                                    fill
                                    unoptimized
                                    style={{ objectFit: 'cover' }}
                                    className="cursor-pointer"
                                    onClick={() => handleViewImages(sample)}
                                  />
                                </div>
                              )}
                              <button
                                onClick={() => handleViewImages(sample)}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                {sample.files.length} image(s)
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sample.labStatus || 'pending')}`}>
                              {sample.labStatus || 'pending'}
                            </span>
                            {sample.reviewedAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                Reviewed: {formatDate(sample.reviewedAt)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(sample.uploadedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewImages(sample)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
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
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedSample && selectedSample.files.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-[90vw] h-[90vh]'} flex flex-col bg-black rounded-lg overflow-hidden`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-black bg-opacity-75 text-white shrink-0">
              <div>
                <h3 className="text-lg font-medium">
                  {selectedSample.patientName || selectedSample.patientId} - {selectedSample.sampleType}
                </h3>
                <p className="text-sm opacity-75">
                  Image {currentImageIndex + 1} of {selectedSample.files.length}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded hover:bg-white hover:bg-opacity-20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button
                  onClick={closeImageModal}
                  className="p-2 rounded hover:bg-white hover:bg-opacity-20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 relative bg-gray-900 min-h-0">
              <Image
                src={`/api/field_collector/sample-collection/files/${selectedSample.files[currentImageIndex].id}`}
                alt={`Sample image ${currentImageIndex + 1}`}
                fill
                unoptimized
                priority
                style={{ objectFit: 'contain' }}
                className=""
              />
              
              {/* Navigation Arrows */}
              {selectedSample.files.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={currentImageIndex === selectedSample.files.length - 1}
                    className="absolute right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Review Interface - Only show for pending samples */}
              {!isFullscreen && (!selectedSample.labStatus || selectedSample.labStatus === 'pending') && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[500px]">
                  {!showReviewForm ? (
                    // Review Action Buttons
                    <div className="flex space-x-4 bg-black bg-opacity-75 rounded-lg p-3">
                      <button
                        onClick={() => {
                          setReviewAction('approve')
                          setShowReviewForm(true)
                          setReviewComments('')
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors"
                      >
                        ✓ Approve Sample
                      </button>
                      <button
                        onClick={() => {
                          setReviewAction('reject')
                          setShowReviewForm(true)
                          setReviewComments('')
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors"
                      >
                        ✗ Reject Sample
                      </button>
                    </div>
                  ) : (
                    // Review Form
                    <div className="bg-white rounded-lg p-4 shadow-lg border">
                      <div className="mb-3">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {reviewAction === 'approve' ? '✓ Approve Sample' : '✗ Reject Sample'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Patient: <span className="font-medium">{selectedSample.patientName || selectedSample.patientId}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Sample Type: <span className="font-medium capitalize">{selectedSample.sampleType}</span>
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments {reviewAction === 'reject' ? '(required)' : '(optional)'}
                        </label>
                        <textarea
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          rows={3}
                          placeholder={reviewAction === 'approve' ? 'Add any additional notes...' : 'Please provide reason for rejection...'}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowReviewForm(false)
                            setReviewComments('')
                          }}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            setSubmittingReview(true)
                            try {
                              const response = await fetch('/api/lab_tech/review-sample', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  sampleId: selectedSample._id,
                                  status: reviewAction === 'approve' ? 'approved' : 'rejected',
                                  comments: reviewComments.trim()
                                }),
                              })
                              
                              const data = await response.json()
                              console.log('API Response:', { status: response.status, data })
                              
                              if (response.ok) {
                                setShowReviewForm(false)
                                setShowImageModal(false)
                                setReviewComments('')
                                await fetchSamples()
                              } else {
                                console.error('API Error:', data)
                                setError(`Failed to submit review: ${data.error || 'Unknown error'}`)
                              }
                            } catch (err) {
                              console.error('Network Error:', err)
                              setError('Network error - please check your connection')
                            } finally {
                              setSubmittingReview(false)
                            }
                          }}
                          disabled={submittingReview || (reviewAction === 'reject' && !reviewComments.trim())}
                          className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 text-sm ${
                            reviewAction === 'approve'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {submittingReview ? 'Submitting...' : (reviewAction === 'approve' ? 'Approve' : 'Reject')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {selectedSample.files.length > 1 && !isFullscreen && (
              <div className="p-4 bg-black bg-opacity-75">
                <div className="flex space-x-2 justify-center">
                  {selectedSample.files.map((file, index) => (
                    <button
                      key={file.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 rounded overflow-hidden ${
                        index === currentImageIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <Image
                        src={`/api/field_collector/sample-collection/files/${file.id}`}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}