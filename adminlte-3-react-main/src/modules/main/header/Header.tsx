"use client";
import { useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  toggleControlSidebar,
  toggleSidebarMenu,
} from "@app/store/reducers/ui";
import MessagesDropdown from "@app/modules/main/header/messages-dropdown/MessagesDropdown";
import NotificationsDropdown from "@app/modules/main/header/notifications-dropdown/NotificationsDropdown";
import LanguagesDropdown from "@app/modules/main/header/languages-dropdown/LanguagesDropdown";
import UserDropdown from "@app/modules/main/header/user-dropdown/UserDropdown";
import Image from "@app/components/Image";
import { useAppDispatch, useAppSelector } from "@app/store/store";

const Header = ({ containered, ...rest }: { containered?: boolean } & any) => {
  const [t] = useTranslation();
  const dispatch = useAppDispatch();
  const navbarVariant = useAppSelector((state) => state.ui.navbarVariant);
  const headerBorder = useAppSelector((state) => state.ui.headerBorder);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  const handleToggleControlSidebar = () => {
    dispatch(toggleControlSidebar());
  };

  const getContainerClasses = useCallback(() => {
    let classes = `main-header fixed top-0 h-[57px] flex items-center justify-between px-4 bg-white border-b border-gray-200 z-[1034] transition-all duration-300 ease-in-out ${navbarVariant}`;
    if (headerBorder) {
      classes = `${classes} border-b-0`;
    }
    return classes;
  }, [navbarVariant, headerBorder]);

  return (
    <nav className={getContainerClasses()} {...rest}>
      <div
        className={`w-full flex items-center justify-between ${
          containered ? "container mx-auto" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          {topNavigation && (
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/img/logo.png"
                  alt="RBAC System Logo"
                  width={33}
                  height={33}
                  rounded
                  className="opacity-80 shadow-md"
                />
                <span className="font-light text-xl text-black/90">
                  RBAC System
                </span>
              </Link>
              <button
                className="p-2 border rounded md:hidden"
                type="button"
                data-toggle="collapse"
                data-target="#navbarCollapse"
              >
                <i className="fas fa-bars" />
              </button>
            </div>
          )}

          <ul className="flex list-none gap-2 m-0 p-0 items-center">
            {!topNavigation && (
              <li>
                <button
                  onClick={handleToggleMenuSidebar}
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-bars" />
                </button>
              </li>
            )}
            <li className="hidden sm:block">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                {t("header.label.home")}
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link
                href="/profile"
                className="block px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <ul className="flex list-none gap-2 m-0 p-0 items-center ml-auto">
          <UserDropdown />
        </ul>
      </div>
    </nav>
  );
};

export default Header;
