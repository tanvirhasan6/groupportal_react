import React from "react";
import { useUser } from "../context/UserContext";
import Beneficiary from "../components/HomeComponent/Beneficiary";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="w-full flex flex-col gap-2 items-center">

      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-2 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-400">Welcome Back, {user?.NAME}</h2>      
      </div>

      <div className="w-full mt-4">
          <div className="sm:w-4/12">
              <Beneficiary/>
          </div>

      </div>

    </div>
  );
}
