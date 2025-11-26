import React, { useEffect, useRef, useState } from "react"

import { useUser } from "../context/UserContext"
import { FaCamera, FaEdit } from "react-icons/fa"
import toast from "react-hot-toast"

import ChangeEmail from "../components/ProfileComponent/ChangeEmail"
import ChangeMobile from "../components/ProfileComponent/ChangeMobile"
import ChangeBank from "../components/ProfileComponent/ChangeBank"
import ChangePassword from "../components/ProfileComponent/ChangePassword"

const ProfilePage = () => {

    const user = useUser()
    const userid = user?.USERNAME    

    const [activePanel, setActivePanel] = useState(null)
    const [accountData, setAccountData] = useState(null)
    const [imageSrc, setImageSrc] = useState(null)

    const fileInputRef = useRef(null)

    const togglePanel = (panel) => {
        setActivePanel(activePanel === panel ? null : panel)
    }

    useEffect(() => {

        if (!userid) return

        const fetchBankData = async () => {

            try {
                const res = await fetch(
                    `http://localhost:5001/api/grpclaimportal/profile/basicInfo?userid=${userid}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                )

                const data = await res.json()

                if (data?.status === 200) {
                    setAccountData(data?.result)
                } else {
                    toast.error(data?.message)
                }
            } catch (error) {
                toast.error(String(error))
            }
        }

        if (userid) {
            setImageSrc(`https://app.zenithlifebd.com/web_docs/${userid}.jpg`)
            fetchBankData()
        }

    }, [userid])

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setImageSrc(reader.result)
        }
        reader.readAsDataURL(file)

        const formData = new FormData()
        formData.append("image", file)

        try {
            const res = await fetch(
                "http://localhost:5001/api/grpclaimportal/profile/uploadImage",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            )

            const text = await res.text()
            let data

            try {
                data = JSON.parse(text)
            } catch {
                console.error("Invalid JSON:", text)
                return
            }

            console.log("Upload:", data?.message)
        } catch (err) {
            toast.error("Upload failed")
        }
    }

    return (
        <div className="flex flex-col gap-3 justify-center items-center py-10 px-4 text-sm">

            <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-xl">

                {/* Profile Header */}
                <div className="flex flex-col items-center gap-6 mb-6">

                    <div className="w-full flex flex-col sm:flex-row gap-6 items-center">

                        <div className="relative w-32 h-32 rounded-full border border-white/50 shadow overflow-hidden">

                            <img
                                src={imageSrc}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={handleImageClick}
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
                            >
                                <FaCamera />
                            </button>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">{user?.NAME}</h2>
                            <p>Dept: {user?.DEPT_NAME}</p>
                            <p>Faculty: {user?.FACULTY}</p>
                            <p>ID: {user?.USERNAME}</p>
                        </div>
                    </div>

                    <hr className="w-full border-gray-400" />

                    <div className="w-full text-gray-100 space-y-1">

                        {/* GRID START */}
                        <div className="w-full grid grid-cols-2 gap-4">

                            <InputBox
                                label="Account No"
                                value={accountData?.ACCNO}
                                onClick={() => togglePanel("bank")}
                            />

                            <InputBox
                                label="Bank"
                                value={accountData?.BANKNAME}
                                onClick={() => togglePanel("bank")}
                            />

                            <InputBox
                                label="Branch"
                                value={accountData?.BRANCHNAME}
                                onClick={() => togglePanel("bank")}
                            />

                            <InputBox
                                label="Mobile"
                                value={user?.MOBILE}
                                onClick={() => togglePanel("mobile")}
                            />

                            <InputBox
                                label="Email"
                                value={user?.EMAIL}
                                onClick={() => togglePanel("email")}
                            />

                        </div>

                        <div className="flex flex-wrap gap-3 my-6">
                            <button
                                className={`px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-gray-100 ${
                                    activePanel === "password" ? "bg-blue-600 text-white" : ""
                                }`}
                                onClick={() => togglePanel("password")}
                            >
                                Change Password
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Panels */}
            {(activePanel === "email" ||
                activePanel === "mobile" ||
                activePanel === "password" ||
                activePanel === "bank") && (
                <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-xl">

                    {activePanel === "email" && (
                        <UpdateCard title="Update Email">
                            <ChangeEmail />
                        </UpdateCard>
                    )}

                    {activePanel === "mobile" && (
                        <UpdateCard title="Update Mobile">
                            <ChangeMobile />
                        </UpdateCard>
                    )}

                    {activePanel === "password" && (
                        <UpdateCard title="Change Password">
                            <ChangePassword />
                        </UpdateCard>
                    )}

                    {activePanel === "bank" && (
                        <UpdateCard title="Update Bank Info">
                            <ChangeBank />
                        </UpdateCard>
                    )}

                </div>
            )}
        </div>
    )
}

const InputBox = ({ label, value, onClick }) => (
    <div className="flex flex-col w-full">
        <label className="text-gray-300 text-sm mb-1">{label}</label>
        <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-500 bg-transparent text-white w-full">
            <input
                value={value || ""}
                readOnly
                className="bg-transparent flex-1 text-white focus:outline-none"
            />
            <button onClick={onClick} className="ml-2 text-gray-300 hover:text-white">
                <FaEdit />
            </button>
        </div>
    </div>
)

const UpdateCard = ({ title, children }) => (
    <div className="w-full">
        <h3 className="text-center text-lg underline font-semibold mb-3">{title}</h3>
        <div className="w-full flex flex-col gap-1">{children}</div>
    </div>
)

export default ProfilePage
