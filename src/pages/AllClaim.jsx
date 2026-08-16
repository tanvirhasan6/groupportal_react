import React, { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiChevronDown, FiEye, FiSearch, FiFilter, FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiXCircle, FiDownload } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";

const claimData = [
    {
        id: 1,
        name: "MD. ROKNUZZAMAN",
        studentId: "2410837119",
        phone: "01908382481",
        faculty: "Faculty of Business Studies",
        department: "Banking and Insurance",
        benefit: "OUT PATIENT TREATMENT COVERAGE (OPD)",
        appliedDate: "31-MAY-2026",
        uploadedDate: "12-JUN-2026",
        claimed: 3400,
        approved: 1439,
        status: "PAYMENT COMPLETED",
    },
    {
        id: 2,
        name: "MD. BIPLOB",
        studentId: "2410345166",
        phone: "01827385405",
        faculty: "Faculty of Social Science",
        department: "Sociology",
        benefit: "IN PATIENT TREATMENT COVERAGE (IPD)",
        appliedDate: "31-MAR-2026",
        uploadedDate: "22-APR-2026",
        claimed: 40500,
        approved: 36300,
        status: "PAYMENT COMPLETED",
    },
    {
        id: 3,
        name: "FARZANA AKTER",
        studentId: "2212109180",
        phone: "01956423251",
        faculty: "Faculty of Arts",
        department: "Islamic Studies",
        benefit: "IN PATIENT TREATMENT COVERAGE (IPD)",
        appliedDate: "31-MAR-2026",
        uploadedDate: "23-APR-2026",
        claimed: 22903,
        approved: 19585,
        status: "PAYMENT COMPLETED",
    },
    {
        id: 4,
        name: "SANDEEPAN DAS",
        studentId: "2010922194",
        phone: "01879246080",
        faculty: "Faculty of Science",
        department: "Physics",
        benefit: "OUT PATIENT TREATMENT COVERAGE (OPD)",
        appliedDate: "31-JUL-2026",
        uploadedDate: "31-JUL-2026",
        claimed: 7835,
        approved: 0,
        status: "WORKING",
        progress: 0,
    },
    {
        id: 5,
        name: "REDOWAN MUNSI",
        studentId: "2210558104",
        phone: "01800000000",
        faculty: "Faculty of Biological",
        department: "Botany",
        benefit: "OUT PATIENT TREATMENT COVERAGE (OPD)",
        appliedDate: "31-JUL-2026",
        uploadedDate: "31-JUL-2026",
        claimed: 2755,
        approved: 0,
        status: "WORKING",
        progress: 0,
    },
];

