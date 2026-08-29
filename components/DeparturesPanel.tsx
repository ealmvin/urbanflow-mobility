'use client'

import { useEffect, useState, useCallback } from 'react'

interface Departure {
  id: string
  line: string
  lineColor: string
  direction: string
  scheduledTime: string
  minutesUntil: number
  delay: number
  platform: string
  type: string
  isRealtime: boolean
}

interface DeparturesPanelProps {
  stopName: string
  onClose: () => void
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'metro': return '🚇'
    case 'rer': return '🚊'
    case 'tram': return '🚋'
    case 'bus': return '🚌'
    default: return '🚄'
  }
}

export default function DeparturesPanel({ stopName, onClose }: DeparturesPanelProps) {
  const [departures, setDepartures] = useState<Departure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchDepartures = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/departures?station=${encodeURIComponent(stopName)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDepartures(data.departures ?? [])
      setLastUpdate(new Date())
      setError('')
    } catch (e: any) {
      setError('Données indisponibles')
    } finally {
      setLoading(false)
    }
  }, [stopName])

  useEffect(() => {
    fetchDepartures()
    const interval = setInterval(fetchDepartures, 30000)
    return () => clearInterval(interval)
  }, [fetchDepartures])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl max-h-[60vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900 text-base">{stopName}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="text-xs text-gray-400">
              Temps réel · {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button onClick={fetchDepartures} className="text-xs text-green-600 hover:underline ml-1">
              Actualiser
            </button>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
          ✕
        </button>
      </div>

      {/* Contenu */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
        {loading && (
          <div className="p-8 text-center text-gray-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2" />
            Chargement des départs...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && departures.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun départ dans l'heure</div>
        )}

        {!loading && departures.map((dep) => (
          <div key={dep.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
            {/* Badge ligne */}
            <div
              className="flex-shrink-0 px-2 py-1 rounded-lg text-white text-xs font-bold min-w-[44px] text-center leading-tight"
              style={{ backgroundColor: dep.lineColor }}
            >
              {dep.line}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getTypeIcon(dep.type)} {dep.direction}
              </p>
              <div className="flex items-center gap-2">
                {dep.platform && (
                  <p className="text-xs text-gray-400 truncate">{dep.platform}</p>
                )}
                {dep.isRealtime && (
                  <span className="text-xs text-green-500 font-medium">● RT</span>
                )}
              </div>
            </div>

            {/* Temps */}
            <div className="flex-shrink-0 text-right">
              {dep.minutesUntil === 0 ? (
                <span className="text-green-600 font-bold text-sm">À quai</span>
              ) : (
                <span className={`font-bold text-sm ${dep.delay > 0 ? 'text-orange-500' : 'text-gray-900'}`}>
                  {dep.minutesUntil} min
                </span>
              )}
              <p className="text-xs text-gray-400">{dep.scheduledTime}</p>
              {dep.delay > 0 && (
                <p className="text-xs text-orange-400">+{dep.delay} min</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
