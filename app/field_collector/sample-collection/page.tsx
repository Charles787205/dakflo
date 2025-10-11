"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import SidePanel from '@/components/field_collector/sidepanel'

interface PatientOption {
  id: string
  displayName: string
  identifier: string
  type: 'patient' | 'user'
}

function SampleCollectionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [patientId, setPatientId] = useState('')
  const [patientQuery, setPatientQuery] = useState('')
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [sampleType, setSampleType] = useState('stool')
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check for pre-selected patient from URL params
  useEffect(() => {
    const patientParam = searchParams.get('patient')
    if (patientParam) {
      try {
        const patientData = JSON.parse(decodeURIComponent(patientParam))
        const preSelectedPatient: PatientOption = {
          id: patientData.id,
          displayName: patientData.displayName || patientData.name,
          identifier: patientData.id,
          type: 'patient'
        }
        setSelectedPatient(preSelectedPatient)
        setPatientId(patientData.id)
        setPatientQuery(preSelectedPatient.displayName)
      } catch (error) {
        console.error('Error parsing patient parameter:', error)
      }
    }
  }, [searchParams])

  // Debounced search for patients
  useEffect(() => {
    const searchPatients = async () => {
      if (patientQuery.trim().length < 2) {
        setPatientOptions([])
        setShowDropdown(false)
        return
      }

      try {
        const response = await fetch(`/api/field_collector/patients/search?q=${encodeURIComponent(patientQuery)}`)
        const data = await response.json()
        setPatientOptions(data.patients || [])
        setShowDropdown(true)
      } catch (error) {
        console.error('Search error:', error)
        setPatientOptions([])
      }
    }

    const timeoutId = setTimeout(searchPatients, 300)
    return () => clearTimeout(timeoutId)
  }, [patientQuery])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePatientSelect = (patient: PatientOption) => {
    setSelectedPatient(patient)
    setPatientId(patient.id)  // Use the actual MongoDB _id instead of username
    setPatientQuery(patient.displayName)
    setShowDropdown(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!patientId.trim()) {
      setError('Please select a patient')
      return
    }
    if (files.length === 0) {
      setError('Please select at least one image')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('patientId', patientId)
      if (selectedPatient?.displayName) {
        fd.append('patientName', selectedPatient.displayName)
      }
      fd.append('sampleType', sampleType)
      fd.append('notes', notes)
      files.forEach(f => fd.append('images', f))

      const res = await fetch('/api/field_collector/sample-collection', {
        method: 'POST',
        body: fd
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Upload failed')

      // Navigate to list or clear form
      router.push('/field_collector/patients')
    } catch (err) {
      console.error(err)
      setError((err as Error)?.message || 'Upload error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidePanel />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Sample Collection</h1>
          <p className="text-sm text-gray-600 mb-4">Upload microscopic images associated with a patient sample</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <input
                value={patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value)
                  setSelectedPatient(null)
                  setPatientId('')
                }}
                onFocus={() => {
                  if (patientOptions.length > 0) setShowDropdown(true)
                }}
                className="mt-1 block w-full px-3 py-2 border rounded text-gray-900 bg-white"
                placeholder="Type patient name to search..."
              />
              
              {showDropdown && patientOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {patientOptions.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{patient.displayName}</div>
                      <div className="text-sm text-gray-500">
                        {patient.identifier}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedPatient && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <span className="text-blue-800">Selected: {selectedPatient.displayName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null)
                      setPatientId('')
                      setPatientQuery('')
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              <p className="mt-1 text-xs text-gray-500">Start typing to search for existing patients by name or username</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sample Type</label>
              <select value={sampleType} onChange={e => setSampleType(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded text-gray-900 bg-white">
                <option value="stool">Stool</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded text-gray-900 bg-white" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Microscopic Images</label>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-700" />
              <p className="mt-2 text-xs text-gray-500">Tip: capture high-contrast, focused images. Keep each file under 10MB if possible.</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                  {previews.map((p, i) => (
                    <div key={i} className="relative h-32 w-full rounded overflow-hidden">
                      <Image src={p} alt={`preview-${i}`} fill style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Uploading...' : 'Upload Images'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SampleCollectionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <SampleCollectionContent />
    </Suspense>
  )
}
