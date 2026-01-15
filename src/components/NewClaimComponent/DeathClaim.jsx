import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DatePickerInput from "../MyDatePicker/DatePickerInput";
import SearchableSelect from "../SearchableSelect";
import { useUser } from "../../context/UserContext"
import { useNavigate } from "react-router-dom"

export default function DeathClaim() {

    const user = useUser()

    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    const [beneficiary, setBeneficiary] = useState({})
    const [slotData, setSlotData] = useState([])
    const [selectedSlot, setSelectedSlot] = useState(null)

    const [minConsultDate, setConsultMinDate] = useState(null)

    const [benefitData, setBenefitData] = useState([])
    const [selectedBenefit, setSelectedBenefit] = useState(null)
    const [deathListData, setDeathListData] = useState([])
    const [deathPlaceListData, setDeathPlaceListData] = useState([])

    const [prescriptionFiles, setPrescriptionFiles] = useState([]);
    const [testFiles, setTestFiles] = useState([]);
    const [idFiles, setIdFiles] = useState([]);
    const [cityCorporationFiles, setCityCorporationFiles] = useState([]);
    const [hospitalFiles, setHospitalFiles] = useState([]);
    const [policyHolderFiles, setPolicyHolderFiles] = useState([]);
    const [postMortemFiles, setPostMortemFiles] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);

    const [formData, setFormData] = useState({
        idno: "",
        coverage: "",
        deathDate: "",
        claimType: "",
        death: "",
        deathName: "",
        deathPlace: "",
        deathPlaceName: "",
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
        ...postMortemFiles,
        ...otherFiles,
    ]

    const handleChange = (e) => {

        const { name, value } = e.target

        if (name === "idno") {
            setFormData((prev) => ({ ...prev, idno: value }))
            getBeneficiaryData(value)
        }

        if (name === "amount") {
            if (value === "") {
                setFormData((prev) => ({ ...prev, amount: "" }));
                return;
            }

            let newValue = Number(value);
            if (newValue < 1) newValue = 1;
            if (
                selectedBenefit?.AMOUNT_LIMIT &&
                newValue > selectedBenefit.AMOUNT_LIMIT
            ) {
                newValue = selectedBenefit.AMOUNT_LIMIT;
            }

            setFormData((prev) => ({ ...prev, amount: newValue }));
            return;
        }

        if (name === "coverage") {
            const data = slotData.find((slot) => slot.SLOT_END === value) || null;
            setSelectedSlot(data);

            setFormData((prev) => ({
                ...prev,
                coverage: value,
                claimType: "",
                amount: "",
            }));
            return;
        }

        if (name === "claimType") {
            const data = benefitData.find((b) => b.BENEFIT_CODE === value) || null;
            setSelectedBenefit(data);

            setFormData((prev) => ({
                ...prev,
                claimType: value,
                amount: "",
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const FileInput = ({ label, files, setFiles }) => {
        const handleFileChange = (e) => {
            if (!e.target.files) return;
            const newFiles = Array.from(e.target.files).filter(
                (file) => !allSelectedFiles.some((f) => f.name === file.name)
            );
            setFiles([...files, ...newFiles]);
            e.target.value = "";
        };

        const removeFile = (fileName) => {
            setFiles(files.filter((f) => f.name !== fileName));
        };

        return (
            <div className="border border-white/20 rounded-xl p-4 bg-gray-900/40 hover:bg-gray-900/60 transition">
                <label className="block text-sm mb-2 text-gray-300">{label}</label>

                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="file:bg-cyan-600 file:hover:bg-cyan-700 file:border-0 file:rounded-md file:px-4 file:py-1 file:text-white text-gray-400 text-sm"
                />

                <ul className="mt-2">
                    {files.map((file) => (
                        <li
                            key={file.name}
                            className="flex justify-between items-center mt-1 bg-gray-800 p-2 rounded"
                        >
                            <span>{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(file.name)}
                                className="text-red-500 hover:text-red-700 font-bold"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    const getBeneficiaryData = async (i) => {

        setBeneficiary({})

        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/deathClaim/beneficiary?beneficiary=${i}&policyno=${user.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()
            if (data?.status === 200) {
                setBeneficiary(data?.result?.[0])

                if (data?.result?.[0].NAME) {
                    getSlotData(i)
                    deathList()
                    deathPlaceList()
                }
            }
            else toast.error(`Data Error: ${data?.message}`)

        } catch (error) {
            toast.error(`${error}`)
        }
    }

    const getSlotData = async (i) => {
        setSlotData([]);
        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/claim/slot?userid=${i}&policyno=${user.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (data?.status === 404) {
                // console.log("No Slot Found");

                toast.error("No Slot Found");
            }
            else if (data?.status === 200) setSlotData(data.result);
            else toast.error(`Slot Error: ${data?.message}`);
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    const getBenefitData = async () => {
        if (!formData.coverage) return toast.error("Select Coverage Period first");
        setBenefitData([]);
        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/claim/benifitList?userid=${formData.idno}&policyno=${user.POLICY_NO}&slotstart=${selectedSlot?.SLOT_START}&slotend=${selectedSlot?.SLOT_END}&type=D`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (data?.status === 404) toast.error("No Benefit Found");
            else if (data?.status === 200) setBenefitData(data.result);
            else toast.error(`Benefit Data Error: ${data?.message}`);
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    const deathList = async () => {
        setDeathListData([])
        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/deathClaim/deathReason`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (data?.status === 200) {
                const formatted = (data.result || []).map((item) => ({
                    value: item.CODE,
                    label: item.DESCRIPTION,
                }));
                setDeathListData(formatted);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    const deathPlaceList = async () => {
        setDeathPlaceListData([])
        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/deathClaim/deathPlace`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (data?.status === 200) {
                const formatted = (data.result || []).map((item) => ({
                    value: item.CODE,
                    label: item.DESCRIPTION,
                }));
                setDeathPlaceListData(formatted);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    useEffect(() => {
        if (formData.coverage) getBenefitData();
    }, [formData.coverage])

    const handleFormSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()

        try {
            const validate = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/claim/validateClaim?userid=${beneficiary}&policyno=${user?.POLICY_NO}&claimType=${formData.claimType}&coverage=${formData.coverage}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await validate.json()

            if (data?.status === 200) {
                const res = data.result[0];

                setFormData((prev) => ({
                    ...prev,
                    maxlimit: res.CLAIM_LIMIT,
                    limitamount: res.REMAINING_BALANCE,
                    plan: res.PLAN,
                    ratio: res.BENEFIT_RATIO,
                    expHead: res.EXP_HEAD,
                    riskFrom: res.RISK_FROM
                }))

                if (formData.amount> res.REMAINING_BALANCE) return toast.error(`Exeed the Claim Amount Limit. Your Limit is ${res.REMAINING_BALANCE}`)

                const submissionData = new FormData();

                Object.keys(formData).forEach((k) => submissionData.append(k, formData[k]));

                submissionData.set("maxlimit", res.REMAINING_BALANCE)
                submissionData.set("limitamount", res.CLAIM_LIMIT)
                submissionData.set("plan", res.PLAN)
                submissionData.set("ratio", res.BENEFIT_RATIO)
                submissionData.set("expHead", res.EXP_HEAD)
                submissionData.set("riskFrom", res.RISK_FROM)

                prescriptionFiles.forEach(file => submissionData.append("prescriptionFiles", file))
                testFiles.forEach(file => submissionData.append("testFiles", file))
                idFiles.forEach(file => submissionData.append("idFiles", file))
                cityCorporationFiles.forEach(file => submissionData.append("cityCorporationFiles", file))
                hospitalFiles.forEach(file => submissionData.append("hospitalFiles", file))
                policyHolderFiles.forEach(file => submissionData.append("policyHolderFiles", file))
                postMortemFiles.forEach(file => submissionData.append("postMortemFiles", file))
                otherFiles.forEach(file => submissionData.append("otherFiles", file))

                try {
                    const res = await fetch(
                        `https://app.zenithlifebd.com:5001/api/grpclaimportal/deathClaim/submitClaim`,
                        {
                            method: "POST",
                            body: submissionData,
                            credentials: "include",
                            headers: {
                                "x-claim-type": formData.claimType,
                                "x-death-place": formData.deathPlace,
                            },
                        }
                    )

                    const text = await res.text()
                    let data

                    try {

                        data = JSON.parse(text)
                        console.log(data);
                        toast.success('Claim Successfull')

                        setTimeout(() => {
                            navigate("/dashboard", { replace: true });
                            return;
                        }, 1000);

                        
                    } catch {
                        console.error("Invalid JSON:", text)
                        setLoading(false)
                        return
                    }

                } catch (err) {
                    toast.error(`Upload failed: ${err}`)
                    setLoading(false)
                }

            } else {
                toast.error(`${data?.message}`)
                setLoading(false)
            }

        } catch (error) {
            toast.error(`${error}`)
            setLoading(false)
        }
    }

    return (

        <div className="w-full">

            <Toaster />

            <form onSubmit={handleFormSubmit} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8">

                <h1 className="text-center text-3xl font-semibold text-cyan-400">Death Claim</h1>

                <div className="flex flex-col sm:flex-row gap-2">

                    <div className='col-span-4 md:col-span-2'>
                        <label className="block text-sm mb-1 text-gray-300">Beneficiary ID</label>
                        <input
                            type="text"
                            name="idno"
                            placeholder={`Enter Beneficiary ID Number`}
                            value={formData.idno}
                            onChange={handleChange}
                            className="w-full sm:w-96 bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoComplete="off"
                        // disabled={!formData.claimType}
                        />
                    </div>

                    {
                        beneficiary?.NAME &&
                        <>
                            <div className='col-span-4 md:col-span-2'>
                                <label className="block text-sm mb-1 text-gray-300">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={beneficiary.NAME}
                                    className="w-full sm:w-96 bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    disabled={true}
                                />
                            </div>
                            <div className='col-span-4 md:col-span-2'>
                                <label className="block text-sm mb-1 text-gray-300">Department</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={beneficiary.DEPT_NAME}
                                    className="w-full sm:w-96 bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    disabled={true}
                                />
                            </div>
                        </>
                    }

                </div>

                {
                    beneficiary?.NAME &&

                    <>

                        <div className="grid md:grid-cols-12 gap-6">

                            <div className='col-span-4'>
                                <label className="block text-sm mb-1 text-gray-300">Coverage Period</label>
                                <select
                                    name="coverage"
                                    value={formData.coverage}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">Select</option>
                                    {slotData.map(slot => (
                                        <option key={slot.SLOT_END} value={slot.SLOT_END}>{slot.TIME_PERIOD}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='col-span-4'>
                                <label className="block text-sm mb-1 text-gray-300">Claim Type</label>
                                <select
                                    name="claimType"
                                    value={formData.claimType}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    disabled={!formData.coverage}
                                >
                                    <option value="">Select Claim Type</option>
                                    {benefitData.map(b => (
                                        <option key={b.BENEFIT_CODE} value={b.BENEFIT_CODE}>{b.BENEFIT_HEAD}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='col-span-4 md:col-span-2'>
                                <label className="block text-sm mb-1 text-gray-300">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder={`Enter Amount ${selectedBenefit?.AMOUNT_LIMIT ? `1 - ${selectedBenefit.AMOUNT_LIMIT}` : ''}`}
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    disabled={!formData.claimType}
                                />
                            </div>

                            <div className='col-span-4'>
                                <SearchableSelect
                                    label="Death Reason"
                                    options={deathListData}
                                    value={formData.death}
                                    onChange={
                                        (val) => {
                                            const selected = deathListData.find(d => d.value === val)
                                            setFormData(prev => ({
                                                ...prev,
                                                death: val,                 // CODE
                                                deathName: selected?.label // DESCRIPTION
                                            }))
                                        }
                                    }
                                    placeholder="Select Reason"
                                    disabled={!formData.coverage}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>

                            <div className='col-span-4'>
                                <SearchableSelect
                                    label="Place of Death"
                                    options={deathPlaceListData}
                                    value={formData.death}
                                    onChange={
                                        (val) => {
                                            const selected = deathPlaceListData.find(d => d.value === val)
                                            setFormData(prev => ({
                                                ...prev,
                                                deathPlace: val,                 // CODE
                                                deathPlaceName: selected?.label // DESCRIPTION
                                            }))
                                        }
                                    }
                                    placeholder="Select Place"
                                    disabled={!formData.coverage}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>

                            <DatePickerInput
                                name="deathDate"
                                label="Date of Death"
                                value={formData.deathDate}
                                onChange={(val) => setFormData(prev => ({ ...prev, deathDate: val }))}
                                maxDate={new Date()}
                                // minDate={minConsultDate}
                                disabled={!formData.coverage || !formData.claimType}
                            />


                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FileInput label="Prescription Files" files={prescriptionFiles} setFiles={setPrescriptionFiles} />
                            <FileInput label="Medical Test Files" files={testFiles} setFiles={setTestFiles} />
                            <FileInput label="Age Proof Files" files={idFiles} setFiles={setIdFiles} />
                            <FileInput label="Death Certificate-City Corporation/UP/Commissioner" files={cityCorporationFiles} setFiles={setCityCorporationFiles} />
                            <FileInput label="Death Certificate-Hospital" files={hospitalFiles} setFiles={setHospitalFiles} />
                            <FileInput label="Death Certificate-From You" files={policyHolderFiles} setFiles={setPolicyHolderFiles} />
                            <FileInput label="Post Mortem/Waiver Files" files={postMortemFiles} setFiles={setPostMortemFiles} />
                            <FileInput label="Other Files" files={otherFiles} setFiles={setOtherFiles} />
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="px-8 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md shadow-md transition-all hover:scale-105"
                                disabled={loading}
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
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Apply'
                                    )
                                }
                            </button>
                        </div>

                    </>

                }

            </form>

        </div>

    )
}
