import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import {
    FaHome,
    FaHospital,
    FaQuestion,
    FaUser,
    FaFileAlt,
    FaHeartbeat,
    FaClipboardList,
    FaCog,
    FaExclamationCircle
} from "react-icons/fa";
import { PiFolderSimpleStarThin, PiListChecks } from "react-icons/pi";

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

    const user = useUser();

    const groupCode = user?.GROUP_CODE;

    let menus;

    if (groupCode === "100") {
        menus = ["Manage", "Missing Info", "All Claims"];
    } else if (groupCode === "0") {
        menus = ["Profile", "Health Card", "All Claims"];
    } else {
        menus = ["Profile", "All Claims"];
    }

    menus.push("FAQ", "Hospitals", "New Claim")

    menus.sort()

    const iconMap = {
        "Profile": <FaUser />,
        "All Claims": <PiListChecks/> , 
        "New Claim": <PiFolderSimpleStarThin />,
        "Health Card": <FaHeartbeat />,
        "Hospitals": <FaHospital />,
        "Death Claim": <FaClipboardList />,
        "Manage": <FaCog />,
        "FAQ": <FaQuestion />,
    };

    const handleLinkClick = () => {
        setSidebarOpen(false);
    };

    return (
        <aside
            className={`absolute left-0 top-0 h-full w-64
            bg-gray-800 border-r border-gray-700
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col z-40`}

        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 text-sm">
                <div className="flex flex-col items-center gap-3 mt-10">
                    <img
                        src={`http://localhost/admin/img/${user?.POLICY_NO}.png`}
                        alt="User Logo"
                        className="w-28 h-auto"
                    />
                    <h2 className={`font-semibold text-gray-400 ${sidebarOpen ? "" : "hidden"}`}>
                        {user?.ORGANIZATION}
                        <br />
                        ({user?.POLICY_NO})
                    </h2>
                </div>
            </div>

            <hr className="w-[90%] mx-auto bg-gray-600 text-gray-700" />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 text-gray-300">
                <Link
                    className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex gap-2 items-center"
                    to="/dashboard"
                    onClick={handleLinkClick}
                >
                    <FaHome /> Home
                </Link>

                {menus.map((menu, index) => (
                    <Link
                        key={index}
                        className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex gap-2 items-center"
                        to={`/dashboard/${menu.toLowerCase().replace(/\s+/g, "")}`}
                        onClick={handleLinkClick}
                    >
                        {iconMap[menu] || <FaFileAlt />} {menu}
                    </Link>
                ))}

                {/* <Link
                    className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex flex-row gap-2 items-center"
                    to="/hospitals"
                >
                    <FaHospital /> Hospitals
                </Link> */}

                {/* <Link
                    className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex flex-row gap-2 items-center"
                    to="/faq"
                >
                    <FaQuestion /> F. A. Q
                </Link> */}
            </nav>
        </aside>
    );
};
