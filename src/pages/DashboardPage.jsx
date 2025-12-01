import React from "react";
import { useUser } from "../context/UserContext";
import Beneficiary from "../components/HomeComponent/Beneficiary";
import InfoDoc from "../components/HomeComponent/InfoDoc";
import { GiPartyPopper } from "react-icons/gi";
import BeneficiaryClaimSummary from "../components/HomeComponent/BeneficiaryClaimSummary";
import ClaimSummary from "../components/HomeComponent/ClaimSummary";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="w-full flex flex-col gap-2 items-center">

      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-2 shadow-lg">
        <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">Welcome Back, {user?.NAME} <GiPartyPopper className="fill-red-400" /></h2>
      </div>

      <div className="w-full mt-4 flex flex-col lg:flex-row gap-6 items-start">
        <Beneficiary />
        <InfoDoc />
      </div>

      <div className="w-full">
        <BeneficiaryClaimSummary percent={100} />
      </div>

      <div className="w-full">
        <ClaimSummary/>
      </div>

      <div className="hidden animate-[moveStripes_1.2s_linear_infinite]"></div>

    </div>
  );
}
