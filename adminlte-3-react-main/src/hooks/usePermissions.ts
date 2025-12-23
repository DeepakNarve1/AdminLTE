import { useAppSelector } from "@app/store/store";
import { IRole, IPermission } from "@app/types/user";

export const usePermissions = () => {
  const user = useAppSelector((state) => state.auth.currentUser);

  const hasPermission = (permissionName: string): boolean => {
    if (!user || !user.role) {
      return false;
    }

    // Handle role as string (e.g., "superadmin")
    if (typeof user.role === "string") {
      if (user.role === "superadmin") {
        return true;
      }
      return false;
    }

    // Handle role as object
    const role = user.role as IRole;

    // Superadmin bypass
    if (role.name === "superadmin") {
      return true;
    }

    // Check if role has the permission
    if (!role.permissions || !Array.isArray(role.permissions)) {
      return false;
    }

    const hasIt = role.permissions.some((perm: any) => {
      if (typeof perm === "string") {
        return perm === permissionName;
      }
      return perm.name === permissionName;
    });

    return hasIt;
  };

  const hasSidebarAccess = (path: string): boolean => {
    if (!user || !user.role) {
      return false;
    }

    // Handle role as string (e.g., "superadmin")
    if (typeof user.role === "string") {
      if (user.role === "superadmin") {
        return true;
      }
      return false;
    }

    // Handle role as object
    const role = user.role as IRole;

    // Superadmin bypass
    if (role.name === "superadmin") {
      return true;
    }

    // Check wildcard access
    if (role.sidebarAccess?.includes("*")) {
      return true;
    }

    // Check specific path access
    const hasAccess = role.sidebarAccess?.includes(path) || false;
    return hasAccess;
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every((perm) => hasPermission(perm));
  };

  return {
    hasPermission,
    hasSidebarAccess,
    hasAnyPermission,
    hasAllPermissions,
    user,
  };
};
