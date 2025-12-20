import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Image } from "@profabric/react-components";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@app/store/reducers/auth";
import { DateTime } from "luxon";

const UserDropdown = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useAppDispatch();
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

  const logOut = async (event: any) => {
    event.preventDefault();
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {
      // ignore
    }
    dispatch(setCurrentUser(null));
    setDropdownOpen(false);
    navigate("/");
  };

  const navigateToProfile = (event: any) => {
    event.preventDefault();
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <Image
          src={currentUser?.photoURL}
          fallbackSrc="/img/default-profile.png"
          alt="User"
          width={30}
          height={30}
          rounded
          className="shadow-sm border border-gray-200"
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-sm">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-center text-white">
            <Image
              src={currentUser?.photoURL}
              fallbackSrc="/img/default-profile.png"
              alt="User"
              width={80}
              height={80}
              rounded
              className="mx-auto mb-3 border-4 border-white/20 shadow-md"
            />
            <p className="font-semibold text-lg truncate px-2 text-white/90">
              {currentUser?.email}
            </p>
            <p className="text-xs text-blue-200 mt-1">
              Member since{" "}
              {currentUser?.metadata?.creationTime
                ? DateTime.fromRFC2822(
                    currentUser?.metadata?.creationTime
                  ).toFormat("dd LLL yyyy")
                : "N/A"}
            </p>
          </div>

          {/* Body */}
          <div className="flex border-b border-gray-100 py-3 bg-gray-50/50">
            <div className="flex-1 text-center border-r border-gray-200 px-2 last:border-0 hover:bg-gray-50">
              <Link
                to="/"
                className="block py-1 text-gray-600 hover:text-blue-600 font-medium"
              >
                Followers
              </Link>
            </div>
            <div className="flex-1 text-center border-r border-gray-200 px-2 last:border-0 hover:bg-gray-50">
              <Link
                to="/"
                className="block py-1 text-gray-600 hover:text-blue-600 font-medium"
              >
                Sales
              </Link>
            </div>
            <div className="flex-1 text-center px-2 hover:bg-gray-50">
              <Link
                to="/"
                className="block py-1 text-gray-600 hover:text-blue-600 font-medium"
              >
                Friends
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between p-3 bg-gray-50">
            <button
              onClick={navigateToProfile}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors shadow-sm font-medium"
            >
              Profile
            </button>
            <button
              onClick={logOut}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