function StageProgress({ currentStep, totalSteps, stepLabels }) {
    return (
        <div className="w-full py-1">
            <div className="flex items-center">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const step = index + 1;
                    const isLast = step === totalSteps;
                    const completed = step < currentStep;
                    const active = step === currentStep;
                    const label = stepLabels?.[index] || `Step ${step}`;

                    return (
                        <div
                            key={step}
                            className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
                        >
                            {/* Step */}
                            <div className="flex flex-col items-center shrink-0">
                                <div
                                    className={`
                                        relative w-6 h-6 rounded-full
                                        flex items-center justify-center
                                        text-[11px] font-medium
                                        transition-all duration-300
                                        ${completed
                                            ? "bg-indigo-500/15 border border-indigo-400 text-indigo-300"
                                            : active
                                                ? "bg-indigo-500 border border-indigo-400 text-white ring-4 ring-indigo-500/15"
                                                : "bg-slate-800 border border-slate-700 text-slate-500"
                                        }
                                    `}
                                >
                                    {completed ? (
                                        "✓"
                                    ) : (
                                        step
                                    )}
                                </div>

                                <span
                                    className={`
                                        mt-2 text-[11px] font-medium tracking-wide text-center leading-tight whitespace-nowrap
                                        ${completed
                                            ? "text-slate-300"
                                            : active
                                                ? "text-indigo-300"
                                                : "text-slate-500"
                                        }
                                    `}
                                >
                                    {label}
                                </span>
                            </div>

                            {/* Connector */}
                            {!isLast && (
                                <div className="flex-1 h-px mx-1.5 -mt-5 bg-slate-700/70 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-400/70 transition-all duration-500"
                                        style={{ width: completed ? "100%" : "0%" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-US");

const getStatusClass = (status) => {
    switch (status) {
        case "PAYMENT COMPLETED":
            return "text-[#00d5b5] bg-[#00d5b5]/10 border-[#00d5b5]/20";

        case "WORKING":
            return "text-[#00c4d9] bg-[#00c4d9]/10 border-[#00c4d9]/20";

        case "DECLINED BY ZENITH":
            return "text-red-400 bg-red-400/10 border-red-400/20";

        case "APPROVED AND PAYMENT PROCESSING":
            return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";

        case "ADDITIONAL DOCUMENT REQUIRED BY ZENITH":
            return "text-orange-400 bg-orange-400/10 border-orange-400/20";

        default:
            return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
};

const SelectBox = ({
    label,
    value,
    options,
    onChange,
}) => {
    return (
        <div className="w-full">
            <label className="mb-2 block text-[11px] font-semibold text-slate-400">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className=" h-[42px] w-full appearance-none rounded-lg border border-[#34465c] bg-[#162235] px-3 pr-10 text-[12px] text-slate-200 outline-none transition focus:border-[#00bfd3] focus:ring-2 focus:ring-[#00bfd3]/10 "
                >
                    {options.map((option) => (
                        <option
                            key={option}
                            value={option}
                            className="bg-[#162235] text-slate-200"
                        >
                            {option}
                        </option>
                    ))}
                </select>

                <FiChevronDown
                    className=" pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#00bfd3] "
                    size={15}
                />
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={` inline-flex rounded-md border px-2 py-1 text-[9px] font-bold leading-tight ${getStatusClass(status)} `}
        >
            {status}
        </span>
    );
};

const SummaryCard = ({
    icon,
    title,
    applications,
    amount,
}) => {
    return (
        <div
            className=" flex items-center gap-3
        rounded-xl
        border
        border-[#2d3d52]
        bg-[#182538]
        p-4
      "
        >
            <div
                className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-[#00bfd3]/10
          bg-[#00bfd3]/10
          text-[#00c4d9]
        "
            >
                {icon}
            </div>

            <div>
                <p className="text-[10px] text-slate-500">
                    {title}
                </p>

                <p className="mt-0.5 text-lg font-bold text-slate-200">
                    {applications}
                </p>

                <p className="mt-0.5 text-[10px] text-[#00d0b3]">
                    {amount}
                </p>
            </div>
        </div>
    );
};

const AllClaims = () => {
    
    const user = useUser()
    const [year, setYear] = useState("Select");
    const [benefit, setBenefit] = useState("All Type");
    const [department, setDepartment] = useState("All Department");
    const [status, setStatus] = useState("All Status");
    const [studentSearch, setStudentSearch] = useState("");
    const [loading, setLoading] = useState(false)
    const [claimData, setClaimData] = useState([])
    const [filteredData, setFilteredData] = useState([])


    const getClaimData = async() => {
        setLoading(true)

        try {

            const getList = await fetch(
                `http://localhost:5002/api/grpclaimportal/allClaimList`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        policyno: user?.POLICY_NO,
                        userid: user?.USERNAME,
                        groupCode: user?.GROUP_CODE,
                        status: '',
                    }),
                }
            )

            const data = await getList.json();
            console.log(data);

            // if (data?.status === 200) {
            //     setClaimData(data)
            // }else{

            // }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getClaimData()
    },[user?.USERNAME])

    const benefitOptions = useMemo(() => {
        return [
            "All Type",
            ...new Set(
                claimData
                    .map((item) => item.BENEFIT_TYPE)
                    .filter(Boolean)
            ),
        ];
    }, [claimData]);

    const statusOptions = useMemo(() => {
        return [
            "All Status",
            ...new Set(
                claimData
                    .map((item) => item.CLAIM_STATUS)
                    .filter(Boolean)
            ),
        ];
    }, [claimData]);

    const yearOptions = useMemo(() => {
        const years = claimData
            .map((item) => {
                if (!item.APPLIED_DATE) return null;

                const match = String(item.APPLIED_DATE).match(/\d{4}/);

                return match ? match[0] : null;
            })
            .filter(Boolean);

        return [
            "Select",
            ...Array.from(new Set(years)).sort((a, b) => b - a),
        ];
    }, [claimData]);

    const departmentOptions = useMemo(() => {
        return [
            "All Department",
            ...new Set(
                claimData.map((item) => item.department)
            ),
        ];
    }, []);

    const filteredClaims = useMemo(() => {
        return claimData.filter((claim) => {
            const yearMatch =
                year === "Select" ||
                claim.appliedDate.includes(year);

            const benefitMatch =
                benefit === "All Type" ||
                claim.benefit === benefit;

            const departmentMatch =
                department === "All Department" ||
                claim.department === department;

            const statusMatch =
                status === "All Status" ||
                claim.status === status;

            const search = studentSearch.toLowerCase().trim();

            const studentMatch =
                !search ||
                claim.studentId.toLowerCase().includes(search) ||
                claim.name.toLowerCase().includes(search);

            return (
                yearMatch &&
                benefitMatch &&
                departmentMatch &&
                statusMatch &&
                studentMatch
            );
        });
    }, [
        year,
        benefit,
        department,
        status,
        studentSearch,
    ]);

    const clearFilters = () => {
        setYear("Select");
        setBenefit("All Type");
        setDepartment("All Department");
        setStatus("All Status");
        setStudentSearch("");
    };

    return (
        <div className="min-h-screen bg-[#101828] text-slate-200">

            {/* ================= HEADER ================= */}

            {/* <div
                className="
                border-b
                border-[#29394d]
                bg-[#111c2d]
                px-4
                py-4
                sm:px-6
                lg:px-8
            "
            >
                <button
                    type="button"
                    className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-[#00bfd3]
                    transition
                    hover:text-[#24d9ea]
                "
                >
                    <FiArrowLeft size={15} />
                    All Claims
                </button>

                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            All Claims
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Search, filter and review submitted student claims.
                        </p>
                    </div>

                    <div
                        className="
                            hidden
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-[#304156]
                            bg-[#172336]
                            px-3
                            py-2
                            text-xs
                            text-[#00bfd3]
                            sm:flex
                        "
                    >
                        <FiFileText size={14} />
                        {filteredClaims.length} Claims
                    </div>
                </div>
            </div> */}

            {/* ================= CONTENT ================= */}

            <div className="mx-auto max-w-[1900px] px-4 py-6 sm:px-6 lg:px-8">

                {/* ================= FILTER CARD ================= */}

                <div
                    className="
            rounded-xl
            border
            border-[#2d3d52]
            bg-[#1b283a]
            p-5
            shadow-xl
            shadow-black/10
          "
                >

                    {/* Filter title */}

                    <div className="flex items-center gap-3">

                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                border
                border-[#00bfd3]/10
                bg-[#00bfd3]/10
                text-[#00c4d9]
              "
                        >
                            <FiFilter size={17} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-slate-100">
                                Filter Claims
                            </h2>

                            <p className="mt-0.5 text-[10px] text-slate-500">
                                Use the filters below to find a specific claim.
                            </p>
                        </div>
                    </div>

                    {/* Filters */}

                    <div
                        className="
              mt-6
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
                    >

                        <SelectBox
                            label="Year"
                            value={year}
                            options={yearOptions}
                            onChange={setYear}
                        />

                        <SelectBox
                            label="Benefit Type"
                            value={benefit}
                            options={benefitOptions}
                            onChange={setBenefit}
                        />

                        <SelectBox
                            label="Department"
                            value={department}
                            options={departmentOptions}
                            onChange={setDepartment}
                        />

                        <SelectBox
                            label="Status"
                            value={status}
                            options={statusOptions}
                            onChange={setStatus}
                        />

                        {/* Search */}

                        <div className="md:col-span-2 xl:col-span-2">
                            <label className="mb-2 block text-[11px] font-semibold text-slate-400">
                                Student ID / Name
                            </label>

                            <div className="relative">
                                <FiSearch
                                    className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-600
                  "
                                    size={15}
                                />

                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) =>
                                        setStudentSearch(e.target.value)
                                    }
                                    placeholder="Search student ID or name..."
                                    className="
                    h-[42px]
                    w-full
                    rounded-lg
                    border
                    border-[#34465c]
                    bg-[#162235]
                    pl-10
                    pr-3
                    text-[12px]
                    text-slate-200
                    outline-none
                    placeholder:text-slate-600
                    focus:border-[#00bfd3]
                    focus:ring-2
                    focus:ring-[#00bfd3]/10
                  "
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer */}

                    <div
                        className="
              mt-5
              flex
              flex-col
              justify-between
              gap-3
              border-t
              border-[#293a50]
              pt-4
              sm:flex-row
              sm:items-center
            "
                    >
                        <span className="text-[11px] text-slate-500">
                            {filteredClaims.length} result
                            {filteredClaims.length !== 1 ? "s" : ""} found
                        </span>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="
                rounded-lg
                border
                border-[#34465b]
                bg-[#172438]
                px-3
                py-2
                text-[11px]
                text-slate-400
                transition
                hover:border-[#00aabd]
                hover:text-[#00c6d8]
              "
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* ================= TABLE ================= */}

                <div
                    className="
            mt-5
            overflow-hidden
            rounded-xl
            border
            border-[#2d3d52]
            bg-[#1b283a]
            shadow-xl
            shadow-black/10
          "
                >

                    {/* Table Header */}

                    <div
                        className="
              flex
              flex-col
              justify-between
              gap-3
              border-b
              border-[#29394d]
              p-5
              sm:flex-row
              sm:items-center
            "
                    >
                        <div>
                            <h2 className="text-sm font-semibold text-slate-100">
                                Claims List
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-500">
                                Submitted applications and current processing status.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-[#34465b]
                bg-[#172438]
                px-3
                py-2
                text-[11px]
                text-slate-400
                transition
                hover:border-[#00aabd]
                hover:text-[#00c6d8]
              "
                        >
                            <FiDownload size={14} />
                            Export
                        </button>
                    </div>

                    {/* Horizontal scrolling is intentional for desktop table */}

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1500px] border-collapse">

                            <thead>
                                <tr className="bg-[#142033]">

                                    {[
                                        "SL",
                                        "Student",
                                        "Faculty",
                                        "Department",
                                        "Description",
                                        "Applied Date",
                                        "Uploaded",
                                        "Claimed",
                                        "Approved",
                                        "Status",
                                        "View",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="
                        whitespace-nowrap
                        border-b
                        border-[#29394d]
                        px-3
                        py-3
                        text-left
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                                        >
                                            {heading}
                                        </th>
                                    ))}

                                </tr>
                            </thead>

                            <tbody>

                                {filteredClaims.map((claim) => (

                                    <tr
                                        key={claim.id}
                                        className="
                      border-b
                      border-[#29384b]
                      transition
                      hover:bg-[#202e42]
                    "
                                    >

                                        {/* SL */}

                                        <td
                                            className="
                        px-3
                        py-3
                        text-[10px]
                        font-bold
                        text-slate-600
                      "
                                        >
                                            {claim.id}
                                        </td>

                                        {/* Student */}

                                        <td className="px-3 py-3">

                                            <div className="flex min-w-[200px] items-center gap-2">

                                                <div
                                                    className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#24364b]
                            text-xs
                            font-bold
                            text-[#00bfd3]
                          "
                                                >
                                                    {claim.name.charAt(0)}
                                                </div>

                                                <div>

                                                    <p className="text-[11px] font-semibold text-slate-200">
                                                        {claim.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                                        {claim.studentId}
                                                    </p>

                                                    <p className="mt-0.5 text-[9px] text-slate-600">
                                                        Cell: {claim.phone}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Faculty */}

                                        <td className="max-w-[170px] px-3 py-3 text-[10px] leading-4 text-slate-400">
                                            {claim.faculty}
                                        </td>

                                        {/* Department */}

                                        <td className="px-3 py-3 text-[10px] text-slate-400">
                                            {claim.department}
                                        </td>

                                        {/* Benefit */}

                                        <td className="max-w-[190px] px-3 py-3 text-[10px] leading-4 text-slate-400">
                                            {claim.benefit}
                                        </td>

                                        {/* Applied */}

                                        <td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-400">
                                            {claim.appliedDate}
                                        </td>

                                        {/* Uploaded */}

                                        <td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-400">
                                            {claim.uploadedDate}
                                        </td>

                                        {/* Claimed */}

                                        <td className="whitespace-nowrap px-3 py-3 text-right text-[10px] font-bold text-slate-300">
                                            {formatAmount(claim.claimed)}
                                        </td>

                                        {/* Approved */}

                                        <td className="whitespace-nowrap px-3 py-3 text-right text-[10px] font-bold text-[#00d0b3]">
                                            {formatAmount(claim.approved)}
                                        </td>

                                        {/* Status */}

                                        <td className="px-3 py-3">

                                            <div className="min-w-[190px]">

                                                <StatusBadge
                                                    status={claim.status}
                                                />

                                                {claim.status === "WORKING" && (
                                                    <div className="relative mt-2 h-[17px] overflow-hidden rounded bg-[#2b3b4e]">

                                                        <div
                                                            className="absolute inset-y-0 left-0 bg-[#00a9bd]"
                                                            style={{
                                                                width: `${claim.progress || 0}%`,
                                                            }}
                                                        />

                                                        <span className="absolute left-1.5 top-[2px] text-[9px] text-slate-200">
                                                            {claim.progress || 0}%
                                                        </span>

                                                    </div>
                                                )}

                                            </div>

                                        </td>

                                        {/* View */}

                                        <td className="px-3 py-3">

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Replace with your navigate/modal logic
                                                    console.log("View claim:", claim);
                                                }}
                                                className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-[#34475c]
                          bg-[#172438]
                          text-[#00bfd3]
                          transition
                          hover:border-[#00bfd3]
                          hover:bg-[#00aabd]
                          hover:text-[#07131d]
                        "
                                            >
                                                <FiEye size={14} />
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                                {filteredClaims.length === 0 && (

                                    <tr>
                                        <td
                                            colSpan="11"
                                            className="
                        h-40
                        text-center
                        text-xs
                        text-slate-500
                      "
                                        >
                                            <FiAlertCircle
                                                className="mr-2 inline"
                                                size={15}
                                            />

                                            No claims found for the selected filters.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>
                </div>

                {/* ================= SUMMARY ================= */}

                <div
                    className="
            mt-5
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
                >

                    <SummaryCard
                        icon={<FiClock size={17} />}
                        title="Working"
                        applications="238"
                        amount="৳ 1,033,061"
                    />

                    <SummaryCard
                        icon={<FiAlertCircle size={17} />}
                        title="Additional Documents"
                        applications="84"
                        amount="৳ 347,926"
                    />

                    <SummaryCard
                        icon={<FiCheckCircle size={17} />}
                        title="Payment Completed"
                        applications="3,389"
                        amount="৳ 9,339,898"
                    />

                    <SummaryCard
                        icon={<FiXCircle size={17} />}
                        title="Declined"
                        applications="2,430"
                        amount="৳ 9,705,654"
                    />

                </div>

            </div>
        </div>
    );
};

export default AllClaims;