import React from "react";
import { useUser } from "../context/UserContext";
import Beneficiary from "../components/HomeComponent/Beneficiary";
import InfoDoc from "../components/HomeComponent/InfoDoc";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="w-full flex flex-col gap-2 items-center">

      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-2 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-400">Welcome Back, {user?.NAME}</h2>      
      </div>

      <div className="w-full mt-4 flex flex-col lg:flex-row gap-2 items-start">
          <Beneficiary/>
          <InfoDoc/>
      </div>

    </div>
  );
}
