import { useMemo } from "react";
import Link from "next/link";
import { MenuItem } from "@components";
import Image from "@app/components/Image";
import { SidebarSearch } from "@app/components/sidebar-search/SidebarSearch";
import { useAppSelector } from "@app/store/store";
import { MENU, IMenuItem } from "@app/utils/menu";
import { usePermissions } from "@app/hooks/usePermissions";

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed
  );
  const screenSize = useAppSelector((state) => state.ui.screenSize);

  // Use our permission hook
  const { hasPermission, user } = usePermissions();

  console.log("[MenuSidebar] User:", user);
  console.log("[MenuSidebar] Current user from Redux:", currentUser);

  // Check if user is superadmin
  const isSuperadmin = useMemo(() => {
    if (!user || !user.role) return false;
    if (typeof user.role === "string") {
      return user.role === "superadmin";
    }
    return user.role.name === "superadmin";
  }, [user]);

  console.log("[MenuSidebar] Is superadmin?", isSuperadmin);

  const canAccess = (item: IMenuItem) => {
    // Superadmin can see everything
    if (isSuperadmin) {
      console.log("[MenuSidebar] Superadmin - allowing:", item.name);
      return true;
    }

    // If item has a resource, check view permission for that resource
    if (item.resource) {
      const viewPermission = `view_${item.resource}`;
      const canView = hasPermission(viewPermission);
      console.log(
        `[MenuSidebar] Checking ${viewPermission} for ${item.name}:`,
        canView
      );
      return canView;
    }

    // Allow items without resource (like headers)
    console.log("[MenuSidebar] No resource check for:", item.name);
    return true;
  };

  const filteredMenu = useMemo(() => {
    console.log("[MenuSidebar] Filtering menu, user:", user);

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
  }, [user, isSuperadmin]); // Re-filter when user changes

  const sidebarClasses = useMemo(() => {
    let classes = `fixed top-0 left-0 h-screen overflow-y-hidden z-[1038] transition-all duration-300 shadow-2xl group border-r `;

    // Richer Dark/Light Modes
    if (sidebarSkin === "sidebar-light-primary") {
      classes += "bg-white text-slate-700 border-gray-200";
    } else {
      // Premium Dark - using the Teal color theme
      classes += "bg-white text-gray border-[#2c4a59]";
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
        href="/"
        className={`flex items-center h-[57px] px-6 border-b transition-colors ${
          isLight
            ? "border-gray-200 hover:bg-gray-50"
            : "border-[#2c4a59] hover:bg-[#2c4a59]/50"
        }`}
      >
        <Image
          src="/img/logo.png"
          alt="RBAC Logo"
          width={32}
          height={32}
          rounded
          className="opacity-90 shadow-sm shrink-0"
        />
        <span
          className={`ml-3 text-lg font-semibold tracking-wide whitespace-nowrap transition-all duration-300 text-emerald-950 ${
            isMini ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
          } group-hover:opacity-100 group-hover:w-auto`}
        >
          ADMINLTE
        </span>
      </Link>

      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto overflow-x-hidden pb-16 custom-scrollbar">
        {/* User Panel */}
        <div
          className={`px-4 py-6 border-b transition-colors ${
            isLight ? "border-gray-200" : "border-[#2c4a59]"
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
                href={"/profile"}
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

        {/* Search
        <div
          className={`px-3 py-4 transition-all duration-300 ${
            isMini ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
          } group-hover:opacity-100 group-hover:h-auto group-hover:overflow-visible`}
        >
          <SidebarSearch />
        </div> */}

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
