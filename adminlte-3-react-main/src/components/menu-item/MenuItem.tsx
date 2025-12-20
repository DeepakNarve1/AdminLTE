/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation, Location } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IMenuItem } from "@app/utils/menu";
import { useAppSelector } from "@app/store/store";

const MenuItem = ({ menuItem }: { menuItem: IMenuItem }) => {
  const [t] = useTranslation();
  const [isMenuExtended, setIsMenuExtended] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const [isMainActive, setIsMainActive] = useState(false);
  const [isOneOfChildrenActive, setIsOneOfChildrenActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);

  const toggleMenu = () => {
    setIsMenuExtended(!isMenuExtended);
  };

  const handleMainMenuAction = () => {
    if (isExpandable) {
      toggleMenu();
      return;
    }
    navigate(menuItem.path ? menuItem.path : "/");
  };

  const calculateIsActive = (url: Location) => {
    setIsMainActive(false);
    setIsOneOfChildrenActive(false);
    if (isExpandable && menuItem && menuItem.children) {
      menuItem.children.forEach((item) => {
        if (item.path === url.pathname) {
          setIsOneOfChildrenActive(true);
          setIsMenuExtended(true);
        }
      });
    } else if (menuItem.path === url.pathname) {
      setIsMainActive(true);
    }
  };

  useEffect(() => {
    if (location) {
      calculateIsActive(location);
    }
  }, [location, isExpandable, menuItem]);

  useEffect(() => {
    if (!isMainActive && !isOneOfChildrenActive) {
      setIsMenuExtended(false);
    }
  }, [isMainActive, isOneOfChildrenActive]);

  useEffect(() => {
    setIsExpandable(
      Boolean(menuItem && menuItem.children && menuItem.children.length > 0)
    );
  }, [menuItem]);

  const isLight = sidebarSkin === "sidebar-light-primary";

  // Dynamic Styles
  const linkBaseClasses =
    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group relative overflow-hidden";

  const activeClasses = isLight
    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
    : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/20";

  const inactiveClasses = isLight
    ? "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
    : "text-slate-400 hover:bg-white/5 hover:text-white";

  return (
    <li className={`relative w-full ${isMenuExtended ? "menu-open" : ""}`}>
      <a
        className={`${linkBaseClasses} ${
          isMainActive || isOneOfChildrenActive
            ? activeClasses
            : inactiveClasses
        }`}
        role="link"
        onClick={handleMainMenuAction}
      >
        <i
          className={`${menuItem.icon} w-5 text-center text-lg transition-transform group-hover:scale-110 ${
            isMainActive || isOneOfChildrenActive
              ? "text-white"
              : isLight
                ? "text-gray-500"
                : "text-slate-500 group-hover:text-white"
          }`}
        />
        <p className="flex-1 truncate font-medium text-sm tracking-wide">
          {t(menuItem.name)}
        </p>

        {isExpandable && (
          <i
            className={`fas fa-chevron-right text-xs transition-transform duration-200 ${
              isMenuExtended ? "rotate-90" : ""
            } ${isMainActive || isOneOfChildrenActive ? "text-white/70" : "opacity-50"}`}
          />
        )}
      </a>

      {isExpandable && isMenuExtended && (
        <ul
          className={`pl-2 mt-1 list-none space-y-0.5 border-l-2 ml-4 ${isLight ? "border-gray-200" : "border-slate-700/50"}`}
        >
          {menuItem.children?.map((item) => (
            <li key={item.name} className="relative w-full">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    isActive
                      ? isLight
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "bg-white/10 text-white font-medium"
                      : isLight
                        ? "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
                to={`${item.path}`}
              >
                <i
                  className={`${item.icon} w-4 text-center text-xs opacity-70`}
                />
                <p className="flex-1 truncate">{t(item.name)}</p>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
