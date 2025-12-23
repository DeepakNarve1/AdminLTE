"use client";

import Users from "@pages/users";
import { RouteGuard } from "@app/components/RouteGuard";

export default function UsersPage() {
  return (
    <RouteGuard requiredPermission="view_users">
      <Users />
    </RouteGuard>
  );
}
