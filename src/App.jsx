import React, { useState, lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { UserContext } from "./context/UserContext"
const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const ClaimsPage = lazy(() => import("./pages/NewClaim"));

const Skeleton = () => (
  <div className="p-4 animate-pulse space-y-3">
    <div className="h-6 bg-gray-400 rounded w-1/3"></div>
    <div className="h-4 bg-gray-400 rounded w-1/4"></div>
    <div className="h-48 bg-gray-400 rounded w-full"></div>
  </div>
)

const getUserFromCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_info="));
  if (!cookie) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    return parsed.USERNAME ? parsed : null;
  } catch {
    return null;
  }
}

export default function App() {

  const [userInfo, setUserInfo] = useState(getUserFromCookie())

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/grpclaimportal/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userInfo.USERNAME }),
        credentials: "include",
      })

      const data = await res.json()

      if (data?.status === 200) {
        setUserInfo(null)
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <UserContext.Provider value={userInfo}>
      <BrowserRouter>
        <Suspense fallback={<Skeleton />}>
          <Routes>
            <Route
              path="/login"
              element={userInfo ? <Navigate to="/dashboard" /> : <Login onLogin={setUserInfo} />}
            />

            {/* Dashboard layout with nested routes */}
            <Route
              path="/dashboard"
              element={
                userInfo ? (
                  <DashboardLayout userInfo={userInfo} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="newclaim" element={<ClaimsPage />} />
              
              <Route path="HealthCard" element={<ClaimsPage />} />
              <Route path="DeathClaim" element={<ClaimsPage />} />
              <Route path="Manage" element={<ClaimsPage />} />
              <Route path="MissingInfo" element={<ClaimsPage />} />

            </Route>

            {/* catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserContext.Provider>
  )
}