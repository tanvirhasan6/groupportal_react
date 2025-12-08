import React, { useEffect, useState } from 'react'
import toast, { Toaster } from "react-hot-toast"
import SearchableSelect from "../components/SearchableSelect"
import { useUser } from "../context/UserContext"

export default function Manage() {

    const user = useUser()

    const [adminData,setAdminData] = useState([])

    const handleAdminData = async () => {

        try {

            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/manage/allAdmin?policyno=${user.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            )

            const data = await res.json()
            console.log(data)            
            if (data?.status===200) setAdminData(data?.result)
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(()=>{
        if(user?.POLICY_NO) handleAdminData()
    },[user?.POLICY_NO])

    return (
        <div className='w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8'>
            <div>

            </div>
        </div>
    )
}
