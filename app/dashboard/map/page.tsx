'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'

// Import dynamique pour éviter le SSR (Leaflet utilise window)
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapPage() {
  const [departure, setDeparture] = useState('')
  const [arrival, setArrival] = useState('')
  const [selecting, setSelecting] = useState<'departure' | 'arrival' | null>(null)

  const handleStopClick = (stop: { name: string }) => {
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
      {/* Header */}
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

      {/* Panneau de recherche */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Départ */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 flex-shrink-0" />
            <button
              onClick={() => setSelecting('departure')}
              className={`flex-1 text-left px-3 py-2 rounded-xl border text-sm transition ${
                selecting === 'departure'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {departure || (selecting === 'departure' ? 'Cliquez un arrêt sur la carte...' : 'Point de départ')}
            </button>
          </div>

          {/* Arrivée */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600 flex-shrink-0" />
            <button
              onClick={() => setSelecting('arrival')}
              className={`flex-1 text-left px-3 py-2 rounded-xl border text-sm transition ${
                selecting === 'arrival'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {arrival || (selecting === 'arrival' ? 'Cliquez un arrêt sur la carte...' : "Destination")}
            </button>
          </div>

          {/* Bouton rechercher */}
          {departure && arrival && (
            <button
              onClick={() => alert(`Itinéraire : ${departure} → ${arrival}\n(Intégration GTFS-RT à venir)`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-sm transition"
            >
              Trouver un itinéraire →
            </button>
          )}

          {selecting && (
            <p className="text-xs text-center text-gray-400">
              Cliquez sur un arrêt de transport sur la carte
            </p>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-20 bg-white rounded-xl shadow-md px-3 py-2 flex gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Train
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Métro
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" /> Bus
        </span>
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        <MapView onStopClick={handleStopClick} />
      </div>
    </div>
  )
}
