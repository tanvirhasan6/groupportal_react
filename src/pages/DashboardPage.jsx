import React from "react";
import { useUser } from "../context/UserContext";
import Beneficiary from "../components/HomeComponent/Beneficiary";
import InfoDoc from "../components/HomeComponent/InfoDoc";
import { GiPartyPopper } from "react-icons/gi";
import BeneficiaryClaimSummary from "../components/HomeComponent/BeneficiaryClaimSummary";
import ClaimSummary from "../components/HomeComponent/ClaimSummary";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const user = useUser();
  const navigate = useNavigate()

  return (
    <div className="w-full flex flex-col gap-2 items-center">

      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-2 shadow-lg">
        <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">Welcome Back, {user?.NAME} <GiPartyPopper className="fill-red-400" /></h2>
      </div>

      <div className="w-full mt-4 flex flex-col lg:flex-row gap-6 items-start">
        <Beneficiary />
        <InfoDoc />
      </div>
      {
        user.GROUP_CODE === 0 &&
        <>
          <div className="w-full">
            <BeneficiaryClaimSummary percent={100} />
          </div>


          <div className="w-full">
            <ClaimSummary />
          </div>
        </>
      }

      <div className="hidden animate-[moveStripes_1.2s_linear_infinite]"></div>

      <button
        onClick={() => navigate("/dashboard/newClaim")}
        className="fixed bottom-8 right-8 z-50 w-8 h-8 sm:w-12 sm:h-12 rounded-full 
                 bg-linear-to-br from-cyan-800 to-blue-600 
                 shadow-[0_0_15px_rgba(0,255,255,0.6),0_0_25px_rgba(0,128,255,0.4)] 
                 text-gray-300 flex items-center justify-center 
                 text-2xl transform transition duration-300 cursor-pointer 
                 hover:shadow-[0_0_25px_rgba(0,255,255,0.9),0_0_40px_rgba(0,128,255,0.6)] 
                 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-cyan-400 before:opacity-50 before:animate-ping"
        title="New Claim"
      >
        <FaPlus className="relative z-10 w-3 h-3 sm:w-6 sm:h-6" />
      </button>

    </div>
  );
}
