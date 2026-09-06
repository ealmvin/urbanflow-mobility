'use client'

import { useEffect, useState } from 'react'

interface Disruption {
  id: string
  title: string
  line: string
  level: 'info' | 'warning' | 'critical'
}

interface Report {
  id: string
  description: string
  type: string
  address?: string
  created_at: string
}

const LEVEL_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
}
const LEVEL_BG: Record<string, string> = {
  info: 'rgba(59,130,246,0.12)',
  warning: 'rgba(245,158,11,0.12)',
  critical: 'rgba(239,68,68,0.12)',
}
const LEVEL_ICONS: Record<string, string> = {
  info: 'ℹ️', warning: '⚠️', critical: '🚨',
}

export default function MapSidePanel() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [reports, setReports] = useState<Report[]>([])

  const fetchAll = () => {
    fetch('/api/disruptions')
      .then(r => r.json())
      .then(d => setDisruptions(d.disruptions ?? []))
      .catch(() => {})

    fetch('/api/reports')
      .then(r => r.json())
      .then(d => setReports((d.reports ?? []).slice(0, 5)))
      .catch(() => {})
  }

  useEffect(() => {
    fetchAll()
    // Rafraîchir toutes les 15 secondes pour voir les nouveaux signalements
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute right-0 top-0 bottom-0 z-10 flex items-start pr-3 pointer-events-none" style={{ paddingTop: '180px' }}>
      <div className="pointer-events-auto" style={{ width: '164px' }}>

        <div
          className="rounded-2xl overflow-hidden flex flex-col gap-px"
          style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
            {/* Perturbations */}
            {disruptions.length > 0 && (
              <div className="px-3 py-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">⚠️ Perturbations</p>
                <div className="flex flex-col gap-1.5">
                  {disruptions.slice(0, 4).map(d => (
                    <div key={d.id} className="rounded-lg px-2 py-1.5" style={{ background: LEVEL_BG[d.level] }}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px]">{LEVEL_ICONS[d.level]}</span>
                        <span className="text-[10px] font-bold" style={{ color: LEVEL_COLORS[d.level] }}>{d.line}</span>
                      </div>
                      <p className="text-[11px] text-gray-700 leading-tight line-clamp-2">{d.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Séparateur */}
            {disruptions.length > 0 && reports.length > 0 && (
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 12px' }} />
            )}

            {/* Signalements */}
            <div className="px-3 py-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">📢 Signalements</p>
              {reports.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">Aucun signalement récent</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {reports.map(r => (
                    <div key={r.id} className="rounded-lg px-2 py-1.5" style={{ background: 'rgba(22,163,74,0.08)' }}>
                      <p className="text-[11px] text-gray-700 leading-tight line-clamp-2">{r.description}</p>
                      {r.address && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">📍 {r.address}</p>}
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
