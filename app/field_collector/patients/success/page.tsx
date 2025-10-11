 'use client'

 import React, { useEffect, useState } from 'react'
 import { useRouter } from 'next/navigation'

 export default function PatientCreationSuccess() {
   const router = useRouter()
   const [creds, setCreds] = useState<{ username: string; otp: string } | null>(null)

   useEffect(() => {
     try {
       const raw = sessionStorage.getItem('newPatientCreds')
       if (!raw) {
         // nothing to show — go back to patients list
         router.replace('/field_collector/patients')
         return
       }

       const parsed = JSON.parse(raw)
       setCreds(parsed)

       // Clear after reading so OTP can't be re-opened later
       sessionStorage.removeItem('newPatientCreds')
     } catch (e) {
       console.error('Error reading newPatientCreds from sessionStorage', e)
       router.replace('/field_collector/patients')
     }
   }, [router])

   const copy = async (text: string) => {
     try {
       await navigator.clipboard.writeText(text)
       alert('Copied to clipboard')
     } catch (e) {
       console.warn('Clipboard copy failed', e)
       alert('Copy failed — please select and copy manually')
     }
   }

   if (!creds) {
     return null
   }

   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
         <h2 className="text-2xl font-bold mb-4">Patient Account Created</h2>
  <p className="mb-4 text-sm text-gray-600">Share these credentials with the patient — the one-time password is shown only once.</p>

   <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded">
           <div className="flex items-center justify-between mb-2">
             <div className="text-sm text-gray-500">Username</div>
             <button onClick={() => copy(creds.username)} className="text-xs text-blue-600 hover:underline">Copy</button>
           </div>
           <div className="text-lg font-mono text-gray-900 break-all">{creds.username}</div>
         </div>

         <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded">
           <div className="flex items-center justify-between mb-2">
             <div className="text-sm text-gray-500">One-time Password (shown once)</div>
             <button onClick={() => copy(creds.otp)} className="text-xs text-blue-600 hover:underline">Copy</button>
           </div>
           <div className="text-2xl font-semibold font-mono text-gray-900 tracking-wide break-all">{creds.otp}</div>
         </div>

         <div className="flex justify-end space-x-2">
           <button onClick={() => router.push('/field_collector/patients')} className="px-4 py-2 border rounded bg-white hover:bg-gray-50">Done</button>
         </div>
       </div>
     </div>
   )
 }
