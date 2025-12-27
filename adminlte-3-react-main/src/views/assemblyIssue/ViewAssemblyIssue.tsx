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
    <RouteGuard requiredPermissions={["view_assembly_issues"]}>
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

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!issue) {
    return <div className="p-8 text-center">Issue not found</div>;
  }

  const DetailItem = ({ label, value }: { label: string; value: any }) => (
    <div>
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </h3>
      <p className="text-lg font-medium text-gray-900 wrap-break-word">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <>
      <ContentHeader title="View Assembly Issue" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-5xl mx-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Ganesh Samiti Location Details
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push("/assembly-issue")}
              >
                Back to List
              </Button>
            </div>

            <div className="p-8 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-[#00563B] pl-4">
                    {issue.uniqueId}
                  </h1>
                  <p className="text-gray-500 mt-2 pl-5">
                    Created on {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Badge
                    variant="outline"
                    className="text-lg px-4 py-2 border-slate-300"
                  >
                    Year: {issue.year}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DetailItem label="AC/MP No." value={issue.acMpNo} />
                <DetailItem label="Block" value={issue.block} />
                <DetailItem label="Sector" value={issue.sector} />
                <DetailItem
                  label="Micro Sector No"
                  value={issue.microSectorNo}
                />
                <DetailItem
                  label="Micro Sector Name"
                  value={issue.microSectorName}
                />
                <DetailItem label="Booth Name" value={issue.boothName} />
                <DetailItem label="Booth No" value={issue.boothNo} />
                <DetailItem
                  label="Gram Panchayat"
                  value={issue.gramPanchayat}
                />
                <DetailItem label="Village" value={issue.village} />
                <DetailItem label="Faliya" value={issue.faliya} />
                <DetailItem label="Total Members" value={issue.totalMembers} />

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Attached File
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 inline-block">
                    {issue.file ? (
                      <a
                        href={issue.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <span className="font-semibold">View File</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">
                        No file attached
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Update Info */}
              <div className="pt-6 border-t text-sm text-gray-400 flex justify-between items-center">
                <span>
                  Last updated on {new Date(issue.updatedAt).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  onClick={() =>
                    router.push(`/assembly-issue/${issue._id}/edit`)
                  }
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  Edit Details
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
