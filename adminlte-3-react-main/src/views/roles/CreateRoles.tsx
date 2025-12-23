"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { AlertCircle } from "lucide-react";
import { ContentHeader } from "@app/components";
import { Checkbox } from "@app/components/ui/checkbox";

interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

const CreateRole = () => {
  const router = useRouter();

  const [role, setRole] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[],
  });

  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/rbac/permissions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPermissions(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load permissions");
      }
    };
    fetchPermissions();
  }, []);

  const handleChange = (field: string, value: string) => {
    setRole((prev) => ({ ...prev, [field]: value }));
  };

  const toggleView = (category: string) => {
    const viewPerm = permissions.find(
      (p) => p.category === category && p.name.includes("view")
    );
    if (!viewPerm) return;

    setRole((prev) => {
      const isPresent = prev.permissions.includes(viewPerm._id);
      return {
        ...prev,
        permissions: isPresent
          ? prev.permissions.filter((id) => id !== viewPerm._id)
          : [...prev.permissions, viewPerm._id],
      };
    });
  };

  const toggleCreateMaster = (category: string) => {
    // Find all "write" permissions: create, edit, delete, manage
    const writePerms = permissions
      .filter(
        (p) =>
          p.category === category &&
          (p.name.includes("create") ||
            p.name.includes("edit") ||
            p.name.includes("delete") ||
            p.name.includes("manage"))
      )
      .map((p) => p._id);

    if (writePerms.length === 0) return;

    setRole((prev) => {
      // Check if ALL are present
      const allPresent = writePerms.every((id) =>
        prev.permissions.includes(id)
      );

      return {
        ...prev,
        permissions: allPresent
          ? prev.permissions.filter((id) => !writePerms.includes(id)) // Remove all
          : [...new Set([...prev.permissions, ...writePerms])], // Add all
      };
    });
  };

  const createRole = async () => {
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
      await axios.post(
        "http://localhost:5000/api/rbac/roles",
        {
          ...role,
          sidebarAccess: [], // Not used anymore
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Role created successfully!");
      router.push("/roles");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create role");
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
    setErrors({});
  };

  // Group permissions by category
  const groupedPermissions = permissions
    .filter(
      (p) =>
        p.name.includes("view") ||
        p.name.includes("list") ||
        p.name.includes("manage") ||
        p.name.includes("create")
    )
    .reduce(
      (acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        // Prevent duplicates in grouping if filter matches multiple times (unlikely with this logic but safe)
        if (!acc[perm.category].find((p) => p._id === perm._id)) {
          acc[perm.category].push(perm);
        }
        return acc;
      },
      {} as Record<string, IPermission[]>
    );

  // Ensure we have all permissions for the category available for logic even if filter above missed some?
  // Actually simpler: iterate object keys based on all permissions.
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <>
      <ContentHeader title="Create Role" />
      <section className="content">
        <div className="container-fluid">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Role
              </h2>
              <p className="text-gray-600 mt-1">
                Define role details and assign permissions.
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

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Role Name (System)
                  </label>
                  <Input
                    value={role.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. manager"
                    className={errors.name ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <Input
                    value={role.displayName}
                    onChange={(e) =>
                      handleChange("displayName", e.target.value)
                    }
                    placeholder="e.g. Manager"
                    className={errors.displayName ? "border-red-500" : ""}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    value={role.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Role description"
                  />
                </div>
              </div>

              {/* Permissions Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Permissions
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Module</TableHead>
                        <TableHead className="font-semibold text-center w-32">
                          View (Sidebar)
                        </TableHead>
                        <TableHead className="font-semibold text-center w-32">
                          Create/Manage
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => {
                        // Get all perms for this category from the FULL list
                        const categoryPerms = permissions.filter(
                          (p) => p.category === category
                        );

                        const viewPerm = categoryPerms.find(
                          (p) =>
                            p.name.includes("view") || p.name.includes("list")
                        );
                        const hasView =
                          viewPerm && role.permissions.includes(viewPerm._id);

                        const writePerms = categoryPerms.filter(
                          (p) =>
                            p.name.includes("create") ||
                            p.name.includes("edit") ||
                            p.name.includes("delete") ||
                            p.name.includes("manage")
                        );
                        const hasCreate =
                          writePerms.length > 0 &&
                          writePerms.every((p) =>
                            role.permissions.includes(p._id)
                          );

                        return (
                          <TableRow key={category}>
                            <TableCell className="font-medium capitalize">
                              {category.replace(/_/g, " ")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                disabled={!viewPerm}
                                checked={!!hasView}
                                onCheckedChange={() => toggleView(category)}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                disabled={writePerms.length === 0}
                                checked={!!hasCreate}
                                onCheckedChange={() =>
                                  toggleCreateMaster(category)
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

              {/* Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={createRole}
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Creating..." : "Create Role"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateRole;
