'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

// couleur du tracé selon le mode de transport
const ROUTE_COLORS: Record<string, string> = {
  walk: '#6b7280',
  velo: '#16a34a',
  trottinette: '#84cc16',
  transit: '#2563eb',
  train: '#7c3aed',
  carpool: '#f97316',
  default: '#16a34a',
}

function makePin(color: string, emoji: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${color};width:36px;height:36px;
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.35);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:16px">${emoji}</span>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

interface Coord { lat: number; lng: number }

interface MapViewProps {
  onStopClick?: (stop: { name: string; lat: number; lng: number }) => void
  routeFrom?: Coord | null
  routeTo?: Coord | null
  routeType?: string
}

export default function MapView({ onStopClick, routeFrom, routeTo, routeType }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onStopClickRef = useRef(onStopClick)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => { onStopClickRef.current = onStopClick }, [onStopClick])

  // Initialisation carte
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([48.8566, 2.3522], 12)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    routeLayerRef.current = L.layerGroup().addTo(map)

    TRANSPORT_STOPS.forEach((stop) => {
      const color = TYPE_COLORS[stop.type] || '#6b7280'
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background:${color};width:32px;height:32px;
            border-radius:50%;border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.3);
            display:flex;align-items:center;justify-content:center;cursor:pointer;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(map)
      marker.on('click', () => {
        onStopClickRef.current?.({ name: stop.name, lat: stop.lat, lng: stop.lng })
      })
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Tracé de l'itinéraire quand routeFrom/routeTo changent
  useEffect(() => {
    const map = mapRef.current
    const layer = routeLayerRef.current
    if (!map || !layer) return

    // Nettoyage
    layer.clearLayers()

    if (!routeFrom || !routeTo) return

    const color = ROUTE_COLORS[routeType ?? 'default'] ?? ROUTE_COLORS.default
    const isWalking = routeType === 'walk'
    const isBike = routeType === 'velo' || routeType === 'trottinette'
    const osrmMode = isBike ? 'bike' : isWalking ? 'foot' : null

    // Marqueurs départ / arrivée
    layer.addLayer(L.marker([routeFrom.lat, routeFrom.lng], { icon: makePin('#16a34a', '🟢') }))
    layer.addLayer(L.marker([routeTo.lat, routeTo.lng], { icon: makePin('#dc2626', '📍') }))

    if (osrmMode) {
      // Tracé réel via OSRM (gratuit, pas de clé)
      fetch(
        `https://router.project-osrm.org/route/v1/${osrmMode === 'foot' ? 'walking' : 'cycling'}/${routeFrom.lng},${routeFrom.lat};${routeTo.lng},${routeTo.lat}?overview=full&geometries=geojson`
      )
        .then(r => r.json())
        .then(data => {
          if (!data.routes?.[0]) return
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          )
          layer.addLayer(
            L.polyline(coords, { color, weight: 5, opacity: 0.85, lineJoin: 'round' })
          )
          map.fitBounds(L.polyline(coords).getBounds(), { padding: [40, 40] })
        })
        .catch(() => {
          // fallback ligne droite
          drawFallback(layer, map, routeFrom, routeTo, color, false)
        })
    } else {
      // Transit / train / covoiturage → ligne droite animée (pas de vraie route disponible)
      drawFallback(layer, map, routeFrom, routeTo, color, true)
    }
  }, [routeFrom, routeTo, routeType])

  return <div ref={containerRef} className="w-full h-full" />
}

function drawFallback(
  layer: L.LayerGroup,
  map: L.Map,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  color: string,
  dashed: boolean
) {
  const line = L.polyline(
    [[from.lat, from.lng], [to.lat, to.lng]],
    {
      color,
      weight: 4,
      opacity: 0.7,
      dashArray: dashed ? '10, 8' : undefined,
      lineJoin: 'round',
    }
  )
  layer.addLayer(line)
  map.fitBounds(line.getBounds(), { padding: [40, 40] })
}
