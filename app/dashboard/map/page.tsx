'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import DeparturesPanel from '@/components/DeparturesPanel'
import JourneyResults from '@/components/JourneyResults'
import AddressSearch from '@/components/AddressSearch'
import MapSidePanel from '@/components/MapSidePanel'
import DisruptionsBanner from '@/components/DisruptionsBanner'
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
  const [showJourneys, setShowJourneys] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [activeRoute, setActiveRoute] = useState<any | null>(null)
  const mapRef = useRef<{ setUserPosition: (lat: number, lng: number) => void } | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      const loggedIn = !!data.user
      setIsLoggedIn(loggedIn)
      // +5 pts à l'ouverture de la carte
      if (loggedIn) addPoints('open_map')
    })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleStopClick = useCallback((stop: StopInfo) => {
    if (!departureStop) {
      setDepartureStop(stop)
      showToast(`Départ : ${stop.name}`)
    } else if (!arrivalStop) {
      setArrivalStop(stop)
      setShowJourneys(false)
      showToast(`Destination : ${stop.name}`)
    } else {
      // Les deux sont déjà définis : remplacer la destination
      setArrivalStop(stop)
      setShowJourneys(false)
      showToast(`Nouvelle destination : ${stop.name}`)
    }
  }, [departureStop, arrivalStop])

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
    if (isLoggedIn) addPoints('calculate_route')
  }

  const handleSelectRoute = async (route: any) => {
    if (isLoggedIn) {
      await addPoints('plan_trip')
      showToast(`+20 pts — ${route.emoji} ${route.label} ✓`)
    } else {
      showToast(`${route.emoji} ${route.label} sélectionné`)
    }
  }

  const resetPlanner = () => {
    setDepartureStop(null)
    setArrivalStop(null)
    setShowJourneys(false)
    setSelecting(null)
    setActiveRoute(null)
  }

  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Header flottant */}
      {/* Header + planner avec dégradé vert → transparent */}
      <div className="absolute top-0 left-0 right-0 z-20" style={{ background: 'linear-gradient(180deg, rgba(11,31,18,0.95) 0%, rgba(11,31,18,0.95) 85%, rgba(11,31,18,0) 100%)', paddingBottom: '32px' }}>

        {/* Titre */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
          <Link
            href={isLoggedIn ? '/dashboard' : '/'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold text-white text-base">Planifier un trajet</span>
          {(departureStop || arrivalStop) ? (
            <button onClick={resetPlanner} className="text-xs text-white/60 hover:text-white transition px-3 py-1.5 rounded-full border border-white/20">
              Réinitialiser
            </button>
          ) : <div className="w-20" />}
        </div>

        {isLoggedIn === false && (
          <div className="mx-4 mb-2 rounded-xl bg-amber-500/20 border border-amber-400/30 px-3 py-2 flex items-center justify-between">
            <p className="text-xs text-amber-200">🏆 <span className="font-medium">Connecte-toi</span> pour gagner des points</p>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-xs text-amber-300 font-semibold">Connexion</Link>
              <Link href="/register" className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded-lg font-semibold">S'inscrire</Link>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="px-4 pb-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
            <AddressSearch
              placeholder="Adresse ou station de départ…"
              value={departureStop?.name ?? ''}
              color="green" gpsButton gpsLoading={gpsLoading} onGPS={handleGPS} dark
              onSelect={(place) => { setDepartureStop(place); setShowJourneys(false); showToast(`Départ : ${place.name}`) }}
              onClear={() => { setDepartureStop(null); setShowJourneys(false) }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
            <AddressSearch
              placeholder="Adresse ou station d'arrivée…"
              value={arrivalStop?.name ?? ''}
              color="red" dark
              onSelect={(place) => { setArrivalStop(place); setShowJourneys(false); showToast(`Destination : ${place.name}`) }}
              onClear={() => { setArrivalStop(null); setShowJourneys(false) }}
            />
          </div>
          {departureStop && arrivalStop && !showJourneys && (
            <button onClick={handlePlanTrip} className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-2.5 rounded-xl text-sm transition mt-1">
              🔍 Calculer les itinéraires
            </button>
          )}
        </div>

      </div>


      {/* Panel latéral — alertes + signalements */}
      <MapSidePanel />

      {/* Carte — plein écran, isolée dans son propre contexte d'empilement */}
      <div className="absolute inset-0" style={{ zIndex: 0, isolation: 'isolate' }}>
        <MapView
          onStopClick={handleStopClick}
          routeFrom={activeRoute && departureStop ? { lat: departureStop.lat, lng: departureStop.lng } : null}
          routeTo={activeRoute && arrivalStop ? { lat: arrivalStop.lat, lng: arrivalStop.lng } : null}
          routeType={activeRoute?.type}
        />

        {showJourneys && departureStop && arrivalStop && (
          <JourneyResults
            fromName={departureStop.name}
            toName={arrivalStop.name}
            fromLat={departureStop.lat}
            fromLng={departureStop.lng}
            toLat={arrivalStop.lat}
            toLng={arrivalStop.lng}
            onClose={() => { setShowJourneys(false); setActiveRoute(null) }}
            onSelectRoute={handleSelectRoute}
            onRouteActive={setActiveRoute}
          />
        )}
      </div>
    </div>
  )
}
