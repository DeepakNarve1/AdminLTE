import i18n from "@app/utils/i18n";

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
  allowedRoles?: string[];
  allowedPermissions?: string[];
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
