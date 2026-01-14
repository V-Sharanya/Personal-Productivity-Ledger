"use client"

import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import LoginPage from "../components/auth/LoginPage"
import Dashboard from "../components/dashboard/Dashboard"

export default function Home() {
  const { user } = useContext(AuthContext)

  return <main>{user ? <Dashboard /> : <LoginPage />}</main>
}
