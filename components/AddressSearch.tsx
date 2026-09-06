'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Place {
  id: string | number
  name: string
  type: 'stop' | 'address'
  lat: number
  lng: number
}

interface Props {
  placeholder: string
  value: string
  onSelect: (place: { name: string; lat: number; lng: number }) => void
  onClear: () => void
  color?: 'green' | 'red'
  gpsButton?: boolean
  onGPS?: () => void
  gpsLoading?: boolean
  dark?: boolean
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function AddressSearch({
  placeholder, value, onSelect, onClear,
  color = 'green', gpsButton, onGPS, gpsLoading, dark = false,
}: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Si une valeur est sélectée, afficher son nom dans l'input
  const displayValue = value || query

  useEffect(() => {
    if (!value) setQuery('')
  }, [value])

  useEffect(() => {
    if (debouncedQuery.length < 2 || value) {
      setResults([])
      return
    }
    setLoading(true)
    fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(d => {
        setResults(d.places ?? [])
        setOpen(true)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery, value])

  const handleSelect = (place: Place) => {
    onSelect({ name: place.name, lat: place.lat, lng: place.lng })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    onClear()
    inputRef.current?.focus()
  }

  const inputBase = dark
    ? `w-full px-3 py-2.5 rounded-xl border text-sm transition outline-none bg-white/10 placeholder-white/40 text-white`
    : `w-full px-3 py-2 rounded-xl border text-sm transition outline-none`

  const inputIdle = dark ? 'border-white/15 hover:border-white/30' : 'border-gray-200 hover:border-gray-300 text-gray-700'
  const inputSelected = dark
    ? (color === 'green' ? 'border-green-400/50 bg-green-500/15 font-medium text-white' : 'border-red-400/50 bg-red-500/15 font-medium text-white')
    : (color === 'green' ? 'border-green-500 bg-green-50 font-medium text-green-800' : 'border-red-400 bg-red-50 font-medium text-red-800')

  return (
    <div className="relative flex items-center gap-2 flex-1">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value ? value : query}
          onChange={(e) => {
            if (value) { onClear(); setQuery(e.target.value) }
            else setQuery(e.target.value)
          }}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder={placeholder}
          className={`${inputBase} ${value ? inputSelected : inputIdle}`}
        />

        {/* Icône loupe ou spinner */}
        {!value && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? 'text-white/30' : 'text-gray-300'}`}>
            {loading
              ? <div className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-white/40' : 'border-gray-300'}`} />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            }
          </div>
        )}

        {/* Bouton effacer */}
        {value && (
          <button
            onClick={handleClear}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full ${dark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        )}

        {/* Dropdown résultats */}
        {open && results.length > 0 && !value && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[2000] overflow-hidden">
            {results.map((place) => (
              <button
                key={place.id}
                onClick={() => handleSelect(place)}
                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0 transition"
              >
                <span className="text-sm flex-shrink-0">{place.type === 'stop' ? '🚉' : '📍'}</span>
                <span className="text-sm text-gray-800 truncate">{place.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bouton GPS (départ uniquement) */}
      {gpsButton && (
        <button
          onClick={onGPS}
          disabled={gpsLoading}
          title="Utiliser ma position GPS"
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition flex-shrink-0 disabled:opacity-50 ${
            dark
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
          }`}
        >
          {gpsLoading
            ? <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-white/60' : 'border-blue-500'}`} />
            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          }
        </button>
      )}
    </div>
  )
}
