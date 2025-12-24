import React, { useState, lazy, Suspense, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { io } from "socket.io-client"

import { UserContext } from "./context/UserContext"
import ClaimDetails from "./pages/ClaimDetails";
import Manage from "./pages/Manage";
import Missing from "./pages/Missing";
const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const ClaimsPage = lazy(() => import("./pages/NewClaim"));
const FaqPage = lazy(() => import("./pages/Faq"));
const HealthCarePage = lazy(() => import("./pages/Healthcard"));
const HospitalPage = lazy(() => import("./pages/Hospitals"));

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

  // ----------------------------------------------------
  // SINGLE TAB SOCKET PROTECTION
  // ----------------------------------------------------
  useEffect(() => {
    if (!userInfo?.USERNAME) return;

    const socket = io("http://localhost:5001", {
      query: { 
        userId: userInfo.USERNAME, 
        clientApp: "claimPortal",
      },
      transports: ["websocket"],
      reconnection: false,
    });

    socket.on("multiple_tabs_not_allowed", () => {
      alert("Another tab is already open! This tab will be closed.");
      socket.disconnect();
      setUserInfo(null);
      window.location.href = "/login";
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo]);

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
              
              <Route path="healthcard" element={<HealthCarePage />} />
              <Route path="hospitals" element={<HospitalPage />} />
              <Route path="manage" element={<Manage />} />
              <Route path="missinginfo" element={<Missing />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="claimDetails" element={<ClaimDetails />} />

            </Route>

            {/* catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserContext.Provider>
  )
}