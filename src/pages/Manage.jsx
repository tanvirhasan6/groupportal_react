import React, { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from "react-hot-toast"
import SearchableSelect from "../components/SearchableSelect"
import { useUser } from "../context/UserContext"
import { FaPlusCircle, FaTrash } from 'react-icons/fa'

export default function Manage() {

    const user = useUser()

    const [loading, setLoading] = useState(false)
    const [enrollLoading, setEnrollLoading] = useState(false)

    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')

    const usernameTimer = useRef(null)
    const mobileTimer = useRef(null)
    const emailTimer = useRef(null)

    const [errors, setErrors] = useState({
        username: "",
        mobile: "",
        email: ""
    })

    const [valid, setValid] = useState({
        username: null, // true, false, or null
        mobile: null,
        email: null
    })

    const [adminGroupData, setAdminGroupData] = useState([])
    const [filteredAdminGroupData, setFilteredAdminGroupData] = useState([])

    const [blankGroupData, setBlankAdminGroupData] = useState([])
    // const [enrollFaculty, setEnrollFaculty] = useState('')
    // const [enrollDepartment, setEnrollDepartment] = useState('')

    // const [deptData, setDeptData] = useState([])
    const [facultyData, setFacultyData] = useState([])
    const [adminData, setAdminData] = useState([])

    const [faculty, setFaculty] = useState('')
    // const [dept, setDept] = useState('')
    const [admin, setAdmin] = useState('')
    const [selectedDepartments, setSelectedDepartments] = useState([])

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
                setFilteredAdminGroupData(data?.result?.adminData
                    .sort((a, b) => (
                        (a.USERNAME ?? "").localeCompare(b.USERNAME ?? "") ||
                        (a.FACULTY ?? "").localeCompare(b.FACULTY ?? "") ||
                        (a.DEPARTMENT ?? "").localeCompare(b.DEPARTMENT ?? "")
                    ))
                )

                console.log(data?.result?.adminData)

                const blankGroup = data?.result?.adminData
                    .filter(item =>
                        (item.USERNAME == null || item.USERNAME === "") ||
                        (item.GROUP_CODE == null || item.GROUP_CODE === "")
                    )
                    .sort((a, b) => (
                        (a.FACULTY ?? "").localeCompare(b.FACULTY ?? "") ||
                        (a.DEPARTMENT ?? "").localeCompare(b.DEPARTMENT ?? "")
                    ))

                setBlankAdminGroupData(blankGroup)

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

                // const deptPairs = data?.result?.deptFacultyData.map(item => ({
                //     value: item.DEPT_CODE,
                //     label: item.DEPARTMENT,
                //     groupCode: item.GROUP_CODE,
                // }))

                setFacultyData(facultyPairs)
                // setDeptData(deptPairs)
            }
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {

        if (!user?.POLICY_NO) return;

        const fetchData = async () => {
            await handleAdminData()
        };

        fetchData()

    }, [user?.POLICY_NO])

    const handleDebouncedValidation = (timerRef, type, value) => {
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            if (value) handleValidate(type, value);
        }, 1000);
    }

    const handleValidate = async (type, val) => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/manage/validationCount?type=${type}&value=${val}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            )

            const data = await res.json()

            if (data?.status === 200) {

                if (data?.result[0].CNT > 0) {
                    setErrors(prev => ({ ...prev, [type]: `${type} already taken` }));
                    setValid(prev => ({ ...prev, [type]: false }));
                } else {
                    setErrors(prev => ({ ...prev, [type]: "" }));
                    setValid(prev => ({ ...prev, [type]: true }));
                }

            } else {
                setErrors(prev => ({ ...prev, [type]: "" }));
                setValid(prev => ({ ...prev, [type]: true }));
            }


        } catch (error) {
            toast.error(error)
        }
    }

    const handleCheckbox = (item) => {
        setSelectedDepartments(prev => {
            const exists = prev.find(
                (p) => p.DEPT_CODE === item.DEPT_CODE
            );

            if (exists) {
                return prev.filter(
                    (p) => !p.DEPT_CODE === item.DEPT_CODE
                );
            }

            return [
                ...prev,
                {
                    DEPT_CODE: item.DEPT_CODE
                }
            ];
        })
    };


    const handleAdminEnroll = async (e) => {

        e.preventDefault()

        setLoading(true)

        if (!username || !name || !mobile || !email) {
            toast.error("All fields are required");
            return
        }

        const mobileRegex = /^[0-9]{11}$/

        if (!mobileRegex.test(mobile)) {
            toast.error("Mobile number must be 11 digits and numeric");
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return
        }

        if (selectedDepartments.length < 1) {
            toast.error('Please, select at least one Department')
            return
        }

        // check if any validation 
        const hasInvalid = Object.values(valid).some(v => v === false);
        const hasErrorMessage = Object.values(errors).some(err => err !== "");
        const hasPending = Object.values(valid).some(v => v === null); // new: waiting for validation

        if (hasInvalid || hasErrorMessage) {
            toast.error(`Please fix validation errors before submitting.`);
            return;
        }

        if (hasPending) {
            toast.error("Please wait for validation to complete.");
            return;
        }

        try {

            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/manage/enrollAdmin`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        formData: {
                            username,
                            name,
                            mobile,
                            email,
                            policyno: user?.POLICY_NO
                        },
                        selectedDepartments
                    })
                }
            )

            const data = await res.json()

            console.log(data)

            if (data?.status === 200) {
                toast.success('Admin Enrolled Successfully')
                window.location.reload()
            }
            else toast.error(`Admin Insert Error: ${data?.message}`)

        } catch (error) {
            toast.error(error)
        } finally {
            setLoading(false)
        }

    }

    const handleAdminChange = (value) => {
        setFaculty('')
        setAdmin(value)

        if (!value) {
            setFilteredAdminGroupData(adminGroupData)
            return
        }

        const selectedAdmin = String(value)

        const updatedArray = filteredAdminGroupData
            .filter(item =>
                item.USERNAME === null ||
                String(item.USERNAME) === selectedAdmin
            )
            .sort((a, b) =>
                String(a.USERNAME ?? '').localeCompare(String(b.USERNAME ?? '')) ||
                String(a.FACULTY ?? '').localeCompare(String(b.FACULTY ?? '')) ||
                String(a.DEPARTMENT ?? '').localeCompare(String(b.DEPARTMENT ?? ''))
            )

        setFilteredAdminGroupData(updatedArray)

    }

    const handleFacultyChange = (value) => {
        setFaculty(value)
        console.log(value);

        if (!value) {
            setFilteredAdminGroupData(adminGroupData)
            return
        }

        const selectedFaculty = String(value)

        const updatedArray = filteredAdminGroupData
            .filter(item =>
                item.FACULTY_CODE === null ||
                String(item.FACULTY_CODE) === selectedFaculty
            )
            .sort((a, b) =>
                String(a.FACULTY ?? '').localeCompare(String(b.FACULTY ?? '')) ||
                String(a.DEPARTMENT ?? '').localeCompare(String(b.DEPARTMENT ?? ''))
            )

        setFilteredAdminGroupData(updatedArray)

    }

    const handleAdminAdd = async (selected) => {

        if (!admin) {
            toast.error('Select an Admin first')
            return
        }        

        const adminToAssign = adminGroupData
            .filter((a, index, self) =>
                a.USERNAME === admin &&
                index === self.findIndex(item => item.USERNAME === a.USERNAME)
            ) // remove duplicates by USERNAME
            .map(a => ({
                USERNAME: a.USERNAME,
                GROUP_CODE: a.GROUP_CODE,
                NAME: a.NAME,
                EMAIL: a.EMAIL,
                MOBILE: a.MOBILE
            }))[0]

        if (!adminToAssign) {
            toast.error("Selected admin not found")
            return
        }

        const blankRow = blankGroupData.find(item => item.DEPT_CODE === selected.DEPT_CODE)
        if (!blankRow) {
            toast.error("Blank row not found")
            return
        }

        setEnrollLoading(true)

        try {

            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/manage/updateAdmin`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        formData: {
                            groupCode: adminToAssign.GROUP_CODE,
                            deptCode: selected.DEPT_CODE,
                            policyno: user?.POLICY_NO,
                            type: 'ADD'
                        },
                    })
                }
            )

            const data = await res.json()

            if (data?.status === 200) {

                setFilteredAdminGroupData(prev =>
                    prev.map(item =>
                        item.DEPT_CODE === selected.DEPT_CODE
                            ? {
                                ...item,
                                USERNAME: adminToAssign.USERNAME,
                                GROUP_CODE: adminToAssign.GROUP_CODE,
                                NAME: adminToAssign.NAME,
                                EMAIL: adminToAssign.EMAIL,
                                MOBILE: adminToAssign.MOBILE
                            }
                            : item
                    )
                )

                setFilteredAdminGroupData(prev =>
                    [...prev].sort((a, b) =>
                        (a.USERNAME ?? "").localeCompare(b.USERNAME ?? "") ||
                        (a.FACULTY ?? "").localeCompare(b.FACULTY ?? "") ||
                        (a.DEPARTMENT ?? "").localeCompare(b.DEPARTMENT ?? "")
                    )
                )

                setBlankAdminGroupData(prev =>
                    prev.filter(item => item.DEPT_CODE !== selected.DEPT_CODE)
                )

            } else {
                toast.error(`Cannot Add admin to this Department: ${data?.message}`)
            }


        } catch (error) {
            toast.error(`Cannot Add admin to this Department: ${error}`)
        } finally {
            setEnrollLoading(false)
        }

    }

    const handleAdminRemove = async (admin) => {

        setEnrollLoading(true)

        try {

            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/manage/updateAdmin`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        formData: {
                            groupCode: admin.GROUP_CODE,
                            deptCode: admin.DEPT_CODE,
                            policyno: user?.POLICY_NO,
                            type: 'REMOVE'
                        },
                    })
                }
            )

            const data = await res.json()

            if (data?.status === 200) {

                setFilteredAdminGroupData(prev =>
                    prev.map(item =>
                        item.DEPT_CODE === admin.DEPT_CODE
                            ? {
                                ...item,
                                USERNAME: null,
                                GROUP_CODE: null,
                                NAME: null,
                                EMAIL: null,
                                MOBILE: null
                            }
                            : item
                    ).sort((a, b) =>
                        (a.USERNAME ?? "").localeCompare(b.USERNAME ?? "") ||
                        (a.FACULTY ?? "").localeCompare(b.FACULTY ?? "") ||
                        (a.DEPARTMENT ?? "").localeCompare(b.DEPARTMENT ?? "")
                    )
                )

                const blankItem = {
                    ...admin,
                    USERNAME: null,
                    GROUP_CODE: null
                }

                setBlankAdminGroupData(prev => {
                    if (prev.some(p => p.DEPT_CODE === admin.DEPT_CODE)) return prev
                    return [...prev, blankItem]
                        .sort((a, b) => (
                            (a.USERNAME ?? "").localeCompare(b.USERNAME ?? "") ||
                            (a.FACULTY ?? "").localeCompare(b.FACULTY ?? "") ||
                            (a.DEPARTMENT ?? "").localeCompare(b.DEPARTMENT ?? "")
                        ))
                })

            } else {
                toast.error(`Cannot Add admin to this Department: ${data?.message}`)
            }


        } catch (error) {
            toast.error(`Cannot Add admin to this Department: ${error}`)
        } finally {
            setEnrollLoading(false)
        }

    }

    return (

        <div className='w-full flex flex-col gap-6 items-center'>

            <Toaster />

            {
                blankGroupData.length > 0 &&

                <div className='w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8'>

                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>

                        <div className=''>
                            <label className="block text-sm mb-1 text-gray-300">Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter a new User name"
                                value={username}
                                onChange={
                                    (e) => {
                                        const v = e.target.value;
                                        setUsername(v);
                                        handleDebouncedValidation(usernameTimer, "username", v)
                                    }
                                }
                                className={`w-full bg-gray-900/60 rounded-md px-3 py-2 focus:outline-none 
                                    ${valid.username === true ? "border border-green-500" : ""}
                                    ${valid.username === false ? "border border-red-500" : ""}
                                    ${valid.username === null ? "border border-gray-700" : ""}
                                    focus:ring-2 focus:ring-cyan-500
                                `}
                                autoComplete='off'
                            />
                            {errors.username && (
                                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                            )}
                        </div>
                        <div className=''>
                            <label className="block text-sm mb-1 text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                autoComplete='off'

                            />
                        </div>
                        <div className=''>
                            <label className="block text-sm mb-1 text-gray-300">Mobile</label>
                            <input
                                type="number"
                                name="mobile"
                                placeholder="Enter Mobile No"
                                value={mobile}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setMobile(v);
                                    handleDebouncedValidation(mobileTimer, "mobile", v);
                                }}
                                className={`w-full bg-gray-900/60 rounded-md px-3 py-2 focus:outline-none 
                                    ${valid.mobile === true ? "border border-green-500" : ""}
                                    ${valid.mobile === false ? "border border-red-500" : ""}
                                    ${valid.mobile === null ? "border border-gray-700" : ""}
                                    focus:ring-2 focus:ring-cyan-500
                                `}
                                autoComplete='off'
                            />
                            {errors.mobile && (
                                <p className="text-red-400 text-sm mt-1">{errors.mobile}</p>
                            )}
                        </div>
                        <div className=''>
                            <label className="block text-sm mb-1 text-gray-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter a new User name"
                                value={email}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setEmail(v);
                                    handleDebouncedValidation(emailTimer, "email", v);
                                }}
                                className={`w-full bg-gray-900/60 rounded-md px-3 py-2 focus:outline-none 
                                    ${valid.email === true ? "border border-green-500" : ""}
                                    ${valid.email === false ? "border border-red-500" : ""}
                                    ${valid.email === null ? "border border-gray-700" : ""}
                                    focus:ring-2 focus:ring-cyan-500
                                `}
                                autoComplete='off'

                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                    </div>

                    <div className='relative w-full h-[40vh] overflow-auto futuristic-scrollbar'>
                        <table className="w-full min-w-max border-collapse rounded-xl backdrop-blur-lg bg-slate-900/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                            <thead className='sticky top-0'>
                                <tr className=" text-cyan-300 text-sm bg-slate-800/95">

                                    <th className="py-3 px-4 w-8"></th>
                                    <th className="py-3 px-4 w-8">Sl</th>
                                    <th className="py-3 px-4">Faculty</th>
                                    <th className="py-3 px-4">Department</th>
                                </tr>
                            </thead>

                            <tbody>
                                {blankGroupData?.map((a, idx) => (
                                    <tr
                                        key={idx}
                                        className="text-slate-300 text-sm border-b border-slate-700/50 hover:bg-slate-800/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)] transition text-center"
                                    >
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedDepartments.some(
                                                    (p) =>
                                                        p.DEPT_CODE === a.DEPT_CODE
                                                )}
                                                onChange={() => handleCheckbox(a)}
                                            />
                                        </td>
                                        <td className="py-3 px-4">{idx + 1}</td>
                                        <td className="py-3 px-4">{a.FACULTY}</td>
                                        <td className="py-3 px-4">{a.DEPARTMENT}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            className="px-8 py-2 bg-violet-500 text-white font-semibold rounded-md transition-all hover:scale-105"
                            disabled={false}
                            onClick={handleAdminEnroll}
                        >
                            {
                                loading ? (
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
                                        <span>Enrolling...</span>
                                    </div>
                                ) : (
                                    'Enroll Admin'
                                )
                            }
                        </button>
                    </div>

                </div>
            }

            {
                filteredAdminGroupData?.length > 0 &&

                <div className='w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8'>

                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>

                        <div className=''>
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

                        <div className=''>
                            <SearchableSelect
                                label="Faculty"
                                options={facultyData}
                                value={faculty}
                                onChange={handleFacultyChange}
                                placeholder="Select Faculty"
                                onFocus={(e) => e.target.select()}
                            />
                        </div>

                    </div>

                    <div className='relative w-full h-[75vh] overflow-auto futuristic-scrollbar'>
                        <table className="w-full min-w-max border-collapse rounded-xl backdrop-blur-lg bg-slate-900/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                            <thead className='sticky top-0'>
                                <tr className=" text-cyan-300 text-sm bg-slate-800/95">

                                    <th className="py-3 px-4 w-8"></th>
                                    <th className="py-3 px-4 w-8">Sl</th>
                                    <th className="py-3 px-4">Username</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Faculty</th>
                                    <th className="py-3 px-4">Department</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAdminGroupData?.map((a, idx) => (
                                    <tr
                                        key={idx}
                                        className="text-slate-300 text-sm border-b border-slate-700/50 hover:bg-slate-800/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)] transition text-center"
                                    >
                                        <td className="py-3 px-4">

                                            {
                                                enrollLoading &&
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
                                                    <span>Enrolling...</span>
                                                </div>

                                            }

                                            {!enrollLoading && a.USERNAME && <FaTrash className='fill-pink-400 cursor-pointer' onClick={() => handleAdminRemove(a)} />}
                                            {!enrollLoading && admin && !a.USERNAME && <FaPlusCircle className='fill-teal-400 cursor-pointer' onClick={() => handleAdminAdd(a)} />}

                                        </td>
                                        <td className="py-3 px-4">{idx + 1}</td>
                                        <td className="py-3 px-4 text-emerald-400">{a.USERNAME}</td>
                                        <td className="py-3 px-4">{a.NAME}</td>
                                        <td className="py-3 px-4">{a.FACULTY}</td>
                                        <td className="py-3 px-4">{a.DEPARTMENT}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            }

        </div>
    )
}
