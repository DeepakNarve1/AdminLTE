"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePermissions } from "@app/hooks/usePermissions";
import { toast } from "react-toastify";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission is enough
  redirectTo?: string;
  checkSidebarAccess?: boolean; // Optional: check sidebar access (default: false)
}

export const RouteGuard = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  redirectTo = "/dashboard",
  checkSidebarAccess = false,
}: RouteGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasSidebarAccess,
    user,
  } = usePermissions();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Optional: Check sidebar access if enabled
    if (checkSidebarAccess && !hasSidebarAccess(pathname)) {
      toast.error("You don't have access to this page");
      router.push(redirectTo);
      return;
    }

    // Check specific permission if provided
    if (requiredPermission && !hasPermission(requiredPermission)) {
      toast.error(
        `You need '${requiredPermission}' permission to access this page`
      );
      router.push(redirectTo);
      return;
    }

    // Check multiple permissions if provided
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAccess = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);

      if (!hasAccess) {
        toast.error(
          "You don't have the required permissions to access this page"
        );
        router.push(redirectTo);
        return;
      }
    }
  }, [
    user,
    pathname,
    requiredPermission,
    requiredPermissions,
    requireAll,
    redirectTo,
    checkSidebarAccess,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasSidebarAccess,
    router,
  ]);

  // Show nothing while checking permissions
  if (!user) return null;

  // Check specific permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Permission Not Assigned
        </h2>
        <p className="text-gray-500">
          You do not have permission to view this module.
        </p>
      </div>
    );
  }

  // Check multiple permissions if provided
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Permission Not Assigned
          </h2>
          <p className="text-gray-500">
            You do not have permission to view this module.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};
