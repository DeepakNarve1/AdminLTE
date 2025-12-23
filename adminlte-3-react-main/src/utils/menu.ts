import i18n from "@app/utils/i18n";

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  resource?: string;
}

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
    resource: "users",
  },
  {
    name: "Roles",
    icon: "fas fa-user-shield nav-icon",
    path: "/roles",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["manage_roles"],
  },
  {
    name: "Project Summary",
    icon: "fas fa-user-friends nav-icon",
    path: "/project-summary",
    allowedRoles: ["superadmin"],
    resource: "projects",
  },
  {
    name: "MP Public Problem",
    icon: "fas fa-exclamation-circle nav-icon",
    path: "/mp-public-problem",
    allowedRoles: ["superadmin"],
    resource: "mp_public_problems",
  },
  {
    name: "Assembly Issue",
    icon: "fas fa-university nav-icon",
    path: "/assembly-issue",
    allowedRoles: ["superadmin"],
    resource: "assembly_issue",
  },
  {
    name: "Events",
    icon: "fas fa-calendar-alt nav-icon",
    path: "/events",
    allowedRoles: ["superadmin"],
    resource: "events",
  },
  {
    name: "Voter",
    icon: "fas fa-id-card nav-icon",
    path: "/voter",
    allowedRoles: ["superadmin"],
    resource: "voter",
  },
  {
    name: "Samiti",
    icon: "fas fa-building nav-icon",
    path: "/samiti",
    allowedRoles: ["superadmin"],
    resource: "samiti",
  },
  {
    name: "District",
    icon: "fas fa-map nav-icon",
    path: "/district",
    allowedRoles: ["superadmin"],
    resource: "district",
  },
];
