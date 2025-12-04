import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DatePickerInput from "../MyDatePicker/DatePickerInput";
import SearchableSelect from "../SearchableSelect";
import { useUser } from "../../context/UserContext"
import { replace, useNavigate } from "react-router-dom";

const HospitalizationClaim = () => {

    const user = useUser()
    const navigate =useNavigate()

    const [prescriptionFiles, setPrescriptionFiles] = useState([]);
    const [testFiles, setTestFiles] = useState([]);
    const [receiptFiles, setReceiptFiles] = useState([]);
    const [dischargeFiles, setDischargeFiles] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);

    const [diseasesData, setDiseasesData] = useState([]);
    const [hospitalData, setHospitalData] = useState([]);
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
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
    });

    const allSelectedFiles = [
        ...prescriptionFiles,
        ...testFiles,
        ...receiptFiles,
        ...dischargeFiles,
        ...otherFiles,
    ];

    const [slotData, setSlotData] = useState([]);
    const [benefitData, setBenefitData] = useState([]);

    const [minConsultDate, setConsultMinDate] = useState(null);
    const [minAdmissionDate, setMinAdmissionMinDate] = useState(null);
    const [minDischargeDate, setMinDischargeDate] = useState(null);

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedBenefit, setSelectedBenefit] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

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
    };

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
    };

    const getSlotData = async () => {
        setSlotData([]);
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claim/slot?userid=${user?.USERNAME}&policyno=${user.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (data?.status === 404) {
                console.log("No Slot Found");

                toast.error("No Slot Found");
            }
            else if (data?.status === 200) setSlotData(data.result);
            else toast.error(`Slot Error: ${data?.message}`);
        } catch (error) {
            toast.error(`${error}`);
        }
    };

    const getBenefitData = async () => {
        if (!formData.coverage) return toast.error("Select Coverage Period first");
        setBenefitData([]);
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claim/benifitList?userid=${user?.USERNAME}&policyno=${user.POLICY_NO}&slotstart=${selectedSlot?.SLOT_START}&slotend=${selectedSlot?.SLOT_END}`,
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
    };

    const diseasesList = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claim/diseases`,
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
                setDiseasesData(formatted);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    };

    const hospitalList = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claim/hospitals`,
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
                setHospitalData(formatted);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    };

    useEffect(() => {
        if (user?.USERNAME) {
            getSlotData();
            diseasesList();
            hospitalList();
        }
    }, [user?.USERNAME]);

    useEffect(() => {
        if (formData.coverage) getBenefitData();
    }, [formData.coverage]);

    useEffect(() => {

        if (formData.claimType) {

            const today = new Date()
            const minAllowedDate = new Date(today)

            if (selectedSlot?.GRACE_PERIOD) minAllowedDate.setDate(today.getDate() - selectedSlot.GRACE_PERIOD)

            setConsultMinDate(formData.claimType === "102" ? null : minAllowedDate)
            setMinDischargeDate(formData.claimType === "103" ? null : minAllowedDate)

        }

    }, [formData.claimType, selectedSlot?.GRACE_PERIOD])

    useEffect(() => {

        if (formData.consultDate) {
            const [day, month, year] = formData.consultDate.split("/").map(Number);
            const dateObj = new Date(year, month - 1, day)
            if (formData.claimType === '102') {
                setMinAdmissionMinDate(dateObj)
                setMinDischargeDate(dateObj)
                setFormData(prev => ({
                    ...prev,
                    admissionDate: "",
                    dischargeDate: "",
                }))
            }
        }

    }, [formData.consultDate])

    useEffect(() => {

        if (formData.admissionDate) {
            const [day, month, year] = formData.admissionDate.split("/").map(Number);
            const dateObj = new Date(year, month - 1, day)
            if (formData.claimType === '102') {
                setMinDischargeDate(dateObj)
                setFormData(prev => ({
                    ...prev,
                    dischargeDate: "",
                }))
            }
        }

    }, [formData.admissionDate])

    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault();

        if (formData.claimType === "102" && dischargeFiles.length === 0) {
            toast.error("Please, provide discharge file!");
            return;
        }

        if (prescriptionFiles.length === 0) {
            toast.error("Please, provide prescription file!");
            return;
        }

        try {
            const validate = await fetch(
                `http://localhost:5001/api/grpclaimportal/claim/validateClaim?userid=${user?.USERNAME}&policyno=${user?.POLICY_NO}&claimType=${formData.claimType}&coverage=${formData.coverage}`,
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

                submissionData.set("maxlimit", res.REMAINING_BALANCE);
                submissionData.set("limitamount", res.CLAIM_LIMIT);
                submissionData.set("plan", res.PLAN);
                submissionData.set("ratio", res.BENEFIT_RATIO);
                submissionData.set("expHead", res.EXP_HEAD);
                submissionData.set("riskFrom", res.RISK_FROM);

                prescriptionFiles.forEach(file => submissionData.append("prescriptionFiles", file));
                dischargeFiles.forEach(file => submissionData.append("dischargeFiles", file));
                testFiles.forEach(file => submissionData.append("testFiles", file));
                receiptFiles.forEach(file => submissionData.append("receiptFiles", file));
                otherFiles.forEach(file => submissionData.append("otherFiles", file));

                try {
                    const res = await fetch(
                        `http://localhost:5001/api/grpclaimportal/claim/submitClaim`,
                        {
                            method: "POST",
                            body: submissionData,
                            credentials: "include",
                            headers: {
                                "x-claim-type": formData.claimType,
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

    };

    return (
        <div className="w-full">
            <Toaster />
            <form onSubmit={handleSubmit} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8">
                <h1 className="text-center text-3xl font-semibold text-cyan-400">New Claim</h1>

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

                    <div className='col-span-4 w-full flex flex-col sm:flex-row gap-2'>
                        <DatePickerInput
                            name="consultDate"
                            label="Consult/Treatment Date"
                            value={formData.consultDate}
                            onChange={(val) => setFormData(prev => ({ ...prev, consultDate: val }))}
                            maxDate={new Date()}
                            minDate={minConsultDate}
                            disabled={!formData.coverage || !formData.claimType}
                        />
                        {formData.claimType === '102' && (
                            <>
                                <DatePickerInput
                                    name="admissionDate"
                                    label="Admission Date"
                                    value={formData.admissionDate}
                                    onChange={(val) => setFormData(prev => ({ ...prev, admissionDate: val }))}
                                    maxDate={new Date()}
                                    minDate={minAdmissionDate}
                                    disabled={!formData.coverage || !formData.claimType}
                                />
                                <DatePickerInput
                                    name="dischargeDate"
                                    label="Discharge Date"
                                    value={formData.dischargeDate}
                                    onChange={(val) => setFormData(prev => ({ ...prev, dischargeDate: val }))}
                                    maxDate={new Date()}
                                    minDate={minDischargeDate}
                                    disabled={!formData.coverage || !formData.claimType}
                                />
                            </>
                        )}
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

                    <div className='col-span-4 md:col-span-5'>
                        <SearchableSelect
                            label="Disease"
                            options={diseasesData}
                            value={formData.disease}
                            onChange={
                                (val) => {
                                    const selected = diseasesData.find(d => d.value === val)
                                    setFormData(prev => ({
                                        ...prev,
                                        disease: val,                 // CODE
                                        diseaseName: selected?.label // DESCRIPTION
                                    }))
                                }
                            }
                            placeholder="Select Disease"
                            disabled={false}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className='col-span-4 md:col-span-5'>
                        <SearchableSelect
                            label="Hospital"
                            options={hospitalData}
                            value={formData.hospital}
                            onChange={
                                (val) => {
                                    const selected = hospitalData.find(d => d.value === val)
                                    setFormData(prev => ({
                                        ...prev,
                                        hospital: val,                 // CODE
                                        hospitalName: selected?.label // DESCRIPTION
                                    }))
                                }
                            }
                            placeholder="Select Hospital"
                            disabled={false}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {formData.claimType === '102' && (
                        <FileInput label="Discharge Files" files={dischargeFiles} setFiles={setDischargeFiles} />
                    )}
                    <FileInput label="Prescription Files" files={prescriptionFiles} setFiles={setPrescriptionFiles} />
                    <FileInput label="Medical Test Files" files={testFiles} setFiles={setTestFiles} />
                    <FileInput label="Money Receipt/ Bill Files" files={receiptFiles} setFiles={setReceiptFiles} />
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
            </form>
        </div>
    )
}

export default HospitalizationClaim