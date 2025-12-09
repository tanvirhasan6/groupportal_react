import React, { useEffect, useState } from 'react'
import toast, { Toaster } from "react-hot-toast"
import SearchableSelect from "../components/SearchableSelect"
import { useUser } from "../context/UserContext"
import { FaTrash } from 'react-icons/fa'

export default function Manage() {

    const user = useUser()

    const [adminGroupData, setAdminGroupData] = useState([])
    const [filteredAdminGroupData, setFilteredAdminGroupData] = useState([])
    const [deptData, setDeptData] = useState([])
    const [facultyData, setFacultyData] = useState([])
    const [adminData, setAdminData] = useState([])

    const [faculty, setFaculty] = useState('')
    const [dept, setDept] = useState('')
    const [admin, setAdmin] = useState('')

    const handleAdminData = async () => {

        try {

            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/manage/alldeptfacultyadmin?policyno=${user.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            )

            const data = await res.json()

            if (data?.status === 200) {

                setAdminGroupData(data?.result?.adminData)
                setFilteredAdminGroupData(data?.result?.adminData)

                const adminPairs = [
                    ...new Map(
                        data?.result?.adminData.map(item => [
                            item.USERNAME,
                            { value: item.USERNAME, label: item.NAME }
                        ])
                    ).values()
                ]

                setAdminData(adminPairs)

                const facultyPairs = [
                    ...new Map(
                        data?.result?.deptFacultyData.map(item => [
                            item.FACULTY_CODE,
                            { value: item.FACULTY_CODE, label: item.FACULTY }
                        ])
                    ).values()
                ]

                const deptPairs = data?.result?.deptFacultyData.map(item => ({
                    value: item.DEPT_CODE,
                    label: item.DEPARTMENT,
                    groupCode: item.GROUP_CODE,
                }))

                setFacultyData(facultyPairs)
                setDeptData(deptPairs)
            }
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {
        if (user?.POLICY_NO) handleAdminData()
    }, [user?.POLICY_NO])

    const handleAdminChange = (value) => {
        setAdmin(value)
    }

    const handleFacultyChange = (value) => {
        setFaculty(value)
    }

    const handleAdminRemove = (admin) => {

        const updatedArray = filteredAdminGroupData
            .filter(item =>
                !(item.GROUP_CODE === admin.GROUP_CODE && item.DEPT_CODE === admin.DEPT_CODE)
            )
            .sort((a, b) => (
                a.USERNAME.localeCompare(b.USERNAME) ||
                a.FACULTY?.localeCompare(b.FACULTY) ||
                a.DEPARTMENT?.localeCompare(b.DEPARTMENT)
            ))

        setFilteredAdminGroupData(updatedArray)

    }

    return (

        <div className='w-full flex flex-col gap-6 items-center'>

            {
                filteredAdminGroupData?.length>0 && 
                
                <div className='w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8'>

                    <div className='w-full flex flex-col md:flex-row gap-4'>

                        <div className='w-full md:w-4/12 lg:w-3/12'>
                            <SearchableSelect
                                label="Admin"
                                options={adminData}
                                value={admin}
                                onChange={handleAdminChange}
                                placeholder="Select Admin"
                                disabled={false}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>

                        <div className='w-full md:w-4/12 lg:w-3/12'>
                            <SearchableSelect
                                label="Faculty"
                                options={facultyData}
                                value={faculty}
                                onChange={handleFacultyChange}
                                placeholder="Select Faculty"
                                disabled={!admin}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>

                    </div>

                </div>
            }

            {
                filteredAdminGroupData?.length>0 && 
                <div className='relative w-full overflow-y-scroll bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8 h-[75vh]'>
                    <table className="w-full border-collapse rounded-xl backdrop-blur-lg bg-slate-900/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                        <thead className='sticky top-0'>
                            <tr className=" text-cyan-300 text-sm bg-slate-800/60">

                                <th className="py-3 px-4">Sl</th>
                                <th className="py-3 px-4">Username</th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Faculty</th>
                                <th className="py-3 px-4">Department</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAdminGroupData?.map((admin, idx) => (
                                <tr
                                    key={idx}
                                    className="text-slate-300 text-sm border-b border-slate-700/50 hover:bg-slate-800/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)] transition cursor-pointer text-center"
                                >
                                    <td className="py-3 px-4">{idx + 1}</td>
                                    <td className="py-3 px-4 text-emerald-400">{admin.USERNAME}</td>
                                    <td className="py-3 px-4">{admin.NAME}</td>
                                    <td className="py-3 px-4">{admin.FACULTY}</td>
                                    <td className="py-3 px-4">{admin.DEPARTMENT}</td>
                                    <td className="py-3 px-4" onClick={(e) => handleAdminRemove(admin)}><FaTrash className='fill-pink-400 cursor-pointer' /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }

        </div>
    )
}
