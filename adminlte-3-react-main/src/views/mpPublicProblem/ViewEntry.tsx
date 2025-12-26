"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

import { ArrowLeft, Edit, Calendar, Clock, MapPin } from "lucide-react";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Skeleton } from "@app/components/ui/skeleton";

interface IPublicProblem {
  _id: string;
  regNo: string;
  srNo?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

const calculateTimer = (dateStr: string) => {
  const now = new Date();
  const sub = new Date(dateStr);
  const diff = now.getTime() - sub.getTime();

  if (diff < 0) return "0d, 0h, 0m";

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${d}d, ${h}h, ${m}m`;
};

const ViewMPPublicProblem = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<IPublicProblem | null>(null);
  const [hierarchy, setHierarchy] = useState<{
    division: string;
    state: string;
  }>({ division: "", state: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/public-problems/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const entryData = res.data.data;
        setEntry(entryData);

        // Fetch hierarchy based on district name
        if (entryData.district) {
          try {
            const districtRes = await axios.get(
              `http://localhost:5000/api/districts?search=${entryData.district}&limit=1`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const foundDistrict = districtRes.data?.data?.[0];
            if (foundDistrict && foundDistrict.division) {
              const divObj = foundDistrict.division;
              if (divObj._id) {
                setHierarchy((prev) => ({ ...prev, division: divObj.name }));
                if (divObj.state && divObj.state.name) {
                  setHierarchy((prev) => ({
                    ...prev,
                    state: divObj.state.name,
                  }));
                } else {
                  // State is missing from division object, fetch full division
                  try {
                    const divRes = await axios.get(
                      `http://localhost:5000/api/divisions/${divObj._id}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    const fullDiv = divRes.data?.data;
                    if (fullDiv?.state?.name) {
                      setHierarchy((prev) => ({
                        ...prev,
                        state: fullDiv.state.name,
                      }));
                    }
                  } catch (e) {
                    console.error("Failed to fetch division details", e);
                  }
                }
              }
            }
          } catch (err) {
            console.error("Failed to fetch hierarchy details", err);
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load entry");
        router.push("/mp-public-problem");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [params.id, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="View Public Problem Entry" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto p-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96 mb-8" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <>
      <ContentHeader title="View Public Problem Entry" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Registration No: {entry.regNo}
                  </h2>
                  <Badge className={`${getStatusColor(entry.status)} border`}>
                    {entry.status}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  {entry.district} - {entry.assembly}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/mp-public-problem")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(`/mp-public-problem/${entry._id}/edit`)
                  }
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Entry
                </Button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Timer Card */}
              <Card className="bg-linear-to-r from-red-50 to-orange-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Clock className="w-5 h-5" />
                    Time Elapsed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {calculateTimer(entry.submissionDate)}
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Since submission on{" "}
                    {new Date(entry.submissionDate).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              {/* Date Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Date Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {entry.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Month</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {entry.month}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {entry.dateString || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium text-gray-900">
                        {hierarchy.state || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Division</p>
                      <p className="font-medium text-gray-900">
                        {hierarchy.division || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-medium text-gray-900">
                        {entry.district}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assembly</p>
                      <p className="font-medium text-gray-900">
                        {entry.assembly}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Block</p>
                      <p className="font-medium text-gray-900">
                        {entry.block || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booth Number</p>
                      <p className="font-medium text-gray-900">
                        {entry.boothNo || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">
                        {entry.department || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Sr No.</p>
                      <p className="font-medium text-gray-900">
                        {entry.srNo || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Recommended Letter No
                      </p>
                      <p className="font-medium text-gray-900">
                        {entry.recommendedLetterNo || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">
                        <Badge
                          className={`${getStatusColor(entry.status)} border`}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Entry Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {entry.updatedAt
                          ? new Date(entry.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewMPPublicProblem;
