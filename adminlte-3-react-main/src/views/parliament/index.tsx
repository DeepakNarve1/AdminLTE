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

import { Search, Plus, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { ContentHeader } from "@app/components";

interface IParliamentRow {
  _id: string;
  name: string;
  division: {
    _id: string;
    name: string;
  };
  createdAt?: string;
}

const Parliament = () => {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const [parliaments, setParliaments] = useState<IParliamentRow[]>([]);
  const [filteredParliaments, setFilteredParliaments] = useState<
    IParliamentRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchParliaments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/parliaments?limit=-1",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data?.data || [];
      setParliaments(data);
      setFilteredParliaments(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load parliaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParliaments();
  }, []);

  // Search Filter
  useEffect(() => {
    let filtered = parliaments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.division?.name?.toLowerCase().includes(term)
      );
    }

    setFilteredParliaments(filtered);
    setCurrentPage(1);
  }, [searchTerm, parliaments]);

  // Pagination
  const paginatedParliaments = useMemo(() => {
    if (entriesPerPage === -1) return filteredParliaments;
    const start = (currentPage - 1) * entriesPerPage;
    return filteredParliaments.slice(start, start + entriesPerPage);
  }, [filteredParliaments, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(
    filteredParliaments.length /
      (entriesPerPage === -1 ? filteredParliaments.length || 1 : entriesPerPage)
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this parliament?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/parliaments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Parliament deleted successfully");
      fetchParliaments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not delete parliament");
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
      <ContentHeader title="Parliament Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Actions Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search parliaments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={entriesPerPage.toString()}
                    onValueChange={(v) =>
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

                  {hasPermission("create_parliaments") && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/parliaments/create")}
                      className="bg-white dark:bg-neutral-900 rounded-sm text-[#2e7875] hover:bg-[#2e7875] hover:text-white border border-[#2e7875]"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add New Parliament
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
                    <TableHead className="font-semibold w-24">
                      Sr. No.
                    </TableHead>
                    <TableHead className="font-semibold">
                      Parliament Name
                    </TableHead>
                    <TableHead className="font-semibold">Division</TableHead>
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
                          <Skeleton className="h-12 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-12 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-12 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-10 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedParliaments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-20 text-gray-500"
                      >
                        No parliaments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedParliaments.map((parliament, index) => (
                      <TableRow
                        key={parliament._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-600">
                          {(currentPage - 1) *
                            (entriesPerPage === -1 ? 0 : entriesPerPage) +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
                              {getInitials(parliament.name)}
                            </div>
                            <div>
                              <p className="font-medium">{parliament.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {parliament.division?.name || "N/A"}
                          </span>
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
                              {hasPermission("view_parliaments") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/parliaments/${parliament._id}`
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                              )}
                              {hasPermission("edit_parliaments") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/parliaments/${parliament._id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {hasPermission("delete_parliaments") && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(parliament._id)}
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
                  {Math.min(
                    currentPage * entriesPerPage,
                    filteredParliaments.length
                  )}{" "}
                  of {filteredParliaments.length} parliaments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(totalPages, currentPage + 2)
                    )
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-[#00563B] hover:bg-[#368F8B]"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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

export default Parliament;
