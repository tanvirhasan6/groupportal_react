import React, { useState } from "react";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout({ children, userInfo, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex relative">

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="w-full flex-1 flex flex-col transition-all duration-300">

        {/* Top Navbar */}
        <header className="flex items-center justify-between px-2 py-3 bg-gray-900 border-b border-gray-700">
          <div className="flex gap-1.5 items-center">
            {!sidebarOpen && (
              <FaBars
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                size={30}
                onClick={() => setSidebarOpen(true)}
              />
            )}
            {sidebarOpen && (
              <FaTimes
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                size={30}
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800"
            >
              <img
                src={`https://app.zenithlifebd.com/web_docs/${userInfo?.USERNAME}.jpg`}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-gray-700"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg min-w-60 flex flex-col z-50">
                <h2 className="flex items-center gap-2 px-4 py-2 hover:bg-gray-950 w-full text-left">{userInfo.NAME}</h2>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-950 w-full text-left"
                  onClick={onLogout}
                >
                  Logout <FaSignOutAlt />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
