import React from "react";
import { useUser } from "../context/UserContext";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Welcome, {user?.NAME}</h2>
      <p className="text-gray-300 leading-relaxed">
        Manage policies, track claims, and view reports here.
      </p>
    </div>
  );
}
