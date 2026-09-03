'use client'

import { useEffect, useState } from 'react'

interface Disruption {
  id: string
  title: string
  line: string
  level: 'info' | 'warning' | 'critical'
  severity: string
}

export default function DisruptionsBanner() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/disruptions')
      .then(r => r.json())
      .then(d => setDisruptions(d.disruptions ?? []))
      .catch(() => {})
  }, [])

  // Rotation automatique toutes les 5s
  useEffect(() => {
    if (disruptions.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % disruptions.length), 5000)
    return () => clearInterval(t)
  }, [disruptions])

  if (dismissed || disruptions.length === 0) return null

  const d = disruptions[current]

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    critical: 'bg-red-50 border-red-300 text-red-900',
  }
  const icons = { info: 'ℹ️', warning: '⚠️', critical: '🚨' }

  return (
    <div className={`border-b px-4 py-2 flex items-center justify-between gap-2 transition-all ${colors[d.level]}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base flex-shrink-0">{icons[d.level]}</span>
        <div className="min-w-0">
          <span className="text-xs font-semibold mr-1">{d.line}</span>
          <span className="text-xs truncate">{d.title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {disruptions.length > 1 && (
          <span className="text-xs opacity-60">{current + 1}/{disruptions.length}</span>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-xs opacity-50 hover:opacity-100 transition w-5 h-5 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
