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
    resource: "roles",
  },
  {
    name: "Project Summary",
    icon: "fas fa-user-friends nav-icon",
    path: "/project-summary",
    allowedRoles: ["superadmin"],
  },
  {
    name: "MP Public Problem",
    icon: "fas fa-exclamation-circle nav-icon",
    path: "/mp-public-problem",
    allowedRoles: ["superadmin"],
    resource: "mp_public_problem",
  },
  {
    name: "Member List",
    icon: "fas fa-list nav-icon",
    path: "/member-list",
    allowedRoles: ["superadmin"],
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
  {
    name: "Vidhan Sabha",
    icon: "fas fa-landmark nav-icon",
    path: "/vidhan-sabha",
    allowedRoles: ["superadmin"],
    resource: "vidhan_sabha",
  },
  {
    name: "Party",
    icon: "fas fa-flag nav-icon",
    path: "/party",
    allowedRoles: ["superadmin"],
    resource: "party",
  },
  {
    name: "Department",
    icon: "fas fa-sitemap nav-icon",
    path: "/department",
    allowedRoles: ["superadmin"],
    resource: "department",
  },
  {
    name: "Activity Management",
    icon: "fas fa-tasks nav-icon",
    path: "/activity-management",
    allowedRoles: ["superadmin"],
    resource: "activity_management",
  },
  {
    name: "Report",
    icon: "fas fa-user-shield nav-icon",
    path: "/report",
    allowedRoles: ["superadmin"],
    resource: "report",
  },
  {
    name: "Review",
    icon: "fas fa-user-shield nav-icon",
    path: "/review",
    allowedRoles: ["superadmin"],
    resource: "review",
  },
  {
    name: "Setting",
    icon: "fas fa-user-shield nav-icon",
    path: "/setting",
    allowedRoles: ["superadmin"],
    resource: "setting",
  },
];
