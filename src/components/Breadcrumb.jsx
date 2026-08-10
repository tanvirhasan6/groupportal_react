import { Link, useLocation } from "react-router-dom";
import { FaChevronRight, FaHome } from "react-icons/fa";

export default function Breadcrumb() {
    const location = useLocation();

    const pathnames = location.pathname.split("/").filter(Boolean);

    return (
        <nav className="flex items-center text-sm text-gray-600 mb-4">
            <Link
                to="/dashboard"
                className="flex items-center hover:text-blue-600"
            >
                <FaHome className="mr-1" />
                Home
            </Link>

            {pathnames.slice(1).map((value, index) => {
                const to = "/" + pathnames.slice(0, index + 2).join("/");
                const isLast = index === pathnames.slice(1).length - 1;

                const label = value
                    .replace(/([A-Z])/g, " $1")
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                    <div key={to} className="flex items-center">
                        <FaChevronRight className="mx-2 text-xs" />

                        {isLast ? (
                            <span className="font-semibold text-gray-600">
                                {label}
                            </span>
                        ) : (
                            <Link
                                to={to}
                                className="hover:text-blue-600"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}