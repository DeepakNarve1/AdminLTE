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
} from "@app/components/ui/dropdown-menu";

import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
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

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/assembly-issues",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIssues(data.data || []);
    } catch (error) {
      // toast.error("Failed to fetch assembly issues");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

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

  const filteredIssues = issues.filter(
    (issue) =>
      issue.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.block?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.boothName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  {hasPermission("create_assembly_issues") && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/assembly-issue/create")}
                      className="bg-[#00563B] hover:bg-[#368F8B]"
                    >
                      <Plus className="w-5 h-5 mr-2" /> New Issue
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
                    <TableHead className="font-semibold whitespace-nowrap">
                      Unique ID
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Year
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Block
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Sector
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Micro Sector No
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Booth Name
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Booth No
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Gram Panchayat
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Village
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Faliya
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Total Members
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      File
                    </TableHead>
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
                  ) : filteredIssues.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-20 text-gray-500"
                      >
                        No issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIssues.map((issue) => (
                      <TableRow key={issue._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                          {issue.uniqueId}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.year}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.block}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.sector}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.microSectorNo}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.boothName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.boothNo}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.gramPanchayat}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.village}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {issue.faliya}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {issue.totalMembers}
                          </Badge>
                        </TableCell>
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
          </div>
        </div>
      </section>
    </>
  );
};

export default AssemblyIssueList;
