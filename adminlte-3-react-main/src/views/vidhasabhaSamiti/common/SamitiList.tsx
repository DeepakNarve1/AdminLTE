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
import { Dialog, DialogContent, DialogTitle } from "@app/components/ui/dialog";
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
  Eye,
  Download,
  Columns,
} from "lucide-react";

interface ISamitiData {
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
  image?: string;
  addedBy?: string; // Sometimes shown in images
}

interface SamitiListProps {
  title: string;
  apiEndpoint: string; // e.g. "ganesh-samiti" -> "/api/vidhasabha-samiti/ganesh-samiti"
  resourceName: string; // for permissions, e.g. "ganesh_samiti"
  basePath: string; // for routing, e.g. "/vidhasabha-samiti/ganesh-samiti"
}

const SamitiList = ({
  title,
  apiEndpoint,
  resourceName,
  basePath,
}: SamitiListProps) => {
  return (
    <RouteGuard requiredPermissions={[`view_${resourceName}`]}>
      <SamitiListContent
        title={title}
        apiEndpoint={apiEndpoint}
        resourceName={resourceName}
        basePath={basePath}
      />
    </RouteGuard>
  );
};

const SamitiListContent = ({
  title,
  apiEndpoint,
  resourceName,
  basePath,
}: SamitiListProps) => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [dataList, setDataList] = useState<ISamitiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    uniqueId: true,
    year: true,
    acMpNo: true,
    block: true,
    sector: true,
    microSector: true, // Combined No & Name
    booth: true, // Combined Name & No
    gramPanchayat: true,
    village: true,
    faliya: true,
    totalMembers: true,
    image: true,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Adjust URL construction based on your backend routes
      const url = `http://localhost:5000/api/${apiEndpoint}`;

      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearchTerm || undefined,
      };

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setDataList(data.data || []);
      setTotalCount(data.count || 0);
      if (data.filteredCount !== undefined) {
        setTotalCount(data.filteredCount);
      }
    } catch (error) {
      console.error(error);
      // toast.error(`Failed to fetch ${title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, entriesPerPage, debouncedSearchTerm, apiEndpoint]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/${apiEndpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Record deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete record");
    }
  };

  const handleExport = () => {
    if (dataList.length === 0) return toast.warning("No data to export");
    const ws = XLSX.utils.json_to_sheet(dataList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
    toast.success("Exported successfully");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <ContentHeader title={`${title} List`} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header Actions */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search..."
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
                    className="bg-white dark:bg-neutral-900 rounded-sm text-[#2e7875] hover:bg-[#2e7875] hover:text-white border border-[#2e7875]"
                  >
                    <Download className="w-5 h-5 mr-2" /> Export
                  </Button>
                  {hasPermission(`create_${resourceName}`) && (
                    <Button
                      size="lg"
                      onClick={() => router.push(`${basePath}/create`)}
                      className="bg-white dark:bg-neutral-900 rounded-sm text-[#2e7875] hover:bg-[#2e7875] hover:text-white border border-[#2e7875]"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add New Record
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
                  <TableRow className="bg-[#002f5e] hover:bg-[#002f5e]">
                    {/* Using a generic dark blue header as seen in screenshots, or keeping it strictly theme consistent? 
                      Screenshots show dark blue header. I'll stick to that or theme default. 
                      Actually screenshots show a dark blue header row.
                  */}
                    <TableHead className="text-white font-semibold whitespace-nowrap w-12">
                      Sr No
                    </TableHead>
                    {visibleColumns.uniqueId && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Unique ID
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.image && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Image
                      </TableHead>
                    )}
                    {visibleColumns.acMpNo && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        AC/MP No.
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.sector && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Sector
                      </TableHead>
                    )}
                    {visibleColumns.microSector && (
                      <TableHead className="text-white font-semibold whitespace-nowrap text-center">
                        <div>Micro Sector</div>
                        <div className="text-xs opacity-75">(No / Name)</div>
                      </TableHead>
                    )}
                    {visibleColumns.booth && (
                      <TableHead className="text-white font-semibold whitespace-nowrap text-center">
                        <div>Booth</div>
                        <div className="text-xs opacity-75">(Name / No)</div>
                      </TableHead>
                    )}
                    {visibleColumns.gramPanchayat && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Gram Panchayat
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.faliya && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Faliya
                      </TableHead>
                    )}
                    {visibleColumns.totalMembers && (
                      <TableHead className="text-white font-semibold whitespace-nowrap">
                        Total Members
                      </TableHead>
                    )}
                    <TableHead className="text-white text-right font-semibold whitespace-nowrap">
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
                  ) : dataList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-20 text-gray-500"
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataList.map((item, index) => (
                      <TableRow key={item._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {(currentPage - 1) *
                            (entriesPerPage === -1 ? 0 : entriesPerPage) +
                            index +
                            1}
                        </TableCell>
                        {visibleColumns.uniqueId && (
                          <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                            {item.uniqueId}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell className="whitespace-nowrap">
                            {item.year}
                          </TableCell>
                        )}
                        {visibleColumns.image && (
                          <TableCell className="whitespace-nowrap">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt="Thumbnail"
                                className="h-10 w-10 object-cover rounded cursor-pointer border border-gray-200"
                                onClick={() => setSelectedImage(item.image!)}
                              />
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.acMpNo && (
                          <TableCell className="whitespace-nowrap">
                            {item.acMpNo || "N/A"}
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell className="whitespace-nowrap">
                            {item.block}
                          </TableCell>
                        )}
                        {visibleColumns.sector && (
                          <TableCell className="whitespace-nowrap">
                            {item.sector}
                          </TableCell>
                        )}
                        {visibleColumns.microSector && (
                          <TableCell className="whitespace-nowrap text-center">
                            <div className="font-medium">
                              {item.microSectorNo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.microSectorName}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.booth && (
                          <TableCell className="whitespace-nowrap text-center">
                            <div className="font-medium">{item.boothName}</div>
                            <div className="text-xs text-gray-500">
                              {item.boothNo}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.gramPanchayat && (
                          <TableCell className="whitespace-nowrap">
                            {item.gramPanchayat}
                          </TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell className="whitespace-nowrap">
                            {item.village}
                          </TableCell>
                        )}
                        {visibleColumns.faliya && (
                          <TableCell className="whitespace-nowrap">
                            {item.faliya}
                          </TableCell>
                        )}
                        {visibleColumns.totalMembers && (
                          <TableCell className="whitespace-nowrap text-center">
                            {item.totalMembers}
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
                                  router.push(`${basePath}/${item._id}/view`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              {hasPermission(`edit_${resourceName}`) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`${basePath}/${item._id}/edit`)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {hasPermission(`delete_${resourceName}`) && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(item._id)}
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

      {/* Image Preview Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {selectedImage && (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={selectedImage}
                alt="Full Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-md"
              />
              <button
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                onClick={() => setSelectedImage(null)}
              >
                <span className="sr-only">Close</span>
                {/* Close Icon SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SamitiList;
