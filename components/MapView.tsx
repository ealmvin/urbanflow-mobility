'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix icônes Leaflet avec webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TRANSPORT_STOPS = [
  { name: 'Gare de Lyon', lat: 48.8449, lng: 2.3735, type: 'train' },
  { name: 'Châtelet – Les Halles', lat: 48.8604, lng: 2.3469, type: 'metro' },
  { name: 'Gare du Nord', lat: 48.8809, lng: 2.3553, type: 'train' },
  { name: 'Saint-Lazare', lat: 48.8757, lng: 2.3249, type: 'train' },
  { name: 'La Défense', lat: 48.8918, lng: 2.2380, type: 'metro' },
  { name: 'Montparnasse', lat: 48.8408, lng: 2.3199, type: 'train' },
]

const TYPE_COLORS: Record<string, string> = {
  train: '#16a34a',
  metro: '#2563eb',
  bus: '#d97706',
}

interface MapViewProps {
  onStopClick?: (stop: { name: string; lat: number; lng: number }) => void
}

export default function MapView({ onStopClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Ref pour toujours avoir la dernière version du callback (évite le problème de closure)
  const onStopClickRef = useRef(onStopClick)

  useEffect(() => {
    onStopClickRef.current = onStopClick
  }, [onStopClick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([48.8566, 2.3522], 12)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    TRANSPORT_STOPS.forEach((stop) => {
      const color = TYPE_COLORS[stop.type] || '#6b7280'

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background:${color};
            width:32px;height:32px;
            border-radius:50%;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(map)

      marker.on('click', () => {
        // Utilise la ref pour toujours appeler la dernière version du callback
        onStopClickRef.current?.({ name: stop.name, lat: stop.lat, lng: stop.lng })
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // deps vide — la carte ne s'initialise qu'une fois

  return <div ref={containerRef} className="w-full h-full" />
}
