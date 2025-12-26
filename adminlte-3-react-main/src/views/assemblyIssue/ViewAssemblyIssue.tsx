"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

import { Button } from "@app/components/ui/button";
import { Badge } from "@app/components/ui/badge";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";

const ViewAssemblyIssue = () => {
  return (
    <RouteGuard requiredPermissions={["manage_roles", "view_assembly_issues"]}>
      <ViewAssemblyIssueContent />
    </RouteGuard>
  );
};

const ViewAssemblyIssueContent = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/assembly-issues/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIssue(data.data || null);
      } catch (error) {
        console.error("Failed to fetch issue", error);
        toast.error("Failed to load assembly issue details");
        router.push("/assembly-issue");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIssue();
    }
  }, [id, router]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "destructive";
      case "Medium":
        return "default"; // or "secondary"
      case "Low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!issue) {
    return <div className="p-8 text-center">Issue not found</div>;
  }

  return (
    <>
      <ContentHeader title="View Assembly Issue" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Issue Details
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push("/assembly-issue")}
              >
                Back to List
              </Button>
            </div>

            <div className="p-8 space-y-6">
              {/* Title & Status */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {issue.title}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Reported on {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(issue.status)}`}
                  >
                    {issue.status}
                  </span>
                  <Badge
                    variant={getPriorityColor(issue.priority)}
                    className="text-sm px-3 py-1.5"
                  >
                    {issue.priority}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Assembly
                  </h3>
                  <p className="text-lg font-medium text-gray-900">
                    {issue.assembly}
                  </p>
                </div>

                {/* You could add more fields here if the model had them (e.g. reported by, assigned to) */}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
                  {issue.description || "No description provided."}
                </div>
              </div>

              {/* Update Info */}
              <div className="pt-6 border-t text-sm text-gray-400">
                Last updated on {new Date(issue.updatedAt).toLocaleString()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() =>
                    router.push(`/assembly-issue/${issue._id}/edit`)
                  }
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  Edit Issue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewAssemblyIssue;
