import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MenuItem } from "@components";
import { Image } from "@profabric/react-components";
import { SidebarSearch } from "@app/components/sidebar-search/SidebarSearch";
import { useAppSelector } from "@app/store/store";
import { MENU, IMenuItem } from "@app/utils/menu";
import { useAuthorization } from "@app/hooks/useAuthorization";

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed
  );
  const screenSize = useAppSelector((state) => state.ui.screenSize);

  const { userRoles, roleBasedAllowedPaths } = useAuthorization();

  const userPermissions = useMemo(() => {
    const permissionsFromUser = Array.isArray(currentUser?.permissions)
      ? currentUser?.permissions
      : [];
    const permissionsFromMetadata = Array.isArray(
      currentUser?.metadata?.permissions
    )
      ? currentUser?.metadata?.permissions
      : [];

    return Array.from(
      new Set(
        [...permissionsFromUser, ...permissionsFromMetadata].filter(Boolean)
      )
    );
  }, [currentUser]);

  const canAccess = (item: IMenuItem) => {
    if (userRoles.includes("superadmin")) return true;

    const roleAllowed =
      !item.allowedRoles ||
      item.allowedRoles.length === 0 ||
      item.allowedRoles.some((role) => userRoles.includes(role));

    const permissionAllowed =
      !item.allowedPermissions ||
      item.allowedPermissions.length === 0 ||
      item.allowedPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

    const overrideAllowed = item.path && roleBasedAllowedPaths.has(item.path);

    return overrideAllowed || (roleAllowed && permissionAllowed);
  };

  const filteredMenu = useMemo(() => {
    const filterItems = (items: IMenuItem[]): IMenuItem[] =>
      items
        .map((item) => {
          const filteredChildren = item.children
            ? filterItems(item.children)
            : undefined;
          const itemAllowed = canAccess(item);

          if (
            !itemAllowed &&
            (!filteredChildren || filteredChildren.length === 0)
          ) {
            return null;
          }

          return { ...item, children: filteredChildren };
        })
        .filter(Boolean) as IMenuItem[];

    return filterItems(MENU);
  }, [userPermissions, userRoles]);

  const sidebarClasses = useMemo(() => {
    let classes = `fixed top-0 left-0 h-screen overflow-y-hidden z-[1038] transition-all duration-300 shadow-2xl group border-r `;

    // Richer Dark/Light Modes
    if (sidebarSkin === "sidebar-light-primary") {
      classes += "bg-white text-slate-700 border-gray-200";
    } else {
      // "Premium Dark" - darker slate/zinc instead of pure gray
      classes += "bg-slate-900 text-slate-300 border-slate-800";
    }

    if (screenSize === "lg") {
      if (menuSidebarCollapsed) {
        // Mini sidebar, expands on hover
        classes += " w-[73px] hover:w-[260px]";
      } else {
        classes += " w-[260px]";
      }
    } else {
      classes += menuSidebarCollapsed
        ? " w-[260px] translate-x-0"
        : " w-[260px] -translate-x-full";
    }
    return classes;
  }, [sidebarSkin, screenSize, menuSidebarCollapsed]);

  const isMini = screenSize === "lg" && menuSidebarCollapsed;
  const isLight = sidebarSkin === "sidebar-light-primary";

  return (
    <aside className={sidebarClasses}>
      {/* Brand Logo */}
      <Link
        to="/"
        className={`flex items-center h-[57px] px-6 border-b transition-colors ${
          isLight
            ? "border-gray-200 hover:bg-gray-50"
            : "border-slate-800 hover:bg-slate-800/50"
        }`}
      >
        <Image
          src="img/logo.png"
          alt="RBAC Logo"
          width={32}
          height={32}
          rounded
          className="opacity-90 shadow-sm shrink-0"
        />
        <span
          className={`ml-3 text-lg font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${
            isMini ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
          } group-hover:opacity-100 group-hover:w-auto`}
        >
          RBAC System
        </span>
      </Link>

      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto overflow-x-hidden pb-16 custom-scrollbar">
        {/* User Panel */}
        <div
          className={`px-4 py-6 border-b transition-colors ${
            isLight ? "border-gray-200" : "border-slate-800"
          }`}
        >
          <div className="flex items-center">
            <div className="shrink-0 relative">
              <Image
                src={currentUser?.photoURL}
                fallbackSrc="/img/default-profile.png"
                alt="User"
                width={40}
                height={40}
                rounded
                className="shadow-md ring-2 ring-opacity-20 ring-white"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div
              className={`ml-3 overflow-hidden transition-all duration-300 ${
                isMini ? "opacity-0 w-0" : "opacity-100 w-auto"
              } group-hover:opacity-100 group-hover:w-auto`}
            >
              <Link
                to={"/profile"}
                className="block text-sm font-semibold truncate hover:text-blue-500 transition-colors"
              >
                {currentUser?.email?.split("@")[0]}
              </Link>
              <span className="text-xs opacity-60 truncate block">
                Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div
          className={`px-3 py-4 transition-all duration-300 ${
            isMini ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
          } group-hover:opacity-100 group-hover:h-auto group-hover:overflow-visible`}
        >
          <SidebarSearch />
        </div>

        {/* Navigation */}
        <nav className="mt-2 px-3 overflow-y-hidden">
          <ul
            className={`flex flex-col gap-1 w-full m-0 p-0 list-none ${
              menuItemFlat ? " nav-flat" : ""
            }${menuChildIndent ? " nav-child-indent" : ""}`}
            role="menu"
          >
            {filteredMenu.map((menuItem: IMenuItem) => (
              <MenuItem
                key={menuItem.name + menuItem.path}
                menuItem={menuItem}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MenuSidebar;
