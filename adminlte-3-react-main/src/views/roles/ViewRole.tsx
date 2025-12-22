"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { flattenMenu } from "@app/utils/sidebarMenu";

import { Eye, Edit, ArrowLeft, Shield, Menu as MenuIcon } from "lucide-react";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Skeleton } from "@app/components/ui/skeleton";

interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

interface IRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: IPermission[];
  sidebarAccess: string[];
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ViewRole = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [role, setRole] = useState<IRole | null>(null);
  const [loading, setLoading] = useState(true);
  const menuItems = flattenMenu();

  useEffect(() => {
    const fetchRole = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/rbac/roles/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRole(res.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load role");
        router.push("/roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [params.id, router]);

  // Group permissions by category
  const groupedPermissions =
    role?.permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
      },
      {} as Record<string, IPermission[]>
    ) || {};

  if (loading) {
    return (
      <>
        <ContentHeader title="View Role" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto p-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96 mb-8" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <>
      <ContentHeader title="View Role" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {role.displayName}
                  </h2>
                  {role.isSystem && (
                    <Badge variant="secondary" className="text-xs">
                      System Role
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">
                  System Name:{" "}
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {role.name}
                  </code>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/roles")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                {!role.isSystem && (
                  <Button
                    size="lg"
                    onClick={() => router.push(`/roles/${role._id}/edit`)}
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Role
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Description */}
              {role.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{role.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {role.createdAt
                          ? new Date(role.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {role.updatedAt
                          ? new Date(role.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Permissions</p>
                      <p className="font-medium">{role.permissions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Sidebar Menu Items
                      </p>
                      <p className="font-medium">{role.sidebarAccess.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Assigned Permissions
                  </CardTitle>
                  <CardDescription>
                    Permissions granted to this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {role.permissions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No permissions assigned to this role
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(
                        ([category, perms]) => (
                          <div key={category}>
                            <h3 className="text-base font-semibold text-gray-800 mb-3 capitalize">
                              {category.replace(/_/g, " ")} Permissions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {perms.map((p) => (
                                <div
                                  key={p._id}
                                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <p className="font-medium text-sm text-gray-800">
                                    {p.displayName}
                                  </p>
                                  {p.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {p.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sidebar Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MenuIcon className="w-5 h-5" />
                    Sidebar Menu Access
                  </CardTitle>
                  <CardDescription>
                    Menu items visible to this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {role.sidebarAccess.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No sidebar access configured for this role
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Menu Name</TableHead>
                            <TableHead>Path</TableHead>
                            <TableHead className="text-center">
                              <Eye className="w-4 h-4 inline" />
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menuItems.map((item: any) => {
                            const hasAccess = role.sidebarAccess.includes(
                              item.path
                            );
                            return (
                              <TableRow
                                key={item.path}
                                className={
                                  hasAccess ? "bg-green-50" : "opacity-40"
                                }
                              >
                                <TableCell className="font-medium">
                                  {item.name}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {item.path || "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {hasAccess ? (
                                    <Badge
                                      variant="default"
                                      className="bg-green-600"
                                    >
                                      Allowed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Denied</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewRole;
