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

export default function ApprovedSamples() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'stool' | 'blood' | 'urine' | 'other'>('all')
  
  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      // Filter to only show approved samples
      const approvedSamples = (data.samples || []).filter((sample: Sample) => 
        sample.labStatus === 'approved'
      )
      setSamples(approvedSamples)
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

  const handleViewImages = (sample: Sample) => {
    setSelectedSample(sample)
    setCurrentImageIndex(0)
    setShowImageModal(true)
    setIsFullscreen(false)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredSamples = filterType === 'all' 
    ? samples 
    : samples.filter(sample => sample.sampleType === filterType)

  return (
    <div className="flex h-screen bg-gray-50">
      <LabTechSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Approved Samples</h1>
            <p className="text-gray-600">View all approved sample collections</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">{samples.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {samples.filter(s => {
                      const sampleDate = new Date(s.reviewedAt || s.uploadedAt)
                      const now = new Date()
                      return sampleDate.getMonth() === now.getMonth() && sampleDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {samples.filter(s => {
                      const sampleDate = new Date(s.reviewedAt || s.uploadedAt)
                      const now = new Date()
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      return sampleDate >= weekAgo
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by sample type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'stool' | 'blood' | 'urine' | 'other')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="stool">Stool</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Approved Samples Table */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading approved samples...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSamples.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900">No approved samples found</p>
                            <p className="text-gray-500">Approved samples will appear here after lab review.</p>
                          </div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sample.reviewedAt ? formatDate(sample.reviewedAt) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sample.reviewedBy || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="max-w-xs truncate" title={sample.labComments || 'No comments'}>
                              {sample.labComments || 'No comments'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewImages(sample)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
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
                <div className="flex items-center space-x-4 text-sm opacity-75 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approved
                  </span>
                  {selectedSample.reviewedAt && (
                    <span>Approved: {formatDate(selectedSample.reviewedAt)}</span>
                  )}
                  {selectedSample.reviewedBy && (
                    <span>By: {selectedSample.reviewedBy}</span>
                  )}
                </div>
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

              {/* Lab Comments Display */}
              {selectedSample.labComments && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 max-w-lg">
                  <div className="bg-white rounded-lg p-4 shadow-lg border">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Lab Comments</h4>
                    <p className="text-sm text-gray-700">{selectedSample.labComments}</p>
                  </div>
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