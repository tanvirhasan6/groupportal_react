import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import toast, { Toaster } from "react-hot-toast";

export default function ClaimSummary() {

    const user = useUser()
    const [claimSummaryData, setClaimSummaryData] = useState([])

    const usagelist = async () => {

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claimSummaryListData?userid=${user?.USERNAME}&policyno=${user?.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()
            console.log(data);

            if (data?.status === 200) setClaimSummaryData(data?.result)
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {

        if (user.POLICY_NO) usagelist()

    }, [user?.POLICY_NO])

    return (
        <div className='w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-6 shadow-lg'>
            <Toaster />
            
        </div>
    )
}
