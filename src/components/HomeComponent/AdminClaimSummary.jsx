import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import toast, { ToastBar, Toaster } from "react-hot-toast"
import { FaChartArea } from 'react-icons/fa'
import AnimateNumber from '../AnimatedNumber'

export default function AdminClaimSummary() {

    const user = useUser()
    
    const [loading, setLoading] = useState(false)

    const [summaryData, setSummaryData] = useState([])

    const getData = async () => {

        setSummaryData([])
        setLoading(true)
        try {

            let grpCode;

            if (user.GROUP_CODE === '100') grpCode = ''
            else grpCode = user.GROUP_CODE

            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/adminClaimSummary?policyno=${user.POLICY_NO}&groupCode=${grpCode}`,
                {
                    method: "GET",
                    credentials: "include",
                }

            )

            const data = await res.json()

            if (data?.status === 200) setSummaryData(data?.result)
            else toast.error(data?.message)
            setLoading(false)
        } catch (error) {
            toast.error(`Please Try again ${error}`)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user.GROUP_CODE) getData()
    }, [user.GROUP_CODE])

    const groupedData = summaryData?.reduce((acc, item) => {
        if (!acc[item.BENEFIT_CODE]) {
            acc[item.BENEFIT_CODE] = {
                title: item.BENEFIT_HEAD,
                items: [],
            };
        }
        acc[item.BENEFIT_CODE].items.push(item);
        return acc;
    }, {})

    return (
        <div className='w-full flex flex-col justify-center items-center'>

            <Toaster />

            {
                loading &&
                <div className="flex items-center justify-center gap-2">
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                    {/* <span>Loading...</span> */}
                </div>
            }

            {
                !loading &&
                <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6'>
                    {Object.values(groupedData).map((group, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg text-gray-300"
                        >
                            <h2 className="text-cyan-600 text-lg font-bold mb-4 pb-2">
                                {group.title}
                            </h2>

                            <div className='w-full flex flex-col lg:grid lg:grid-cols-2 justify-center items-start gap-1 mb-2'>
                                {group.items.map((item, i) => (

                                    <div key={i} className='w-full rounded-lg border border-gray-700 p-2 text-sm'>

                                        <h3 className="font-semibold text-teal-400 text-md text-center my-2">{item.STATUS_NAME}</h3>
                                        <div className='flex flex-col items-center gap-1 justify-around my-4'>
                                            <p className='text-center'>Application/s: <span><AnimateNumber value={item.COUNT_STATUS} /></span></p>
                                            <p className='text-center'>Amount: <span><AnimateNumber value={item.AMOUNT} /></span>/-</p>
                                        </div>

                                    </div>

                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            }

        </div>
    )
}
