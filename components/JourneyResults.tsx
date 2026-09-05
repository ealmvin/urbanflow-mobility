'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Step {
  type: 'walk' | 'transit' | 'bike' | 'scooter' | 'car'
  label?: string
  line?: string
  lineColor?: string
  mode?: string
  direction?: string
  from?: string
  to?: string
  departureTime?: string
  arrivalTime?: string
  durationMin: number
  distance?: string
  nbStops?: number | null
}

interface Route {
  id: string
  type: string
  label: string
  emoji: string
  color: string
  durationMin: number
  departureTime: string
  arrivalTime: string
  distanceKm: number
  co2Kg: number
  co2SavedKg: number
  price: string
  points: number
  steps: Step[]
  summarySegments?: any[]
  nearbyStations?: { name: string; available: number; dist: number }[]
  isRealtime: boolean
  redirectTo?: string
  driverRating?: number
  driverTrips?: number
  seatsLeft?: number
}

interface Props {
  fromName: string
  toName: string
  fromLat: number
  fromLng: number
  toLat: number
  toLng: number
  onClose: () => void
  onSelectRoute: (route: Route) => void
}

function StepIcon({ type, lineColor }: { type: string; lineColor?: string }) {
  if (type === 'walk') return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">🚶</div>
  if (type === 'bike') return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">🚲</div>
  if (type === 'scooter') return <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-sm">🛴</div>
  if (type === 'car') return <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">🚗</div>
  if (type === 'transit') return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: lineColor || '#6b7280' }}>
      <span className="text-white text-xs">🚇</span>
    </div>
  )
  return null
}

function SummaryPill({ seg }: { seg: any }) {
  if (seg.type === 'walk') return <span className="text-gray-400 text-xs">🚶{seg.duration}min</span>
  if (seg.type === 'bike') return <span className="text-green-600 text-xs font-medium">🚲{seg.duration}min</span>
  if (seg.type === 'scooter') return <span className="text-lime-600 text-xs font-medium">🛴{seg.duration}min</span>
  if (seg.type === 'car') return <span className="text-orange-600 text-xs font-medium">🚗{seg.duration}min</span>
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-white text-xs font-bold"
      style={{ backgroundColor: seg.color || '#6b7280' }}
    >
      {seg.line || '?'}
    </span>
  )
}

