import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DatePickerInput from "../components/MyDatePicker/DatePickerInput";
import SearchableSelect from "../components/SearchableSelect";
import { useUser } from "../context/UserContext"
import { replace, useNavigate } from "react-router-dom";
import HospitalizationClaim from "../components/NewClaimComponent/HospitalizationClaim";
import DeathClaim from "../components/NewClaimComponent/DeathClaim";

const ClaimForm = () => {

    const user = useUser()

    return (
        <div className="w-full text-white flex justify-center items-start p-2">
            {
                user.GROUP_CODE === 0 &&
                <HospitalizationClaim />
            }
            {
                user.GROUP_CODE !== 0 &&
                <DeathClaim />
            }
        </div>
    )
}

export default ClaimForm