import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "@app/components/Image";

const MessagesDropdown = () => {
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
        <i className="far fa-comments text-xl" />
        <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm border border-white">
          3
        </span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <Link
            href="/"
            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-start">
              <Image
                src={"/img/default-profile.png"}
                alt="User Avatar"
                width={40}
                height={40}
                rounded
                className="mr-3 shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {" "}
                    Brad Diesel{" "}
                  </h3>
                  <span className="text-xs text-red-500">
                    <i className="fas fa-star" />
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  Call me whenever you can...
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <i className="far fa-clock mr-1" />
                  <span>
                    {t("header.messages.ago", {
                      quantity: "30",
                      unit: "Minutes",
                    })}
                  </span>
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-start">
              <Image
                src={"/img/default-profile.png"}
                alt="User Avatar"
                width={40}
                height={40}
                rounded
                className="mr-3 shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {" "}
                    John Pierce{" "}
                  </h3>
                  <span className="text-xs text-gray-400">
                    <i className="fas fa-star" />
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  I got your message bro
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <i className="far fa-clock mr-1" />
                  <span>
                    {t("header.messages.ago", {
                      quantity: "3",
                      unit: "Hours",
                    })}
                  </span>
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-start">
              <Image
                src={"/img/default-profile.png"}
                alt="User Avatar"
                width={40}
                height={40}
                rounded
                className="mr-3 shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {" "}
                    Nora Silvester{" "}
                  </h3>
                  <span className="text-xs text-yellow-500">
                    <i className="fas fa-star" />
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  The subject goes here
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <i className="far fa-clock mr-1" />
                  <span>
                    {t("header.messages.ago", {
                      quantity: "4",
                      unit: "Hours",
                    })}
                  </span>
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="block py-3 text-center text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            {t("header.messages.seeAll")}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MessagesDropdown;
