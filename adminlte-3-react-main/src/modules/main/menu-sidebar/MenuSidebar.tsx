import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MenuItem } from "@components";
import { Image } from "@profabric/react-components";
import styled from "styled-components";
import { SidebarSearch } from "@app/components/sidebar-search/SidebarSearch";
import i18n from "@app/utils/i18n";
import { useAppSelector } from "@app/store/store";
import axios from "axios";

const SIDEBAR_ACCESS_STORAGE_KEY = "sidebarAccessByRole";
export const DEFAULT_SIDEBAR_ACCESS_BY_ROLE: Record<string, string[]> = {
  superadmin: ["*"],
  testing: ["/dashboard", "/review", "/report"],
  mp_public_problems: ["/"],
  bhopal_user1: ["/", "/review"],
  bhopal_user2: ["/", "/report"],
  assembly_stage1: ["/", "/review"],
  bhopal_block: ["/"],
  tirla_block: ["/review"],
  bagh_block: ["/report"],
  gandhwani_block: ["/review"],
  tanda_block: ["/review"],
  dontknowroles: [],
};
const EXTENDED_ALLOWED_ROLES = [
  "superadmin",
  "testing",
  "mp_public_problems",
  "bhopal_user1",
  "bhopal_user2",
  "assembly_stage1",
  "bhopal_block",
  "tirla_block",
  "bagh_block",
  "gandhwani_block",
  "tanda_block",
  "dontknowroles",
];

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
  allowedRoles?: string[];
  allowedPermissions?: string[];
}

export const MENU: IMenuItem[] = [
  {
    name: i18n.t("menusidebar.label.dashboard"),
    icon: "fas fa-tachometer-alt nav-icon",
    path: "/dashboard",
  },
  {
    name: i18n.t("menusidebar.label.users"),
    icon: "fas fa-wrench nav-icon",
    path: "/users",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Roles",
    icon: "fas fa-user-shield nav-icon",
    path: "/roles",
    allowedRoles: ["superadmin"],
  },
  {
    name: "User Count",
    icon: "fas fa-user-friends nav-icon",
    path: "/user-count",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Member List",
    icon: "fas fa-list nav-icon",
    path: "/member-list",
    allowedRoles: ["superadmin"],
  },
  {
    name: "MP Public Problem",
    icon: "fas fa-exclamation-circle nav-icon",
    path: "/mp-public-problem",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Assembly Issue",
    icon: "fas fa-university nav-icon",
    path: "/assembly-issue",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Events",
    icon: "fas fa-calendar-alt nav-icon",
    path: "/events",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Voter",
    icon: "fas fa-id-card nav-icon",
    path: "/voter",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Samiti",
    icon: "fas fa-building nav-icon",
    path: "/samiti",
    allowedRoles: ["superadmin"],
  },
  {
    name: "District",
    icon: "fas fa-map nav-icon",
    path: "/district",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Vidhan Sabha",
    icon: "fas fa-landmark nav-icon",
    path: "/vidhan-sabha",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Party",
    icon: "fas fa-flag nav-icon",
    path: "/party",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Department",
    icon: "fas fa-sitemap nav-icon",
    path: "/department",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Activity Management",
    icon: "fas fa-tasks nav-icon",
    path: "/activity-management",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Report",
    icon: "fas fa-user-shield nav-icon",
    path: "/report",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Review",
    icon: "fas fa-user-shield nav-icon",
    path: "/review",
    allowedRoles: ["superadmin"],
  },
  {
    name: "Setting",
    icon: "fas fa-user-shield nav-icon",
    path: "/setting",
    allowedRoles: ["superadmin"],
  },
];

const StyledBrandImage = styled(Image)`
  float: left;
  line-height: 0.8;
  margin: -1px 8px 0 6px;
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23) !important;
`;

const StyledUserImage = styled(Image)`
  --pf-box-shadow: 0 3px 6px #00000029, 0 3px 6px #0000003b !important;
`;

const StyledSidebar = styled.aside`
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh !important;
  overflow-y: hidden !important;
  z-index: 1038;
`;

