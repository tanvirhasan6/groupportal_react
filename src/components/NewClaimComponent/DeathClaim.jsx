import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DatePickerInput from "../MyDatePicker/DatePickerInput";
import SearchableSelect from "../SearchableSelect";
import { useUser } from "../../context/UserContext"
import { useNavigate } from "react-router-dom"

export default function DeathClaim() {

    const user = useUser()

    const navigate =useNavigate()
    
    const [prescriptionFiles, setPrescriptionFiles] = useState([]);
    const [testFiles, setTestFiles] = useState([]);
    const [idFiles, setIdFiles] = useState([]);
    const [cityCorporationFiles, setCityCorporationFiles] = useState([]);
    const [hospitalFiles, setHospitalFiles] = useState([]);
    const [policyHolderFiles, setPolicyHolderFiles] = useState([]);
    const [wardCommissionerFiles, setWardCommissionerFiles] = useState([]);
    const [upChairmanFiles, setUpChairmanFiles] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);

    const [slotData, setSlotData] = useState([])

    const [formData, setFormData] = useState({
        idno: "",
        coverage: "",
        consultDate: "",
        admissionDate: "",
        dischargeDate: "",
        claimType: "",
        disease: "",
        diseaseName: "",
        hospital: "",
        hospitalName: "",
        amount: "",
        maxlimit: 0,
        limitamount: 0,
        plan: "",
        ratio: 0,
        expHead: "",
        riskFrom: "",
    })

    const allSelectedFiles = [
        ...prescriptionFiles,
        ...testFiles,
        ...idFiles,
        ...cityCorporationFiles,
        ...hospitalFiles,
        ...policyHolderFiles,
        ...otherFiles,
    ]

    const handleFormSubmit = () => {
        console.log(user?.GROUP_CODE)
    }

    return (

        <div className="w-full">

            <Toaster />

            <form onSubmit={handleFormSubmit} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8">

                <h1 className="text-center text-3xl font-semibold text-cyan-400">Death Claim</h1>

                <div className='col-span-4 md:col-span-2'>
                    <label className="block text-sm mb-1 text-gray-300">Amount</label>
                    <input
                        type="text"
                        name="idno"
                        placeholder={`Enter Beneficiary ID Number`}
                        value={formData.idno}
                        onChange={handleChange}
                        className="w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={!formData.claimType}
                    />
                </div>

                <div className="grid md:grid-cols-12 gap-6">

                </div>


            </form>

        </div>

    )
}
