"use client"

import type React from "react"
import { createContext, useState, useEffect } from "react"

export const AuthContext = createContext({
  user: null as { id: number; username: string } | null,
  login: async (username: string, password: string) => {},
  register: async (username: string, email: string, password: string) => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    if (data.success) {
      setUser({ id: data.user_id, username: data.username })
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, username: data.username }))
    } else {
      throw new Error(data.error)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
    const data = await response.json()
    if (data.success) {
      setUser({ id: data.user_id, username: data.username })
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, username: data.username }))
    } else {
      throw new Error(data.error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}
