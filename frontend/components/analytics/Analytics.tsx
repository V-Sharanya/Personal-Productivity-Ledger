"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DailyLog {
  id: number
  date: string
  mood: string
  energy_level: number
  focus_rating: number
  tasks_completed: number
}

export default function Analytics({ userId }: { userId: number }) {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [userId])

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/logs/${userId}`)
      setLogs(response.data)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading analytics...</div>
  if (logs.length === 0) return <div className="text-center py-8">No data yet. Start logging to see analytics!</div>

  // Calculate mood distribution
  const moodCounts = logs.reduce((acc: any, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1
    return acc
  }, {})

  const moodData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood as string,
    value: count as number,
  }))

  // Prepare data for charts
  const chartData = logs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)
    .map((log) => ({
      date: log.date.slice(-5),
      energy: log.energy_level,
      focus: log.focus_rating,
      tasks: log.tasks_completed,
    }))

  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const stats = {
    avgEnergy: (logs.reduce((sum, l) => sum + l.energy_level, 0) / logs.length).toFixed(1),
    avgFocus: (logs.reduce((sum, l) => sum + l.focus_rating, 0) / logs.length).toFixed(1),
    totalTasks: logs.reduce((sum, l) => sum + l.tasks_completed, 0),
    totalLogs: logs.length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600">Avg Energy</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgEnergy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600">Avg Focus</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgFocus}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.totalTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Logs</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalLogs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Energy & Focus Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="focus" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Mood Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {moodData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Daily Tasks Completed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
