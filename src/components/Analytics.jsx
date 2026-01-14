"use client"

import { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"

export default function Analytics({ logs }) {
  const analytics = useMemo(() => {
    const categoryHours = {}
    const dailyProductivity = []

    logs.forEach((log) => {
      if (log.entries) {
        log.entries.forEach((entry) => {
          if (entry.category) {
            categoryHours[entry.category] = (categoryHours[entry.category] || 0) + (Number.parseFloat(entry.hours) || 1)
          }
        })
      }
    })

    const start = startOfMonth(logs[logs.length - 1]?.date ? new Date(logs[logs.length - 1].date) : new Date())
    const end = endOfMonth(new Date())
    const days = eachDayOfInterval({ start, end })

    days.forEach((day) => {
      const log = logs.find((l) => isSameDay(new Date(l.date), day))
      dailyProductivity.push({
        date: format(day, "MM/dd"),
        productive: log?.entries?.length || 0,
      })
    })

    return {
      categoryData: Object.entries(categoryHours).map(([name, value]) => ({ name, value })),
      dailyData: dailyProductivity,
      totalDays: logs.length,
      totalHours: Math.round(Object.values(categoryHours).reduce((a, b) => a + b, 0) * 10) / 10,
      consistencyScore: Math.round((logs.length / 30) * 100),
    }
  }, [logs])

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Logged Days</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalDays}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalHours}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Consistency Score</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.consistencyScore}%</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Time by Category</h3>
        {analytics.categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}h`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No data yet. Start logging!</p>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Daily Productivity</h3>
        {analytics.dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="productive" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No data yet.</p>
        )}
      </div>
    </div>
  )
}
