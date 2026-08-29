'use client'

import dynamic from 'next/dynamic'

import { useState } from 'react'

import Link from 'next/link'

import DeparturesPanel from '@/components/DeparturesPanel'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapPage() {

  const [departure, setDeparture] = useState('')

  const [arrival, setArrival] = useState('')

  const [selecting, setSelecting] = useState<'departure' | 'arrival' | null>(null)

  const [selectedStop, setSelectedStop] = useState<string | null>(null)

  const handleStopClick = (stop: { name: string }) => {

    setSelectedStop(stop.name)

    if (selecting === 'departure') {

      setDeparture(stop.name)

      setSelecting('arrival')

    } else if (selecting === 'arrival') {

      setArrival(stop.name)

      setSelecting(null)

    }

  }

  return (

    <div className="flex flex-col h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">

        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">

          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">

            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />

          </svg>

        </Link>

        <div className="flex items-center gap-2">

          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">

            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />

            </svg>

          </div>

          <span className="font-bold text-gray-900">Planifier un trajet</span>

        </div>

      </header>

      <div className="bg-white border-b border-gray-200 px-4 py-3 z-10 shadow-sm">

        <div className="max-w-2xl mx-auto space-y-2">

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 flex-shrink-0" />

            <button

              onClick={() => { setSelecting('departure'); setSelectedStop(null) }}

              className={`flex-1 text-left px-3 py-2 rounded-xl border text-sm transition ${

                selecting === 'departure' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'

              }`}

            >

              {departure || (selecting === 'departure' ? 'Cliquez un arrêt sur la carte...' : 'Point de départ')}

            </button>

          </div>

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600 flex-shrink-0" />

            <button

              onClick={() => { setSelecting('arrival'); setSelectedStop(null) }}

              className={`flex-1 text-left px-3 py-2 rounded-xl border text-sm transition ${

                selecting === 'arrival' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'

              }`}

            >

              {arrival || (selecting === 'arrival' ? 'Cliquez un arrêt sur la carte...' : 'Destination')}

            </button>

          </div>

          {departure && arrival && (

            <button

              onClick={() => alert(`Itinéraire : ${departure} → ${arrival}`)}

              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-sm transition"

            >

              Trouver un itinéraire →

            </button>

          )}

        </div>

      </div>

      <div className="flex-1 relative">

        <MapView onStopClick={handleStopClick} />

        {selectedStop && (

          <DeparturesPanel

            stopName={selectedStop}

            onClose={() => setSelectedStop(null)}

          />

        )}

      </div>

    </div>

  )

}
