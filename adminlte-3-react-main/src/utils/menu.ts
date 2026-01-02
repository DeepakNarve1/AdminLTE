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
    allowedPermissions: ["view_dashboard"],
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
    allowedPermissions: ["manage_roles", "view_roles"],
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
    resource: "assembly_issues",
  },
  {
    name: "Events",
    icon: "fas fa-calendar-alt nav-icon",
    path: "/events",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_events"],
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
    name: "Vidhasabha Samiti",
    icon: "fas fa-building nav-icon",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_vidhansabha_samiti"],
    resource: "vidhasabha-samiti",
    children: [
      {
        name: "Ganesh-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/ganesh-samiti",
      },
      {
        name: "Tenkar-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/tenkar-samiti",
      },
      {
        name: "DP-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/dp-samiti",
      },
      {
        name: "Mandir-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/mandir-samiti",
      },
      {
        name: "Bhagoria-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/bhagoria-samiti",
      },
      {
        name: "Nirman-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/nirman-samiti",
      },
      {
        name: "Booth-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/booth-samiti",
      },
      {
        name: "Block-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/block-samiti",
      },
    ],
  },
  {
    name: "District",
    icon: "fas fa-map nav-icon",
    path: "/districts",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_districts", "manage_districts"],
    resource: "districts",
  },
  {
    name: "Division",
    icon: "fas fa-map nav-icon",
    path: "/divisions",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_divisions", "manage_divisions"],
    resource: "divisions",
  },
  {
    name: "State",
    icon: "fas fa-map nav-icon",
    path: "/states",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_states", "manage_states"],
    resource: "states",
  },
  {
    name: "Parliament",
    icon: "fas fa-landmark nav-icon",
    path: "/parliaments",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_parliaments", "manage_parliaments"],
    resource: "parliaments",
  },
  {
    name: "Assembly",
    icon: "fas fa-landmark nav-icon",
    path: "/assemblies",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_assemblies", "manage_assemblies"],
    resource: "assemblies",
  },
  {
    name: "Block",
    icon: "fas fa-cubes nav-icon",
    path: "/blocks",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_blocks", "manage_blocks"],
    resource: "blocks",
  },
  {
    name: "Booth",
    icon: "fas fa-person-booth nav-icon",
    path: "/booths",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_booths", "manage_booths"],
    resource: "booths",
  },
  {
    name: "Member List",
    icon: "fas fa-users-cog nav-icon",
    path: "/member-list",
    allowedRoles: ["superadmin"],
    allowedPermissions: ["view_members"],
    resource: "members",
  },
];
