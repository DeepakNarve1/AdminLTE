import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const NotificationsDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [t] = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="nav-link flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 transition-colors relative"
      >
        <i className="far fa-bell text-xl" />
        <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-yellow-400 text-white text-[10px] font-bold rounded-full shadow-sm border border-white">
          15
        </span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <span className="block px-4 py-2 text-sm font-semibold text-center text-gray-700 bg-gray-50 border-b border-gray-100">
            {t("header.notifications.count", { quantity: "15" })}
          </span>

          <Link
            href="/"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center text-gray-700 text-sm">
              <i className="fas fa-envelope mr-3 text-lg w-5 text-center" />
              <span>
                {t("header.notifications.newMessagesCount", { quantity: "4" })}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {t("measurement.quantityUnit", { quantity: "3", unit: "mins" })}
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center text-gray-700 text-sm">
              <i className="fas fa-users mr-3 text-lg w-5 text-center" />
              <span>
                {t("header.notifications.friendRequestsCount", {
                  quantity: "5",
                })}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {t("measurement.quantityUnit", { quantity: "12", unit: "hours" })}
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center text-gray-700 text-sm">
              <i className="fas fa-file mr-3 text-lg w-5 text-center" />
              <span>
                {t("header.notifications.reportsCount", { quantity: "3" })}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {t("measurement.quantityUnit", { quantity: "2", unit: "days" })}
            </span>
          </Link>

          <Link
            href="/"
            className="block py-2 text-center text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            {t("header.notifications.seeAll")}
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
