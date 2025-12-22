"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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
  MoreVertical,
  Eye,
  Edit,
  Columns,
} from "lucide-react";
import { ContentHeader } from "@app/components";

interface IPublicProblem {
  _id: string;
  regNo: string;
  submissionDate: string;
  year: string;
  month: string;
  dateString: string;
  district: string;
  assembly: string;
  block: string;
  recommendedLetterNo: string;
  boothNo: string;
  status: string;
  department: string;
}

const calculateTimer = (dateStr: string) => {
  const now = new Date();
  const sub = new Date(dateStr);
  const diff = now.getTime() - sub.getTime();

  if (diff < 0) return "0d, 0h, 0m, 0s";

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
};

const MpPublicProblem = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<IPublicProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    regNo: true,
    timer: true,
    year: true,
    month: true,
    date: true,
    district: true,
    assembly: true,
    block: true,
    recLetterNo: true,
    boothNo: true,
  });

  // Live timer
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        block: filterBlock === "all" ? undefined : filterBlock,
        year: filterYear === "all" ? undefined : filterYear,
        month: filterMonth === "all" ? undefined : filterMonth,
        department: filterDepartment === "all" ? undefined : filterDepartment,
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchTerm || undefined,
      };

      const res = await axios.get("http://localhost:5000/api/public-problems", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });

      setData(res.data.data || []);
      setTotalCount(res.data.filteredCount || 0);
    } catch (err: any) {
      toast.error("Failed to fetch data");
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
    filterYear,
    filterMonth,
    filterDepartment,
    filterStatus,
    searchTerm,
  ]);

  const handleSeed = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/public-problems/seed",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Database seeded successfully!");
      fetchData();
    } catch (err) {
      toast.error("Failed to seed database");
    }
  };

  const handleExport = () => {
    if (data.length === 0) return toast.warning("No data to export");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PublicProblems");
    XLSX.writeFile(wb, "PublicProblems.xlsx");
    toast.success("Exported successfully");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.warning("No data found in Excel file");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        let successCount = 0;
        let failureCount = 0;

        for (const row of jsonData) {
          try {
            const anyRow = row as any;
            const payload = {
              regNo:
                anyRow["Regl. No."] || anyRow["RegNo"] || anyRow["regNo"] || "",
              year:
                anyRow["Year"] ||
                anyRow["year"] ||
                new Date().getFullYear().toString(),
              month: anyRow["Month"] || anyRow["month"] || "",
              dateString: anyRow["Date"] || anyRow["dateString"] || "",
              district: anyRow["District"] || anyRow["district"] || "",
              assembly: anyRow["Assembly"] || anyRow["assembly"] || "",
              block: anyRow["Block"] || anyRow["block"] || "",
              recommendedLetterNo:
                anyRow["Recommended Letter No"] ||
                anyRow["recommendedLetterNo"] ||
                "",
              boothNo: anyRow["Booth No"] || anyRow["boothNo"] || "",
              department: anyRow["Department"] || anyRow["department"] || "",
              status: anyRow["Status"] || anyRow["status"] || "Pending",
            };

            if (!payload.regNo || !payload.district) {
              failureCount++;
              continue;
            }

            await axios.post(
              "http://localhost:5000/api/public-problems",
              payload,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            successCount++;
          } catch (error) {
            failureCount++;
          }
        }

        toast.success(
          `Import complete: ${successCount} added, ${failureCount} failed`
        );
        fetchData();
      } catch (error) {
        toast.error("Failed to import file");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <ContentHeader title="Public Problems Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Reg No, district, block..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-12 h-12 text-base"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
                    onClick={() => router.push("/mp-public-problem/create")}
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add Entry
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterBlock} onValueChange={setFilterBlock}>
                  <SelectTrigger className="w-48 h-11">
                    <SelectValue placeholder="All Blocks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    <SelectItem value="Bagh">Bagh</SelectItem>
                    <SelectItem value="Tanda">Tanda</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-40 h-11">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-48 h-11">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="November">November</SelectItem>
                    <SelectItem value="December">December</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterDepartment}
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger className="w-48 h-11">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="PWD">PWD</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={(v: string) =>
                    setEntriesPerPage(v === "-1" ? -1 : Number(v))
                  }
                >
                  <SelectTrigger className="w-32 h-11">
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
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

            {/* Column Visibility */}
            <div className="px-6 py-3 border-b border-gray-200 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
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
                  <TableRow className="bg-[#00563B]">
                    {visibleColumns.srNo && (
                      <TableHead className="text-white font-semibold">
                        Sr. No.
                      </TableHead>
                    )}
                    {visibleColumns.regNo && (
                      <TableHead className="text-white font-semibold">
                        Regl. No.
                      </TableHead>
                    )}
                    {visibleColumns.timer && (
                      <TableHead className="text-white font-semibold">
                        Timer
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="text-white font-semibold">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.month && (
                      <TableHead className="text-white font-semibold">
                        Month
                      </TableHead>
                    )}
                    {visibleColumns.date && (
                      <TableHead className="text-white font-semibold">
                        Date
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="text-white font-semibold">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.assembly && (
                      <TableHead className="text-white font-semibold">
                        Assembly
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="text-white font-semibold">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.recLetterNo && (
                      <TableHead className="text-white font-semibold">
                        Rec. Letter No
                      </TableHead>
                    )}
                    {visibleColumns.boothNo && (
                      <TableHead className="text-white font-semibold">
                        Booth No
                      </TableHead>
                    )}
                    <TableHead className="text-white font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        {visibleColumns.srNo && (
                          <TableCell>
                            <Skeleton className="h-10 w-16" />
                          </TableCell>
                        )}
                        {visibleColumns.regNo && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.timer && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell>
                            <Skeleton className="h-10 w-24" />
                          </TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.assembly && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.recLetterNo && (
                          <TableCell>
                            <Skeleton className="h-10 w-48" />
                          </TableCell>
                        )}
                        {visibleColumns.boothNo && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
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
                        colSpan={12}
                        className="text-center py-20 text-gray-500"
                      >
                        {totalCount > 0 ? (
                          "No records match the current filters"
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <p>No data available</p>
                            <Button
                              onClick={handleSeed}
                              className="bg-yellow-500 hover:bg-yellow-600"
                            >
                              Seed Database (Demo Data)
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, idx) => (
                      <TableRow
                        key={row._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell>
                            {(currentPage - 1) * entriesPerPage + idx + 1}
                          </TableCell>
                        )}
                        {visibleColumns.regNo && (
                          <TableCell className="font-medium">
                            {row.regNo}
                          </TableCell>
                        )}
                        {visibleColumns.timer && (
                          <TableCell className="font-bold text-red-600">
                            {calculateTimer(row.submissionDate)}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell>{row.year}</TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell>{row.month}</TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell>{row.dateString}</TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>{row.district}</TableCell>
                        )}
                        {visibleColumns.assembly && (
                          <TableCell>{row.assembly}</TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>{row.block}</TableCell>
                        )}
                        {visibleColumns.recLetterNo && (
                          <TableCell>
                            {row.recommendedLetterNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.boothNo && (
                          <TableCell>{row.boothNo || "-"}</TableCell>
                        )}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full hover:bg-gray-200"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/mp-public-problem/${row._id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/mp-public-problem/${row._id}/edit`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
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
                  Showing{" "}
                  {entriesPerPage === -1
                    ? 1
                    : Math.min(
                        (currentPage - 1) * entriesPerPage + 1,
                        totalCount
                      )}{" "}
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
      </section>
    </>
  );
};

export default MpPublicProblem;
