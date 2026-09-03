'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import DeparturesPanel from '@/components/DeparturesPanel'
import JourneyResults from '@/components/JourneyResults'
import DisruptionsBanner from '@/components/DisruptionsBanner'
import AddressSearch from '@/components/AddressSearch'
import { createBrowserClient } from '@supabase/ssr'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

interface StopInfo {
  name: string
  lat: number
  lng: number
}

async function addPoints(action: string) {
  await fetch('/api/points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
}

export default function MapPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [departureStop, setDepartureStop] = useState<StopInfo | null>(null)
  const [arrivalStop, setArrivalStop] = useState<StopInfo | null>(null)
  const [selecting, setSelecting] = useState<'departure' | 'arrival' | null>(null)
  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const [showJourneys, setShowJourneys] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const mapRef = useRef<{ setUserPosition: (lat: number, lng: number) => void } | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleStopClick = useCallback((stop: StopInfo) => {
    if (selecting === 'departure') {
      setDepartureStop(stop)
      setSelecting('arrival')
      showToast(`Départ : ${stop.name}`)
    } else if (selecting === 'arrival') {
      setArrivalStop(stop)
      setSelecting(null)
      showToast(`Destination : ${stop.name}`)
    } else {
      setSelectedStop(stop.name)
      addPoints('view_departures')
      showToast('+5 pts — Consulter les départs 🚇')
    }
  }, [selecting])

  const handleGPS = () => {
    if (!navigator.geolocation) {
      showToast('Géolocalisation non disponible')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const stop: StopInfo = {
          name: 'Ma position 📍',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        setDepartureStop(stop)
        setSelecting('arrival')
        setGpsLoading(false)
        showToast('Position GPS détectée ✓')
      },
      () => {
        setGpsLoading(false)
        showToast('Impossible d\'accéder à ta position')
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const handlePlanTrip = () => {
    if (!departureStop || !arrivalStop) return
    setShowJourneys(true)
    setSelectedStop(null)
  }

  const handleSelectRoute = async (route: any) => {
    await addPoints('plan_trip')
    showToast(`+${route.points} pts — ${route.emoji} ${route.label} ✓`)
  }

  const resetPlanner = () => {
    setDepartureStop(null)
    setArrivalStop(null)
    setShowJourneys(false)
    setSelecting(null)
    setSelectedStop(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">Planifier un trajet</span>
        </div>
        {(departureStop || arrivalStop) && (
          <button onClick={resetPlanner} className="text-xs text-gray-400 hover:text-red-500 transition">
            Réinitialiser
          </button>
        )}
      </header>

      {/* Alertes perturbations */}
      <DisruptionsBanner />

      {/* Banner non connecté */}
      {isLoggedIn === false && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-amber-800">
            🏆 <span className="font-medium">Connecte-toi</span> pour gagner des points à chaque trajet
          </p>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-xs text-amber-700 font-semibold hover:underline">Connexion</Link>
            <span className="text-amber-300">·</span>
            <Link href="/register" className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-semibold transition">S'inscrire</Link>
          </div>
        </div>
      )}

      {/* Planificateur */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Départ avec recherche + GPS */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 flex-shrink-0" />
            <AddressSearch
              placeholder="Adresse ou station de départ…"
              value={departureStop?.name ?? ''}
              color="green"
              gpsButton
              gpsLoading={gpsLoading}
              onGPS={handleGPS}
              onSelect={(place) => {
                setDepartureStop(place)
                setShowJourneys(false)
                showToast(`Départ : ${place.name}`)
              }}
              onClear={() => { setDepartureStop(null); setShowJourneys(false) }}
            />
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600 flex-shrink-0" />
            <AddressSearch
              placeholder="Adresse ou station d'arrivée…"
              value={arrivalStop?.name ?? ''}
              color="red"
              onSelect={(place) => {
                setArrivalStop(place)
                setShowJourneys(false)
                showToast(`Destination : ${place.name}`)
              }}
              onClear={() => { setArrivalStop(null); setShowJourneys(false) }}
            />
            <div className="w-0" />
          </div>

          <p className="text-xs text-center text-gray-400">
            Tapez une adresse ou cliquez un arrêt sur la carte
          </p>

          {departureStop && arrivalStop && !showJourneys && (
            <button
              onClick={handlePlanTrip}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
            >
              🔍 Calculer les itinéraires multimodaux
            </button>
          )}
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        <MapView onStopClick={handleStopClick} />

        {selectedStop && !showJourneys && (
          <DeparturesPanel
            stopName={selectedStop}
            onClose={() => setSelectedStop(null)}
          />
        )}

        {showJourneys && departureStop && arrivalStop && (
          <JourneyResults
            fromName={departureStop.name}
            toName={arrivalStop.name}
            fromLat={departureStop.lat}
            fromLng={departureStop.lng}
            toLat={arrivalStop.lat}
            toLng={arrivalStop.lng}
            onClose={() => setShowJourneys(false)}
            onSelectRoute={handleSelectRoute}
          />
        )}
      </div>
    </div>
  )
}
