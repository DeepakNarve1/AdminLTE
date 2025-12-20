import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  Eye,
  Edit,
  Columns,
  MoreVertical,
  Trash2,
  FileText,
} from "lucide-react";
import { ContentHeader } from "@app/components";

interface IProject {
  _id: string;
  district: string;
  block: string;
  department: string;
  workName: string;
  projectCost: number;
  proposalEstimate: number;
  tsNoDate: string;
  asNoDate: string;
  status: string;
  officerName: string;
  contactNumber: string;
  remarks: string;
  createdAt?: string;
}

const ProjectSummary = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    district: true,
    block: true,
    department: true,
    workName: true,
    projectCost: true,
    proposalEstimate: true,
    tsNoDate: true,
    asNoDate: true,
    status: true,
    officerName: true,
    contactNumber: true,
    remarks: true,
  });

  const [selectedRemark, setSelectedRemark] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage === -1 ? undefined : entriesPerPage,
        block: filterBlock === "all" ? undefined : filterBlock,
        department: filterDepartment === "all" ? undefined : filterDepartment,
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchTerm || undefined,
      };

      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });

      setData(res.data.data || []);
      setTotalCount(res.data.count || 0);
    } catch (err: any) {
      toast.error("Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    entriesPerPage,
    filterBlock,
    filterDepartment,
    filterStatus,
    searchTerm,
  ]);

  const handleExport = () => {
    if (data.length === 0) return toast.warning("No data to export");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, "ProjectSummary.xlsx");
    toast.success("Exported successfully");
  };

  const handleImport = () => {
    toast.info("Import feature coming soon");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "in progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <ContentHeader title="Project Summary" />

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
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  {/* Filters Group */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Select value={filterBlock} onValueChange={setFilterBlock}>
                      <SelectTrigger className="w-48 h-12">
                        <SelectValue placeholder="All Blocks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blocks</SelectItem>
                        <SelectItem value="Bagh">Bagh</SelectItem>
                        <SelectItem value="Tanda">Tanda</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterDepartment}
                      onValueChange={setFilterDepartment}
                    >
                      <SelectTrigger className="w-48 h-12">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="PWD">PWD</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-48 h-12">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
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
                  </div>

                  {/* Divider for better separation */}
                  <div className="hidden 2xl:block h-8 w-px bg-gray-200 mx-4" />

                  {/* Actions Group */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleExport}
                      className="bg-[#00563B] hover:bg-[#368F8B] text-white"
                    >
                      <Download className="w-5 h-5 mr-2" /> Export
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#00563B] hover:bg-[#368F8B] text-white"
                    >
                      <Upload className="w-5 h-5 mr-2" /> Import
                    </Button>

                    <Button
                      size="lg"
                      onClick={() => navigate("/projects/create")}
                      className="bg-[#00563B] hover:bg-[#368F8B]"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Project
                    </Button>
                  </div>
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

            {/* Column Visibility Toggle */}
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
                      {key.replace(/([A-Z])/g, " $1").trim()}
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
                    {visibleColumns.srNo && (
                      <TableHead className="font-semibold">Sr. No.</TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="font-semibold">District</TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold">Block</TableHead>
                    )}
                    {visibleColumns.department && (
                      <TableHead className="font-semibold">
                        Department
                      </TableHead>
                    )}
                    {visibleColumns.workName && (
                      <TableHead className="font-semibold">Work Name</TableHead>
                    )}
                    {visibleColumns.projectCost && (
                      <TableHead className="font-semibold">
                        Project Cost (₹)
                      </TableHead>
                    )}
                    {visibleColumns.proposalEstimate && (
                      <TableHead className="font-semibold">
                        Proposal Estimate (₹)
                      </TableHead>
                    )}
                    {visibleColumns.tsNoDate && (
                      <TableHead className="font-semibold">
                        TS No/Date
                      </TableHead>
                    )}
                    {visibleColumns.asNoDate && (
                      <TableHead className="font-semibold">
                        AS No/Date
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="font-semibold">Status</TableHead>
                    )}
                    {visibleColumns.officerName && (
                      <TableHead className="font-semibold">
                        Officer Name
                      </TableHead>
                    )}
                    {visibleColumns.contactNumber && (
                      <TableHead className="font-semibold">
                        Contact Number
                      </TableHead>
                    )}
                    {visibleColumns.remarks && (
                      <TableHead className="font-semibold">Remarks</TableHead>
                    )}
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {visibleColumns.srNo && (
                          <TableCell>
                            <Skeleton className="h-10 w-16" />
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.workName && (
                          <TableCell>
                            <Skeleton className="h-10 w-64" />
                          </TableCell>
                        )}
                        {visibleColumns.projectCost && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.proposalEstimate && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.tsNoDate && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.asNoDate && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Skeleton className="h-10 w-24" />
                          </TableCell>
                        )}
                        {visibleColumns.officerName && (
                          <TableCell>
                            <Skeleton className="h-10 w-48" />
                          </TableCell>
                        )}
                        {visibleColumns.contactNumber && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell>
                            <Skeleton className="h-10 w-64" />
                          </TableCell>
                        )}
                        <TableCell>
                          <Skeleton className="h-10 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={14}
                        className="text-center py-20 text-gray-500"
                      >
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((project, idx) => (
                      <TableRow
                        key={project._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell>
                            {(currentPage - 1) * entriesPerPage + idx + 1}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>{project.district}</TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>{project.block}</TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell>{project.department}</TableCell>
                        )}
                        {visibleColumns.workName && (
                          <TableCell>{project.workName}</TableCell>
                        )}
                        {visibleColumns.projectCost && (
                          <TableCell>
                            ₹{project.projectCost.toLocaleString()}
                          </TableCell>
                        )}
                        {visibleColumns.proposalEstimate && (
                          <TableCell>
                            ₹{project.proposalEstimate.toLocaleString()}
                          </TableCell>
                        )}
                        {visibleColumns.tsNoDate && (
                          <TableCell>{project.tsNoDate || "-"}</TableCell>
                        )}
                        {visibleColumns.asNoDate && (
                          <TableCell>{project.asNoDate || "-"}</TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge variant={getStatusVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.officerName && (
                          <TableCell>{project.officerName || "-"}</TableCell>
                        )}
                        {visibleColumns.contactNumber && (
                          <TableCell>{project.contactNumber || "-"}</TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell
                            className="max-w-[150px] truncate cursor-pointer hover:text-[#368F8B] transition-colors"
                            onClick={() =>
                              setSelectedRemark(project.remarks || "No remarks")
                            }
                            title="Click to view full remarks"
                          >
                            {project.remarks || "-"}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
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
                                  navigate(`/projects/${project._id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/projects/${project._id}/edit`)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                Project
                              </DropdownMenuItem>
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
                  {Math.min(currentPage * entriesPerPage, totalCount)} of{" "}
                  {totalCount} entries
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
                    disabled={currentPage * entriesPerPage >= totalCount}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Modal */}
        {selectedRemark && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-2000 flex items-center justify-center p-4"
            onClick={() => setSelectedRemark(null)}
          >
            <div
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">
                  Project Remarks
                </h3>
                <button
                  onClick={() => setSelectedRemark(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedRemark}
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setSelectedRemark(null)}
                  className="bg-[#00563B] hover:bg-[#368F8B] px-8"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ProjectSummary;
