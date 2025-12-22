"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { IUserRow } from "@app/types/user";
import { useAuthorization } from "@app/hooks/useAuthorization";

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
import { Badge } from "@app/components/ui/badge";
import { Avatar, AvatarFallback } from "@app/components/ui/avatar";
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

import {
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { ContentHeader } from "@app/components";

const Users = () => {
  const { checkPermission } = useAuthorization();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [users, setUsers] = useState<IUserRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      const roleName = typeof u.role === "object" ? u.role.name : u.role;
      if (roleName) set.add(roleName);
    });
    return Array.from(set).sort();
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res.data?.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtering
  useEffect(() => {
    let filtered = users;

    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => {
        const roleName = typeof u.role === "object" ? u.role.name : u.role;
        return roleName === selectedRole;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.mobile && u.mobile.includes(term))
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedRole, users]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    if (entriesPerPage === -1) return filteredUsers;
    const start = (currentPage - 1) * entriesPerPage;
    return filteredUsers.slice(start, start + entriesPerPage);
  }, [filteredUsers, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(
    filteredUsers.length /
      (entriesPerPage === -1 ? filteredUsers.length || 1 : entriesPerPage)
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) return toast.warning("No users to export");

    const data = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Mobile: user.mobile || "-",
      Role:
        typeof user.role === "object"
          ? user.role.displayName || user.role.name
          : user.role || "-",
      "Created On": user.createdAt
        ? new Date(user.createdAt).toLocaleString()
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `users_${Date.now()}.xlsx`);
    toast.success("Users exported successfully");
  };

  // Paste your full handleImport here
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Your original import logic
  };

  const getRoleVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "superadmin":
        return "default";
      case "admin":
        return "destructive";
      case "manager":
        return "secondary";
      case "editor":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Main Content - Separate Block like Spotify */}
      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Actions Bar */}
            <ContentHeader title="Users Management" />
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, email or mobile..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleExport}
                    className="bg-[#00563B] hover:bg-[#368F8B] hover:text-white text-white"
                  >
                    <Download className="w-5 h-5 mr-2" /> Export
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#00563B] hover:bg-[#368F8B] hover:text-white text-white"
                  >
                    <Upload className="w-5 h-5 mr-2" /> Import
                  </Button>

                  {checkPermission("create_users") && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/users/create")}
                      className="bg-[#00563B] hover:bg-[#368F8B]"
                    >
                      <Plus className="w-5 h-5 mr-2 " /> Add User
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Created On</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-16 w-72" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-16 w-64" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-16 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-10 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-20 text-gray-500"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => {
                      const roleName =
                        typeof user.role === "object"
                          ? user.role.displayName || user.role.name
                          : user.role || "User";
                      return (
                        <TableRow
                          key={user._id}
                          className="hover:bg-gray-200 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {user.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span>{user.email}</span>
                              </div>
                              {user.mobile && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-5 h-5" />
                                  <span>{user.mobile}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getRoleVariant(roleName)}
                              className="text-sm px-3 py-1"
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              {roleName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
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
                                {checkPermission("view_users") && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/users/${user._id}/view`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {checkPermission("edit_users") && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/users/${user._id}/edit`)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {checkPermission("delete_users") && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(user._id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                  {Math.min(currentPage * entriesPerPage, filteredUsers.length)}{" "}
                  of {filteredUsers.length} users
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
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

export default Users;
