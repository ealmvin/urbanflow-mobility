'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useEffect, useState } from 'react'

interface DayData {
  day: string
  co2: number
}

function generateWeekData(totalCo2: number, tripsCount: number): DayData[] {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const today = new Date().getDay() // 0=dim
  const todayIdx = today === 0 ? 6 : today - 1

  // Distribuer le CO2 total sur les 7 derniers jours de façon réaliste
  const weights = [0.1, 0.18, 0.15, 0.2, 0.17, 0.12, 0.08]
  const basePerTrip = tripsCount > 0 ? totalCo2 / tripsCount : 1.2

  return days.map((d, i) => {
    const offset = (i - todayIdx + 7) % 7
    const isFuture = offset > 0 && offset < 7 && i !== todayIdx
    const co2 = isFuture ? 0 : Math.round(weights[i] * totalCo2 * 10) / 10
    return { day: d, co2 }
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-green-600">🌿 {payload[0].value} kg CO₂ économisé</p>
      </div>
    )
  }
  return null
}

export default function Co2Chart({
  totalCo2,
  tripsCount,
}: {
  totalCo2: number
  tripsCount: number
}) {
  const [data, setData] = useState<DayData[]>([])

  useEffect(() => {
    setData(generateWeekData(totalCo2, tripsCount))
  }, [totalCo2, tripsCount])

  const todayIdx = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Impact CO₂ cette semaine</h3>
          <p className="text-xs text-gray-400">kg de CO₂ économisé par rapport à la voiture solo</p>
        </div>
        <span className="text-2xl font-bold text-green-600">-{totalCo2.toFixed(1)} kg</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={28}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="co2" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === todayIdx ? '#16a34a' : '#bbf7d0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block"/>Aujourd'hui</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-200 inline-block"/>Cette semaine</span>
      </div>
    </div>
  )
}
