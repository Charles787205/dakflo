 'use client'

 import React, { useEffect, useState } from 'react'
 import { useRouter } from 'next/navigation'

 export default function PatientCreationSuccess() {
   const router = useRouter()
   const [creds, setCreds] = useState<{ username: string; otp: string } | null>(null)
   const [debugInfo, setDebugInfo] = useState<string>('')
   const [isLoading, setIsLoading] = useState(true)

   useEffect(() => {
     // Add a small delay to prevent immediate redirect in case of timing issues
     const timer = setTimeout(() => {
       try {
         const raw = sessionStorage.getItem('newPatientCreds')
         console.log('Raw sessionStorage data:', raw)
         setDebugInfo(`SessionStorage content: ${raw || 'null'}`)
         
         if (!raw) {
           // Add longer delay before redirect to debug
           console.log('No credentials found, will redirect in 3 seconds...')
           setDebugInfo('No credentials found in sessionStorage. Redirecting in 3 seconds...')
           setTimeout(() => {
             router.replace('/field_collector/patients')
           }, 3000)
           setIsLoading(false)
           return
         }

         const parsed = JSON.parse(raw)
         console.log('Parsed credentials:', parsed)
         setCreds(parsed)
         setIsLoading(false)

         // Don't clear immediately - wait for user to acknowledge
         // sessionStorage.removeItem('newPatientCreds')
       } catch (e) {
         console.error('Error reading newPatientCreds from sessionStorage', e)
         setDebugInfo(`Error reading credentials: ${e}`)
         setTimeout(() => {
           router.replace('/field_collector/patients')
         }, 3000)
         setIsLoading(false)
       }
     }, 100) // Small delay to ensure sessionStorage is ready

     return () => clearTimeout(timer)
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

   const handleDone = () => {
     // Clear credentials when user explicitly clicks Done
     sessionStorage.removeItem('newPatientCreds')
     router.push('/field_collector/patients')
   }

   if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
           <h2 className="text-2xl font-bold mb-4">Loading...</h2>
           <p className="text-sm text-gray-600">{debugInfo}</p>
         </div>
       </div>
     )
   }

   if (!creds) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
           <h2 className="text-2xl font-bold mb-4 text-red-600">No Credentials Found</h2>
           <p className="text-sm text-gray-600 mb-4">{debugInfo}</p>
           <button 
             onClick={() => router.push('/field_collector/patients')} 
             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
           >
             Go to Patients List
           </button>
         </div>
       </div>
     )
   }

   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
         <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Patient Account Created</h2>
         <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
           <p className="text-sm text-yellow-800 font-semibold">⚠️ IMPORTANT: Copy these credentials now!</p>
           <p className="text-xs text-yellow-700">The one-time password will not be shown again.</p>
         </div>

   <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded">
           <div className="flex items-center justify-between mb-2">
             <div className="text-sm text-gray-500">Username</div>
             <button onClick={() => copy(creds.username)} className="text-xs text-blue-600 hover:underline">Copy</button>
           </div>
           <div className="text-lg font-mono text-gray-900 break-all">{creds.username}</div>
         </div>

         <div className="mb-6 bg-red-50 border-2 border-red-200 p-4 rounded">
           <div className="flex items-center justify-between mb-2">
             <div className="text-sm font-semibold text-red-600">One-time Password (COPY NOW!)</div>
             <button onClick={() => copy(creds.otp)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Copy OTP</button>
           </div>
           <div className="text-3xl font-bold font-mono text-red-800 tracking-wider break-all bg-white p-2 rounded border">{creds.otp}</div>
         </div>

         <div className="space-y-3">
           <div className="flex justify-between space-x-2">
             <button 
               onClick={() => copy(`Username: ${creds.username}\nPassword: ${creds.otp}`)} 
               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
             >
               Copy Both
             </button>
             <button onClick={handleDone} className="px-4 py-2 border rounded bg-white hover:bg-gray-50">Done</button>
           </div>
           
           <button 
             onClick={() => router.push('/field_collector/patients')} 
             className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
           >
             📋 Go to Patients List
           </button>
         </div>
       </div>
     </div>
   )
 }