const StyledSidebarInner = styled.div`
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden !important;
`;

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);
  const [sidebarAccessByRole, setSidebarAccessByRole] = useState<
    Record<string, string[]>
  >(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_ACCESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Record<string, string[]>;
      }
    } catch (error) {
      console.warn("Failed to read sidebar access configuration", error);
    }
    return DEFAULT_SIDEBAR_ACCESS_BY_ROLE;
  });

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/105f93a2-9fac-4818-ba68-806d6a51ed9a", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "initial",
      hypothesisId: "H1",
      location: "MenuSidebar.tsx:currentUser",
      message: "Current user role shape",
      data: {
        hasUser: !!currentUser,
        roleType: currentUser ? typeof (currentUser as any).role : null,
        hasRolesArray: !!(currentUser as any)?.roles,
        hasMetadataRole: !!(currentUser as any)?.metadata?.role,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  useEffect(() => {
    const fetchSidebarAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/rbac/sidebar-permissions",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const map = res.data?.data;
        if (map && typeof map === "object" && !Array.isArray(map)) {
          setSidebarAccessByRole(map);
          localStorage.setItem(SIDEBAR_ACCESS_STORAGE_KEY, JSON.stringify(map));
        }
      } catch (error) {
        console.warn("Failed to fetch sidebar access from server", error);
      }
    };

    fetchSidebarAccess();
  }, []);

  const userRoles = useMemo(() => {
    // Normalize any role value (string or populated object) into role name strings
    const normalize = (role: any) => {
      if (!role) return null;
      if (typeof role === "string") return role;
      if (typeof role === "object" && role.name) return role.name;
      return null;
    };

    const rolesFromUser = Array.isArray(currentUser?.roles)
      ? currentUser?.roles.map(normalize)
      : [];
    const roleFromUser = currentUser?.role ? [normalize(currentUser.role)] : [];
    const rolesFromMetadata = Array.isArray(currentUser?.metadata?.roles)
      ? currentUser?.metadata?.roles.map(normalize)
      : currentUser?.metadata?.role
        ? [normalize(currentUser.metadata.role)]
        : [];

    const normalized = Array.from(
      new Set(
        [...rolesFromUser, ...roleFromUser, ...rolesFromMetadata].filter(
          Boolean
        ) as string[]
      )
    );

    // Frontend fallback: treat known superadmin account as superadmin
    if (
      normalized.length === 0 &&
      currentUser &&
      typeof (currentUser as any).email === "string" &&
      (currentUser as any).email.toLowerCase() === "superadmin@example.com"
    ) {
      return ["superadmin"];
    }

    return normalized;
  }, [currentUser]);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/105f93a2-9fac-4818-ba68-806d6a51ed9a", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "initial",
      hypothesisId: "H2",
      location: "MenuSidebar.tsx:userRoles",
      message: "Computed userRoles for sidebar",
      data: {
        userRoles,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const roleBasedAllowedPaths = useMemo(() => {
    const allowed = new Set<string>();
    userRoles.forEach((role) => {
      const roleAccess = sidebarAccessByRole[role];

      if (roleAccess?.includes("*")) {
        MENU.forEach((m) => {
          if (m.path) allowed.add(m.path);
          m.children?.forEach((c) => c.path && allowed.add(c.path));
        });
      }

      if (Array.isArray(roleAccess)) {
        roleAccess.forEach((path) => allowed.add(path));
      }
    });
    return allowed;
  }, [sidebarAccessByRole, userRoles]);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/105f93a2-9fac-4818-ba68-806d6a51ed9a", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "initial",
      hypothesisId: "H3",
      location: "MenuSidebar.tsx:roleBasedAllowedPaths",
      message: "Role-based allowed paths snapshot",
      data: {
        userRoles,
        allowedPaths: Array.from(roleBasedAllowedPaths),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
    // SUPERADMIN BYPASS
    if (userRoles.includes("superadmin")) {
      return true;
    }

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

  return (
    <StyledSidebar className={`main-sidebar elevation-4 ${sidebarSkin}`}>
      <Link to="/" className="brand-link">
        <StyledBrandImage
          src="img/logo.png"
          alt="AdminLTE Logo"
          width={33}
          height={33}
          rounded
        />
        <span className="brand-text font-weight-light">AdminLTE 3</span>
      </Link>
      <StyledSidebarInner className="sidebar">
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <StyledUserImage
              src={currentUser?.photoURL}
              fallbackSrc="/img/default-profile.png"
              alt="User"
              width={34}
              height={34}
              rounded
            />
          </div>
          <div className="info">
            <Link to={"/profile"} className="d-block">
              {currentUser?.email}
            </Link>
          </div>
        </div>

        <div className="form-inline">
          <SidebarSearch />
        </div>

        <nav className="mt-2" style={{ overflowY: "hidden" }}>
          <ul
            className={`nav nav-pills nav-sidebar flex-column${
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
      </StyledSidebarInner>
    </StyledSidebar>
  );
};

export default MenuSidebar;
