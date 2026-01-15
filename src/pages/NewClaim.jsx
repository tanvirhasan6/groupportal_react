import { useUser } from "../context/UserContext"
import HospitalizationClaim from "../components/NewClaimComponent/HospitalizationClaim";
import DeathClaim from "../components/NewClaimComponent/DeathClaim";

const ClaimForm = () => {

    const user = useUser()
    // console.log(user);
    

    return (
        <div className="w-full text-white flex justify-center items-start p-2">
            {
                user?.GROUP_CODE === '0' &&
                <HospitalizationClaim />
            }
            {
                user?.GROUP_CODE !== '0' &&
                <DeathClaim />
            }
        </div>
    )
}

export default ClaimForm