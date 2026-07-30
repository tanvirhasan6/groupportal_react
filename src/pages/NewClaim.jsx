import { useUser } from "../context/UserContext"
import HospitalizationClaim from "../components/NewClaimComponent/HospitalizationClaim";
import DeathClaim from "../components/NewClaimComponent/DeathClaim";
import { useNavigate } from "react-router-dom";
import { CiBank } from "react-icons/ci";


const ClaimForm = () => {

    const user = useUser()
    const navigate = useNavigate()

    const warning =
        !user?.ROUTINGNO?.trim() ||
        user.ROUTINGNO.trim().length !== 9 ||
        !user?.ACCNO?.trim();

    return (
        <div className="w-full text-white flex justify-center items-start p-2">

            {warning ? (
                <div className="w-full max-w-3xl mx-auto mt-6">
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="flex items-start gap-4 p-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-3xl">
                                <CiBank/>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-amber-300">
                                    ব্যাংক তথ্য প্রয়োজন
                                </h2>

                                <p className="mt-2 text-gray-200 leading-7">
                                    আগে আপনার ব্যাংক অ্যাকাউন্টের তথ্য সম্পূর্ণ করুন।
                                    বৈধ <span className="font-semibold text-white">Routing Number</span> এবং
                                    <span className="font-semibold text-white"> Account Number</span> সংরক্ষণ করার
                                    পরেই ক্লেইম আবেদন করা যাবে।
                                </p>

                                <div className="mt-5 rounded-xl border border-amber-400/20 bg-black/20 p-4">
                                    <p className="text-sm text-amber-200">
                                        আপনার প্রাপ্য ক্লেইমের অর্থ সরাসরি নিবন্ধিত ব্যাংক
                                        অ্যাকাউন্টে পাঠানো হবে। তাই সঠিক ব্যাংক তথ্য প্রদান করা
                                        বাধ্যতামূলক।
                                    </p>
                                </div>

                                <button
                                    className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400 cursor-pointer" onClick={()=>navigate('/dashboard/profile')}
                                >
                                    ব্যাংক তথ্য আপডেট করুন
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : user?.GROUP_CODE === "0" ? (
                <HospitalizationClaim />
            ) : (
                <DeathClaim />
            )}
        </div>
    )
}

export default ClaimForm