"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { flattenMenu } from "@app/utils/sidebarMenu";

import { AlertCircle } from "lucide-react";
import { ContentHeader } from "@app/components";
import { Label } from "@app/components/ui/label";
import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import { Checkbox } from "@radix-ui/react-checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Button } from "@app/components/ui/button";

interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

interface CategoryPermissions {
  category: string;
  displayName: string;
  menuPath: string | null;
  view: IPermission | null;
  create: IPermission | null;
  edit: IPermission | null;
  delete: IPermission | null;
}

const EditRole = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roleId = params?.id;

  const [role, setRole] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[],
  });

  const [sidebarAccess, setSidebarAccess] = useState<string[]>([]);
  const menuItems = flattenMenu();
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permsRes, roleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/rbac/permissions", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`http://localhost:5000/api/rbac/roles/${roleId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setPermissions(permsRes.data.data || []);

        const roleData = roleRes.data.data;
        setRole({
          name: roleData.name || "",
          displayName: roleData.displayName || "",
          description: roleData.description || "",
          permissions:
            roleData.permissions?.map((p: any) =>
              typeof p === "string" ? p : p._id
            ) || [],
        });
        setSidebarAccess(roleData.sidebarAccess || []);
      } catch (err) {
        toast.error("Failed to load role data");
      }
    };

    if (roleId) {
      fetchData();
    }
  }, [roleId]);

  const handleChange = (field: string, value: string) => {
    setRole((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permId: string) => {
    setRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const toggleSidebarAccess = (path: string) => {
    setSidebarAccess((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const toggleAllForCategory = (cat: CategoryPermissions) => {
    const allPerms = [cat.view, cat.create, cat.edit, cat.delete]
      .filter(Boolean)
      .map((p) => p!._id);

    const allSelected =
      allPerms.every((id) => role.permissions.includes(id)) &&
      (cat.menuPath ? sidebarAccess.includes(cat.menuPath) : true);

    if (allSelected) {
      // Deselect all
      setRole((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !allPerms.includes(p)),
      }));
      if (cat.menuPath) {
        setSidebarAccess((prev) => prev.filter((p) => p !== cat.menuPath));
      }
    } else {
      // Select all
      setRole((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...allPerms])],
      }));
      if (cat.menuPath) {
        setSidebarAccess((prev) => [...new Set([...prev, cat.menuPath!])]);
      }
    }
  };

  const updateRole = async () => {
    const newErrors: Record<string, string> = {};
    if (!role.name.trim()) newErrors.name = "Role name is required";
    if (!role.displayName.trim())
      newErrors.displayName = "Display name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors below");
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/rbac/roles/${roleId}`,
        {
          ...role,
          sidebarAccess,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Role updated successfully!");
      router.push("/roles");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRole({
      name: "",
      displayName: "",
      description: "",
      permissions: [],
    });
    setSidebarAccess([]);
    setErrors({});
  };

  // Build category-based permissions
  const categoryPermissions: CategoryPermissions[] = [];
  const categoriesMap = new Map<string, CategoryPermissions>();

  permissions.forEach((perm) => {
    if (!categoriesMap.has(perm.category)) {
      const menuItem = menuItems.find(
        (item) => item.resource === perm.category
      );
      categoriesMap.set(perm.category, {
        category: perm.category,
        displayName: perm.category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        menuPath: menuItem?.path || null,
        view: null,
        create: null,
        edit: null,
        delete: null,
      });
    }

    const cat = categoriesMap.get(perm.category)!;
    const permName = perm.name.toLowerCase();

    if (permName.includes("view") || permName.includes("list")) {
      cat.view = perm;
    } else if (permName.includes("create")) {
      cat.create = perm;
    } else if (permName.includes("edit") || permName.includes("update")) {
      cat.edit = perm;
    } else if (permName.includes("delete")) {
      cat.delete = perm;
    }
  });

  categoryPermissions.push(...categoriesMap.values());

  return (
    <>
      <ContentHeader title="Edit Role" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Update Role</h2>
              <p className="text-gray-600 mt-1">
                Modify role details and manage permissions with sidebar access.
              </p>
            </div>

            <div className="p-8">
              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">
                      Please fix the following:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {Object.values(errors).map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Role Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name (System)</Label>
                  <Input
                    id="name"
                    value={role.name}
                    onChange={(e: any) => handleChange("name", e.target.value)}
                    placeholder="e.g. manager, hr_officer"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={role.displayName}
                    onChange={(e: any) =>
                      handleChange("displayName", e.target.value)
                    }
                    placeholder="e.g. HR Manager"
                    className={errors.displayName ? "border-red-500" : ""}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-600">{errors.displayName}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={role.description}
                    onChange={(e: any) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Describe what this role can do..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Unified Permissions Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Permissions & Access Control
                </h3>

                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#00563B]">
                        <TableHead className="text-white font-semibold">
                          Resource
                        </TableHead>
                        <TableHead className="text-white font-semibold text-center">
                          Sidebar
                        </TableHead>
                        <TableHead className="text-white font-semibold text-center">
                          Create
                        </TableHead>
                        <TableHead className="text-white font-semibold text-center">
                          Edit
                        </TableHead>
                        <TableHead className="text-white font-semibold text-center">
                          Delete
                        </TableHead>
                        <TableHead className="text-white font-semibold text-center">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryPermissions.map((cat) => {
                        const allPerms = [
                          cat.view,
                          cat.create,
                          cat.edit,
                          cat.delete,
                        ]
                          .filter(Boolean)
                          .map((p) => p!._id);
                        const allSelected =
                          allPerms.length > 0 &&
                          allPerms.every((id) =>
                            role.permissions.includes(id)
                          ) &&
                          (cat.menuPath
                            ? sidebarAccess.includes(cat.menuPath)
                            : true);

                        return (
                          <TableRow
                            key={cat.category}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {cat.displayName}
                            </TableCell>
                            <TableCell className="text-center">
                              {cat.menuPath ? (
                                <Checkbox
                                  checked={sidebarAccess.includes(cat.menuPath)}
                                  onCheckedChange={() =>
                                    toggleSidebarAccess(cat.menuPath!)
                                  }
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {cat.create ? (
                                <Checkbox
                                  checked={role.permissions.includes(
                                    cat.create._id
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(cat.create!._id)
                                  }
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {cat.edit ? (
                                <Checkbox
                                  checked={role.permissions.includes(
                                    cat.edit._id
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(cat.edit!._id)
                                  }
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {cat.delete ? (
                                <Checkbox
                                  checked={role.permissions.includes(
                                    cat.delete._id
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(cat.delete!._id)
                                  }
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={() =>
                                  toggleAllForCategory(cat)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  onClick={updateRole}
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Updating..." : "Update Role"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Reset Changes
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => router.push("/roles")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditRole;
