"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
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
import {
  Eye,
  Edit,
  Trash2,
  Filter,
  X,
  Plus,
  MoreVertical,
  Search,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useDebounce } from "@app/hooks/useDebounce";
import { Skeleton } from "@app/components/ui/skeleton";

interface IMember {
  _id: string;
  block: string;
  year: string;
  vehicle: string;
  samiti: string;
  code: string;
  instagram: string;
  twitter: string;
  startLat: number;
  startLong: number;
  startDate: string;
  endLat: number;
  endLong: number;
  endDate: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const MemberList = () => {
  return (
    <RouteGuard requiredPermissions={["view_members"]}>
      <MemberListContent />
    </RouteGuard>
  );
};

const MemberListContent = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filterBlock, setFilterBlock] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterVehicle, setFilterVehicle] = useState("All");
  const [filterSamiti, setFilterSamiti] = useState("All");
  const [filterCode, setFilterCode] = useState("All");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params: any = {
        page: currentPage,
        limit: entriesPerPage === -1 ? undefined : entriesPerPage,
        search: debouncedSearchTerm || undefined,
        block: filterBlock === "All" ? undefined : filterBlock,
        year: filterYear === "All" ? undefined : filterYear,
        vehicle: filterVehicle === "All" ? undefined : filterVehicle,
        samiti: filterSamiti === "All" ? undefined : filterSamiti,
        code: filterCode === "All" ? undefined : filterCode,
      };

      const { data } = await axios.get("http://localhost:5000/api/members", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setMembers(data.data || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    filterBlock,
    filterYear,
    filterVehicle,
    filterSamiti,
    filterCode,
  ]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Member deleted successfully");
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete member");
    }
  };

  const handleExport = () => {
    if (members.length === 0) return toast.warning("No data to export");
    const ws = XLSX.utils.json_to_sheet(members);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Members.xlsx");
    toast.success("Exported successfully");
  };

  const clearFilters = () => {
    setFilterBlock("All");
    setFilterYear("All");
    setFilterVehicle("All");
    setFilterSamiti("All");
    setFilterCode("All");
  };

  return (
    <>
      <ContentHeader title="Member Management" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header / Search / Actions */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Block, Samiti, Code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleExport}
                    className="bg-[#2e7875] hover:bg-[#00563B] text-white hover:text-white"
                  >
                    <Download className="w-5 h-5 mr-2" /> Export
                  </Button>
                  {hasPermission("create_members") && (
                    <Button
                      size="lg"
                      className="bg-[#2e7875] hover:bg-[#00563B] text-white hover:text-white"
                      onClick={() => router.push("/member-list/create")}
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add New
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterBlock} onValueChange={setFilterBlock}>
                  <SelectTrigger className="w-40 h-11 bg-white">
                    <SelectValue placeholder="Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Blocks</SelectItem>
                    <SelectItem value="Niwali">Niwali</SelectItem>
                    <SelectItem value="Sendhwa">Sendhwa</SelectItem>
                    {/* Add more blocks */}
                  </SelectContent>
                </Select>

                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-32 h-11 bg-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Years</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                  <SelectTrigger className="w-32 h-11 bg-white">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Vehicles</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSamiti} onValueChange={setFilterSamiti}>
                  <SelectTrigger className="w-40 h-11 bg-white">
                    <SelectValue placeholder="Samiti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Samitis</SelectItem>
                    <SelectItem value="Samiti A">Samiti A</SelectItem>
                    <SelectItem value="Samiti B">Samiti B</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCode} onValueChange={setFilterCode}>
                  <SelectTrigger className="w-32 h-11 bg-white">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Codes</SelectItem>
                    <SelectItem value="C001">C001</SelectItem>
                    <SelectItem value="C002">C002</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  title="Clear Filters"
                  className="h-11"
                >
                  <X className="w-4 h-4 mr-2" /> Clear
                </Button>

                <div className="ml-auto">
                  <Select
                    value={entriesPerPage.toString()}
                    onValueChange={(v) => {
                      setEntriesPerPage(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-24 h-11 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 entries</SelectItem>
                      <SelectItem value="25">25 entries</SelectItem>
                      <SelectItem value="50">50 entries</SelectItem>
                      <SelectItem value="-1">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#00563B] hover:bg-[#00563B]">
                    <TableHead className="text-white font-semibold whitespace-nowrap min-w-[80px]">
                      Instagram
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap min-w-[80px]">
                      Twitter
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap">
                      Block
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap">
                      Code
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap min-w-[150px]">
                      Start Date
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap min-w-[150px]">
                      End Date
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap min-w-[100px]">
                      Image
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap min-w-[150px]">
                      Created On
                    </TableHead>
                    <TableHead className="text-white font-semibold whitespace-nowrap text-right min-w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-10 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-20 text-gray-500"
                      >
                        No members found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow
                        key={member._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>{member.instagram || "-"}</TableCell>
                        <TableCell>{member.twitter || "-"}</TableCell>
                        <TableCell>{member.block}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-600">
                            {member.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {member.startDate
                            ? new Date(member.startDate).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {member.endDate
                            ? new Date(member.endDate).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {member.image ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                window.open(member.image, "_blank")
                              }
                            >
                              <Eye className="w-3 h-3 mr-1" /> View
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No Image
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-200"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/member-list/${member._id}/view`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              {hasPermission("edit_members") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/member-list/${member._id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {hasPermission("delete_members") && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDelete(member._id)}
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
                  Showing{" "}
                  {(currentPage - 1) *
                    (entriesPerPage === -1 ? totalCount : entriesPerPage) +
                    1}{" "}
                  to{" "}
                  {entriesPerPage === -1
                    ? totalCount
                    : Math.min(currentPage * entriesPerPage, totalCount)}{" "}
                  of {totalCount} entries
                </p>
                <div className="flex items-center gap-2">
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
                    disabled={
                      entriesPerPage === -1 ||
                      currentPage * entriesPerPage >= totalCount
                    }
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

export default MemberList;
