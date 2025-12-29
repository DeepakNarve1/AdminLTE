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
import { Badge } from "@app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";

import * as XLSX from "xlsx";
import { useDebounce } from "@app/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  Download,
  Upload,
  Columns,
} from "lucide-react";

interface IAssemblyIssue {
  _id: string;
  uniqueId: string;
  year: string;
  acMpNo: string;
  block: string;
  sector: string;
  microSectorNo: string;
  microSectorName: string;
  boothName: string;
  boothNo: string;
  gramPanchayat: string;
  village: string;
  faliya: string;
  totalMembers: number;
  file?: string;
  createdAt: string;
}

const AssemblyIssueList = () => {
  return (
    <RouteGuard requiredPermissions={["view_assembly_issues"]}>
      <AssemblyIssueListContent />
    </RouteGuard>
  );
};

const AssemblyIssueListContent = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [issues, setIssues] = useState<IAssemblyIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    uniqueId: true,
    year: true,
    block: true,
    sector: true,
    microSectorNo: true,
    boothName: true,
    boothNo: true,
    gramPanchayat: true,
    village: true,
    faliya: true,
    totalMembers: true,
    file: true,
  });

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params: any = {
        page: currentPage,
        limit: entriesPerPage, // Send -1 directly, don't convert to undefined
        search: debouncedSearchTerm || undefined,
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/assembly-issues",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setIssues(data.data || []);
      setTotalCount(data.count || 0);
      // If we filtered, use filteredCount, but API returns data.count as total?
      // Conventionally data.filteredCount if search is active.
      // Let's assume data.count is the relevant count for pagination.
      if (data.filteredCount !== undefined) {
        setTotalCount(data.filteredCount);
      }
    } catch (error) {
      console.error(error);
      // toast.error("Failed to fetch assembly issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [currentPage, entriesPerPage, debouncedSearchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/assembly-issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Issue deleted successfully");
      fetchIssues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete issue");
    }
  };

  const handleExport = () => {
    if (issues.length === 0) return toast.warning("No data to export");
    // Prepare data for export (flatten or select fields if needed)
    // Here exporting raw issue objects
    const ws = XLSX.utils.json_to_sheet(issues);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assembly Issues");
    XLSX.writeFile(wb, "AssemblyIssues.xlsx");
    toast.success("Exported successfully");
  };

  const handleImport = () => {
    toast.info("Import feature coming soon");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <ContentHeader title="Assembly Issues / Ganesh Samiti Locations" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header Actions */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Unique ID, Block, Village..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleExport}
                    className="bg-[#2e7875] hover:bg-[#00563B] text-white hover:text-white"
                  >
                    <Download className="w-5 h-5 mr-2" /> Export
                  </Button>
                  {hasPermission("create_assembly_issues") && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/assembly-issue/create")}
                      className="bg-[#2e7875] hover:bg-[#00563B] text-white hover:text-white"
                    >
                      <Plus className="w-5 h-5 mr-2" /> New Issue
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination/Filter Controls */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-end">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Entries per page:
                </span>
                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={(v: string) => {
                    setEntriesPerPage(v === "-1" ? -1 : Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-32 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="-1">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column Visibility */}
            <div className="px-6 py-3 border-b border-gray-200 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {Object.keys(visibleColumns).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={
                        visibleColumns[key as keyof typeof visibleColumns]
                      }
                      onCheckedChange={() =>
                        toggleColumn(key as keyof typeof visibleColumns)
                      }
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {visibleColumns.uniqueId && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Unique ID
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.sector && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Sector
                      </TableHead>
                    )}
                    {visibleColumns.microSectorNo && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Micro Sector No
                      </TableHead>
                    )}
                    {visibleColumns.boothName && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Booth Name
                      </TableHead>
                    )}
                    {visibleColumns.boothNo && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Booth No
                      </TableHead>
                    )}
                    {visibleColumns.gramPanchayat && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Gram Panchayat
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.faliya && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Faliya
                      </TableHead>
                    )}
                    {visibleColumns.totalMembers && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        Total Members
                      </TableHead>
                    )}
                    {visibleColumns.file && (
                      <TableHead className="font-semibold whitespace-nowrap">
                        File
                      </TableHead>
                    )}
                    <TableHead className="text-right font-semibold whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-10">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : issues.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-20 text-gray-500"
                      >
                        No issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    issues.map((issue) => (
                      <TableRow key={issue._id} className="hover:bg-gray-50">
                        {visibleColumns.uniqueId && (
                          <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                            {issue.uniqueId}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell className="whitespace-nowrap">
                            {issue.year}
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell className="whitespace-nowrap">
                            {issue.block}
                          </TableCell>
                        )}
                        {visibleColumns.sector && (
                          <TableCell className="whitespace-nowrap">
                            {issue.sector}
                          </TableCell>
                        )}
                        {visibleColumns.microSectorNo && (
                          <TableCell className="whitespace-nowrap">
                            {issue.microSectorNo}
                          </TableCell>
                        )}
                        {visibleColumns.boothName && (
                          <TableCell className="whitespace-nowrap">
                            {issue.boothName}
                          </TableCell>
                        )}
                        {visibleColumns.boothNo && (
                          <TableCell className="whitespace-nowrap">
                            {issue.boothNo}
                          </TableCell>
                        )}
                        {visibleColumns.gramPanchayat && (
                          <TableCell className="whitespace-nowrap">
                            {issue.gramPanchayat}
                          </TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell className="whitespace-nowrap">
                            {issue.village}
                          </TableCell>
                        )}
                        {visibleColumns.faliya && (
                          <TableCell className="whitespace-nowrap">
                            {issue.faliya}
                          </TableCell>
                        )}
                        {visibleColumns.totalMembers && (
                          <TableCell className="whitespace-nowrap text-center">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {issue.totalMembers}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.file && (
                          <TableCell className="whitespace-nowrap">
                            {issue.file ? (
                              <span className="text-blue-600 underline text-xs cursor-pointer">
                                View File
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No File
                              </span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/assembly-issue/${issue._id}/view`
                                  )
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              {hasPermission("edit_assembly_issues") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/assembly-issue/${issue._id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {hasPermission("delete_assembly_issues") && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(issue._id)}
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

            {/* Pagination Footer */}
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

export default AssemblyIssueList;
