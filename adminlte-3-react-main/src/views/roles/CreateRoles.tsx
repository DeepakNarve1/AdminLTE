"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { flattenMenu } from "@app/utils/sidebarMenu";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@app/components/ui/tabs";
import { Textarea } from "@app/components/ui/textarea";

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

  const [sidebarAccess, setSidebarAccess] = useState<string[]>([]);
  const menuItems = flattenMenu();
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

  const togglePermission = (id: string) => {
    setRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  };

  const toggleSidebarAccess = (path: string) => {
    setSidebarAccess((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const toggleAllSidebar = (checked: boolean) => {
    if (checked) {
      setSidebarAccess(
        menuItems.map((i) => i.path).filter(Boolean) as string[]
      );
    } else {
      setSidebarAccess([]);
    }
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
          sidebarAccess,
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
    setSidebarAccess([]);
    setErrors({});
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, IPermission[]>
  );

  return (
    <>
      <ContentHeader title="Create Role" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Role
              </h2>
              <p className="text-gray-600 mt-1">
                Define role details, permissions, and sidebar access.
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

              {/* Tabs: Permissions & Sidebar */}
              <Tabs defaultValue="permissions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="sidebar">Sidebar Access</TabsTrigger>
                </TabsList>

                <TabsContent value="permissions" className="space-y-6">
                  {Object.entries(groupedPermissions).map(
                    ([category, perms]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                          {category.replace(/_/g, " ")} Permissions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {perms.map((p) => (
                            <div
                              key={p._id}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={p._id}
                                checked={role.permissions.includes(p._id)}
                                onCheckedChange={() => togglePermission(p._id)}
                              />
                              <Label
                                htmlFor={p._id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {p.displayName}
                                <p className="text-xs text-gray-500 font-normal">
                                  {p.description}
                                </p>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </TabsContent>

                <TabsContent value="sidebar">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Menu Access
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-sidebar"
                        checked={
                          menuItems.length > 0 &&
                          menuItems.every(
                            (i) => i.path && sidebarAccess.includes(i.path)
                          )
                        }
                        onCheckedChange={toggleAllSidebar}
                      />
                      <Label htmlFor="select-all-sidebar">Select All</Label>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Menu Name</TableHead>
                          <TableHead>Path</TableHead>
                          <TableHead className="text-center">Access</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuItems.map((item: any) => (
                          <TableRow
                            key={item.path}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {item.path || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={
                                  item.path
                                    ? sidebarAccess.includes(item.path)
                                    : false
                                }
                                onCheckedChange={() =>
                                  item.path && toggleSidebarAccess(item.path)
                                }
                                disabled={!item.path}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  onClick={createRole}
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Creating..." : "Create Role"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Reset Form
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

export default CreateRole;