export default function JourneyResults({ fromName, toName, fromLat, fromLng, toLat, toLng, onClose, onSelectRoute }: Props) {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [distanceKm, setDistanceKm] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchStartY = useRef(0)
  const router = useRouter()

  // ── Touch (mobile) ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) setDragY(delta)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
    if (dragY > 100) setMinimized(true)
    setDragY(0)
  }, [dragY])

  // ── Mouse (desktop) ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartY.current = e.clientY
    setDragging(true)

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientY - touchStartY.current
      if (delta > 0) setDragY(delta)
    }
    const onUp = (ev: MouseEvent) => {
      setDragging(false)
      const delta = ev.clientY - touchStartY.current
      if (delta > 100) setMinimized(true)
      setDragY(0)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/journeys?from=${fromLat},${fromLng}&to=${toLat},${toLng}&fromName=${encodeURIComponent(fromName)}&toName=${encodeURIComponent(toName)}`)
      .then(r => r.json())
      .then(data => {
        setRoutes(data.routes ?? [])
        setDistanceKm(data.distanceKm ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [fromLat, fromLng, toLat, toLng, fromName, toName])

  // État minimisé : petit tab en bas
  if (minimized) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl cursor-pointer"
        onClick={() => setMinimized(false)}
      >
        {/* Poignée */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-4 pb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{routes.length} itinéraires · {distanceKm} km</p>
            <p className="font-semibold text-gray-900 text-sm">{fromName} → {toName}</p>
          </div>
          <div className="text-green-600 text-sm font-medium flex items-center gap-1">
            Voir ↑
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
      style={{
        transform: `translateY(${dragY}px)`,
        transition: dragging ? 'none' : 'transform 0.3s ease',
      }}
    >
      {/* Header draggable (poignée + titre + boutons) */}
      <div
        className="px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0 select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Pill */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400">Itinéraires · {distanceKm} km · <span className="text-gray-400">glissez pour réduire</span></p>
            <h2 className="font-bold text-gray-900 leading-tight">
              {fromName} <span className="text-gray-400 font-normal">→</span> {toName}
            </h2>
          </div>
          <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
            <button
              onClick={() => setMinimized(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Réduire"
            >
              Réduire ↓
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-sm">✕</button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {loading && (
          <div className="py-10 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-400">Calcul des itinéraires multimodaux...</p>
          </div>
        )}

        {!loading && routes.map((route) => {
          const isExpanded = expandedId === route.id

          // Carte spéciale covoiturage → redirection vers la plateforme
          if (route.type === 'carpool_platform') {
            return (
              <div key={route.id} className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚗</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Covoiturage UrbanFlow</p>
                        <p className="text-xs text-orange-600 font-medium">Plateforme communautaire</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{route.durationMin} min</p>
                      <p className="text-xs text-gray-400">estimé</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-green-600 font-medium">🌿 -{route.co2SavedKg} kg CO₂ · {route.price}</span>
                    <div className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-orange-500">
                      +{route.points} pts
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/covoiturage')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                  >
                    Voir les trajets disponibles
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={route.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${isExpanded ? 'border-green-500' : 'border-gray-100'}`}>
              {/* Card header — toujours visible */}
              <button
                className="w-full text-left p-4 hover:bg-gray-50 transition"
                onClick={() => {
                  const next = isExpanded ? null : route.id
                  setExpandedId(next)
                  if (next) onSelectRoute(route)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{route.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{route.label}</p>
                      {route.isRealtime && route.type === 'train' && (
                        <span className="text-xs text-red-500 font-medium">● Données SNCF temps réel</span>
                      )}
                      {route.isRealtime && route.type === 'transit' && (
                        <span className="text-xs text-green-500">● Temps réel IDFM</span>
                      )}
                      {route.type === 'carpool' && route.driverRating && (
                        <span className="text-xs text-blue-500">
                          ★ {route.driverRating} · {route.driverTrips} trajets · {route.seatsLeft} place{route.seatsLeft! > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{route.durationMin} min</p>
                      {route.departureTime !== '--' && (
                        <p className="text-xs text-gray-400">{route.departureTime} → {route.arrivalTime}</p>
                      )}
                    </div>
                    <span className="text-gray-300 text-lg">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Résumé segments */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {(route.summarySegments ?? []).map((seg: any, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-gray-300">›</span>}
                      <SummaryPill seg={seg} />
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-green-600 font-medium">🌿 -{route.co2SavedKg} kg CO₂</span>
                    <span className="text-xs text-gray-400">{route.price}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: route.color }}>
                    +{route.points} pts
                  </div>
                </div>
              </button>

              {/* Bouton réservation Vélib / Lime */}
              {isExpanded && (route.type === 'velo' || route.type === 'trottinette') && (
                <div className="px-4 pb-3 bg-white border-t border-gray-100">
                  <a
                    href={route.type === 'velo'
                      ? 'https://www.velib-metropole.fr/map'
                      : 'https://www.li.me/fr-fr'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition"
                    style={{ backgroundColor: route.color }}
                  >
                    {route.type === 'velo' ? '🚲 Réserver un Vélib' : '🛴 Trouver une trottinette Lime'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Bouton réservation BlaBlaCar */}
              {isExpanded && route.type === 'carpool' && (
                <div className="px-4 pb-3 bg-white border-t border-gray-100">
                  <a
                    href="https://www.blablacar.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition"
                    style={{ backgroundColor: '#00b2d5' }}
                  >
                    🚗 Réserver sur BlaBlaCar
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Étapes détaillées */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-0">
                  {route.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      {/* Ligne verticale + icône */}
                      <div className="flex flex-col items-center">
                        <StepIcon type={step.type} lineColor={step.lineColor} />
                        {i < route.steps.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 20 }} />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 pb-4">
                        {step.type === 'transit' ? (
                          <>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className="px-2 py-0.5 rounded text-white text-xs font-bold"
                                style={{ backgroundColor: step.lineColor }}
                              >
                                {step.line}
                              </span>
                              <span className="text-xs text-gray-500">{step.mode}</span>
                              {step.departureTime && (
                                <span className="text-xs text-gray-400 ml-auto">{step.departureTime}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate">{step.from}</p>
                            <p className="text-xs text-gray-500">
                              Direction <span className="font-medium">{step.direction}</span>
                              {step.nbStops && ` · ${step.nbStops} arrêt${step.nbStops > 1 ? 's' : ''}`}
                              {` · ${step.durationMin} min`}
                            </p>
                            {step.to && (
                              <p className="text-xs text-gray-400 mt-0.5">↓ Descendre à <span className="font-medium text-gray-600">{step.to}</span></p>
                            )}
                            {step.arrivalTime && (
                              <p className="text-xs text-gray-400">{step.arrivalTime}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              {step.label || (step.type === 'walk' ? 'Marche' : step.type)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {step.distance && `${step.distance} · `}{step.durationMin} min
                            </p>
                            {step.to && <p className="text-xs text-gray-400">↓ {step.to}</p>}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Arrivée */}
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{toName}</p>
                      {route.arrivalTime !== '--' && (
                        <p className="text-xs text-gray-400">Arrivée prévue à {route.arrivalTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Stations Vélib */}
                  {route.nearbyStations && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Stations Vélib à proximité</p>
                      {route.nearbyStations.map((s) => (
                        <div key={s.name} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">📍 {s.name}</span>
                          <span className={s.available > 2 ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                            {s.available} vélos · {s.dist}m
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
