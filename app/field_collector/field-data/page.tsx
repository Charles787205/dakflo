'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SidePanel from '@/components/field_collector/sidepanel'
import Link from 'next/link'

interface Patient {
  _id: string
  firstName: string
  lastName: string
  middleName?: string
  age?: string
  gender?: string
  phoneNumber?: string
  address?: string
  barangay?: string
  municipality?: string
  province?: string
  createdAt: string
}

interface SampleRecord {
  _id: string
  patientId: string
  patientName?: string
  sampleType: string
  notes?: string
  files: Array<{ filename: string; id: string }>
  uploadedAt: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export default function FieldDataPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'patients' | 'samples'>('patients')
  const [patients, setPatients] = useState<Patient[]>([])
  const [samples, setSamples] = useState<SampleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSample, setSelectedSample] = useState<SampleRecord | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [patientSamples, setPatientSamples] = useState<SampleRecord[]>([])
  const [loadingPatientSamples, setLoadingPatientSamples] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch patients data
      const patientsRes = await fetch('/api/field_collector/patients')
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData.patients || [])
      }

      // Fetch sample collection data
      const samplesRes = await fetch('/api/field_collector/sample-collection/list')
      if (samplesRes.ok) {
        const samplesData = await samplesRes.json()
        setSamples(samplesData.samples || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phoneNumber?.includes(searchQuery) ||
    patient.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSamples = samples.filter(sample =>
    sample.sampleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sample.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Function to get sample count for a patient
  const getPatientSampleCount = (patientId: string) => {
    return samples.filter(sample => {
      // Handle both new format (patient _id) and old format (username)
      return sample.patientId === patientId
    }).length
  }

  const handleViewImages = (sample: SampleRecord) => {
    setSelectedSample(sample)
    setCurrentImageIndex(0)
    setIsFullscreen(false)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedSample(null)
    setCurrentImageIndex(0)
    setIsFullscreen(false)
  }

  const nextImage = useCallback(() => {
    if (selectedSample && currentImageIndex < selectedSample.files.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }, [selectedSample, currentImageIndex])

  const prevImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }, [currentImageIndex])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const fetchPatientSamples = async (patientId: string) => {
    setLoadingPatientSamples(true)
    try {
      const response = await fetch('/api/field_collector/sample-collection/list')
      const data = await response.json()
      // Filter samples for the specific patient
      const filteredSamples = (data.samples || []).filter((sample: SampleRecord) => 
        sample.patientId === patientId
      )
      setPatientSamples(filteredSamples)
    } catch (error) {
      console.error('Error fetching patient samples:', error)
      setPatientSamples([])
    } finally {
      setLoadingPatientSamples(false)
    }
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientModal(true)
    fetchPatientSamples(patient._id)
  }

  const closePatientModal = () => {
    setShowPatientModal(false)
    setSelectedPatient(null)
    setPatientSamples([])
  }

  const handleAddSample = (patient: Patient) => {
    // Navigate to sample collection page with patient info
    const patientParam = encodeURIComponent(JSON.stringify({
      id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`,
      displayName: `${patient.firstName} ${patient.lastName}`
    }))
    router.push(`/field_collector/sample-collection?patient=${patientParam}`)
  }

  // Handle escape key for patient modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPatientModal) {
        closePatientModal()
      }
    }

    if (showPatientModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showPatientModal])

  // Handle escape key to close modal and arrow keys for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return
      
      switch (e.key) {
        case 'Escape':
          closeImageModal()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevImage()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextImage()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, currentImageIndex, selectedSample, isFullscreen, nextImage, prevImage, toggleFullscreen])

  return (
    <div className="flex h-screen bg-gray-50">
      <SidePanel />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Data</h1>
              <p className="text-gray-600">View and manage collected patient data and samples</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/field_collector/patients/add"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Patient</span>
              </Link>
              <Link
                href="/field_collector/sample-collection"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upload Samples</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('patients')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'patients'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Patients ({patients.length})
              </button>
              <button
                onClick={() => setActiveTab('samples')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'samples'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sample Collections ({samples.length})
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'patients' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Samples</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                          <tr key={patient._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <button
                                  onClick={() => handleViewPatient(patient)}
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  {patient.firstName} {patient.middleName} {patient.lastName}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.age && `${patient.age} years`} {patient.gender && `• ${patient.gender}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.phoneNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.barangay && `${patient.barangay}, `}{patient.municipality}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getPatientSampleCount(patient._id)} sample(s)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(patient.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleViewPatient(patient)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleAddSample(patient)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Add Sample
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredPatients.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new patient.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'samples' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSamples.map((sample) => (
                          <tr key={sample._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div>
                                <div className="text-gray-900">{sample.patientName || sample.patientId}</div>
                                {sample.patientName && (
                                  <div className="text-gray-500 text-xs">{sample.patientId}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {sample.sampleType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sample.files.length} image(s)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sample.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                sample.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                sample.status === 'completed' ? 'bg-green-100 text-green-800' :
                                sample.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {sample.status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {sample.notes || 'No notes'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sample.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleViewImages(sample)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View Images
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">Download</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredSamples.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sample collections found</h3>
                        <p className="mt-1 text-sm text-gray-500">Upload microscopic images to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enhanced Image Modal */}
      {showImageModal && selectedSample && selectedSample.files.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={closeImageModal}
          />
          
          {/* Modal Content */}
          <div className={`relative bg-white shadow-2xl transition-all duration-300 flex flex-col ${
            isFullscreen 
              ? 'w-full h-full' 
              : 'w-full max-w-4xl max-h-[85vh] sm:max-h-[80vh] rounded-lg overflow-hidden'
          }`}>
            
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {selectedSample.patientName || selectedSample.patientId}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedSample.sampleType}
                    </span>
                    <span>•</span>
                    <span>{currentImageIndex + 1} of {selectedSample.files.length}</span>
                    <span>•</span>
                    <span className="hidden sm:inline">{new Date(selectedSample.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isFullscreen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6M21 3l-6 6M3 21l6-6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </button>
                
                {/* Close Button */}
                <button
                  onClick={closeImageModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Main Image Display */}
            <div className={`relative bg-gray-50 flex items-center justify-center overflow-hidden ${
              isFullscreen 
                ? 'flex-1 min-h-0' 
                : 'h-96 sm:h-[450px] md:h-[500px] flex-shrink-0'
            }`}>
              
              {/* Navigation Arrows */}
              {selectedSample.files.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous (←)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={nextImage}
                    disabled={currentImageIndex === selectedSample.files.length - 1}
                    className="absolute right-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next (→)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Current Image */}
              <div className={`flex items-center justify-center ${
                isFullscreen 
                  ? 'absolute inset-4' 
                  : 'absolute inset-8 sm:inset-12'
              }`}>
                <div className={`relative flex items-center justify-center ${
                  isFullscreen 
                    ? 'w-full h-full' 
                    : 'w-full h-full max-w-2xl max-h-96 sm:max-h-[450px]'
                }`}>
                  <Image
                    src={`/api/field_collector/sample-collection/files/${selectedSample.files[currentImageIndex].id}`}
                    alt={`Sample image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes={isFullscreen 
                      ? "(max-width: 768px) 100vw, 90vw" 
                      : "(max-width: 768px) 80vw, (max-width: 1200px) 60vw, 50vw"
                    }
                    priority
                  />
                </div>
              </div>
              
              {/* Fullscreen Image Counter */}
              {isFullscreen && selectedSample.files.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {selectedSample.files.length}
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {selectedSample.files.length > 1 && !isFullscreen && (
              <div className="flex-shrink-0 border-t bg-white p-3">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {selectedSample.files.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-blue-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={`/api/field_collector/sample-collection/files/${file.id}`}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer with Details */}
            {!isFullscreen && (
              <div className="flex-shrink-0 border-t bg-gray-50 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Image Details</h4>
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">Filename:</span> {selectedSample.files[currentImageIndex].filename}
                    </p>
                  </div>
                  
                  {selectedSample.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Collection Notes</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{selectedSample.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Keyboard Shortcuts Help */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Shortcuts:</span> 
                    ← → Navigate • F Fullscreen • Esc Close
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={closePatientModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Patient Details
                </h3>
                <p className="text-sm text-gray-500">
                  Complete patient information
                </p>
              </div>
              <button
                onClick={closePatientModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Personal Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.middleName && `${selectedPatient.middleName} `}{selectedPatient.lastName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedPatient.age || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedPatient.gender || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPatient.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                {/* Location Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Location Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPatient.address || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barangay</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPatient.barangay || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Municipality</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPatient.municipality || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPatient.province || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {selectedPatient._id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedPatient.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Sample Collections Card */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Sample Collections
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {patientSamples.length} collection(s)
                    </span>
                    <button
                      onClick={() => selectedPatient && fetchPatientSamples(selectedPatient._id)}
                      disabled={loadingPatientSamples}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Refresh samples"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {loadingPatientSamples ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading samples...</span>
                  </div>
                ) : patientSamples.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {patientSamples.map((sample) => (
                      <div key={sample._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {sample.sampleType}
                              </span>
                              {sample.status && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  sample.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  sample.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  sample.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  sample.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {sample.status}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {sample.files.length} image(s) • {new Date(sample.uploadedAt).toLocaleDateString()}
                            </p>
                            {sample.notes && (
                              <p className="text-sm text-gray-500 mt-1 truncate">
                                Notes: {sample.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              closePatientModal()
                              handleViewImages(sample)
                            }}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View Images
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sample collections</h3>
                    <p className="mt-1 text-sm text-gray-500">This patient hasn&apos;t had any samples collected yet.</p>
                    <button
                      onClick={() => {
                        closePatientModal()
                        handleAddSample(selectedPatient)
                      }}
                      className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Add First Sample
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={closePatientModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closePatientModal()
                  handleAddSample(selectedPatient)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Add Sample Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}