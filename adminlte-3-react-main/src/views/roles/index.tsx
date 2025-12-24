"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { usePermissions } from "@app/hooks/usePermissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Skeleton } from "@app/components/ui/skeleton";

import { Search, Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { ContentHeader } from "@app/components";

interface IRoleRow {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
}

const RoleList = () => {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("manage_roles");
  const router = useRouter();

  const [roles, setRoles] = useState<IRoleRow[]>([]);

  /* Removed duplicate handleDelete */
  const [filteredRoles, setFilteredRoles] = useState<IRoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/rbac/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      setRoles(data);
      setFilteredRoles(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Search Filter
  useEffect(() => {
    let filtered = roles;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.displayName.toLowerCase().includes(term) ||
          (r.description && r.description.toLowerCase().includes(term))
      );
    }

    setFilteredRoles(filtered);
    setCurrentPage(1);
  }, [searchTerm, roles]);

  // Pagination
  const paginatedRoles = useMemo(() => {
    if (entriesPerPage === -1) return filteredRoles;
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRoles.slice(start, start + entriesPerPage);
  }, [filteredRoles, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(
    filteredRoles.length /
      (entriesPerPage === -1 ? filteredRoles.length || 1 : entriesPerPage)
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/rbac/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not delete role");
    }
  };

  return (
    <>
      <ContentHeader title="Role Management" />

      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Actions Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search roles by name or description..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={entriesPerPage.toString()}
                    onValueChange={(v: string) =>
                      setEntriesPerPage(v === "-1" ? -1 : Number(v))
                    }
                  >
                    <SelectTrigger className="w-32 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="-1">All</SelectItem>
                    </SelectContent>
                  </Select>

                  {(hasPermission("manage_roles") ||
                    hasPermission("create_roles")) && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/roles/create")}
                      className="bg-[#00563B] hover:bg-[#368F8B]"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Create New Role
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Role Name</TableHead>
                    <TableHead className="font-semibold">
                      Display Name
                    </TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Created On</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-64" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-10 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedRoles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-20 text-gray-500"
                      >
                        No roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRoles.map((role) => (
                      <TableRow
                        key={role._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                              {role.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{role.displayName}</TableCell>
                        <TableCell className="text-gray-600">
                          {role.description || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {role.createdAt
                            ? new Date(role.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(hasPermission("manage_roles") ||
                                hasPermission("view_roles")) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/roles/${role._id}`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                              )}
                              {(hasPermission("manage_roles") ||
                                hasPermission("edit_roles")) &&
                                !role.isSystem && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/roles/${role._id}/edit`)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                              {(hasPermission("manage_roles") ||
                                hasPermission("delete_roles")) &&
                                !role.isSystem && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(role._id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                  {Math.min(currentPage * entriesPerPage, filteredRoles.length)}{" "}
                  of {filteredRoles.length} roles
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 bg-[#00563B] text-white rounded-md text-sm font-medium">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RoleList;
