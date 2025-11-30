import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import CircleProgress from "./CircleProgress"

export default function BeneficiaryClaimSummary({ percent }) {

    const user = useUser()
    const [claimUsageData, setClaimUsageData] = useState([])

    const usagelist = async () => {

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claimUsageData?userid=${user?.USERNAME}&policyno=${user?.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()
            // console.log(data);

            if (data?.status === 200) setClaimUsageData(data?.result)
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {

        if (user.POLICY_NO) usagelist()

    }, [user?.POLICY_NO])

    return (
        <div className="w-full">

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                {claimUsageData?.map((item) => (

                    <CircleProgress
                        className=' bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg'
                        key={item.BENEFIT_CODE}
                        title={item.BENEFIT_HEAD}
                        limit={item.PER_SUMINSURED}
                        used={item.CLAIM_AMOUNT}
                        balance={item.BALANCE}
                        percent={item.REMAINING_PARCENT}
                    />
                ))}

            </div>

        </div>
    )
}
