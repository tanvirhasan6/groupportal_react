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

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

    const user = useUser();

    const groupCode = user?.GROUP_CODE;

    let menus;

    if (groupCode === "100") {
        menus = ["Death Claim", "Manage", "Missing Info", "FAQ"];
    } else if (groupCode === "0") {
        menus = ["Profile", "New Claim", "Health Card", "FAQ"];
    } else {
        menus = ["Profile", "Death Claim"];
    }

    const iconMap = {
        "Profile": <FaUser />,
        "New Claim": <FaFileAlt />,
        "Health Card": <FaHeartbeat />,
        "Death Claim": <FaClipboardList />,
        "Manage": <FaCog />,
        "FAQ": <FaQuestion />,
    };

    return (
        <aside
            className={`h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-0"
                } overflow-hidden flex flex-col z-40`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <img
                        src={`https://app.zenithlifebd.com/admin/img/${user?.POLICY_NO}.png`}
                        alt="User Logo"
                    />
                    <h2 className={`text-xl font-semibold text-gray-600 ${sidebarOpen ? "" : "hidden"}`}>
                        {user?.ORGANIZATION}
                        <br />
                        ({user?.POLICY_NO})
                    </h2>
                </div>
            </div>

            <hr className="w-[90%] mx-auto bg-gray-600 text-gray-700" />

            {/* Navigation */}
            <nav className="flex flex-col p-4 space-y-2 text-gray-300">
                <Link
                    className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex flex-row gap-2 items-center"
                    to="/dashboard"
                >
                    <FaHome /> Home
                </Link>

                {menus.map((menu, index) => (
                    <Link
                        key={index}
                        className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex flex-row gap-2 items-center"
                        to={`/dashboard/${menu.toLowerCase().replace(/\s+/g, "")}`}
                    >
                        {iconMap[menu] || <FaFileAlt />} {menu}
                    </Link>
                ))}

                <Link
                    className="text-left px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-cyan-400 flex flex-row gap-2 items-center"
                    to="/hospitals"
                >
                    <FaHospital /> Hospitals
                </Link>

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
