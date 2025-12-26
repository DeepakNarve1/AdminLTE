"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Edit, ArrowLeft, Calendar, ShieldCheck, Hash } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";

const ViewDistrict = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [district, setDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/districts/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDistrict(res.data?.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load district");
        router.push("/districts");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDistrict();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="District Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="District Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {district?.name}
                </h2>
                <p className="text-gray-500 mt-1">
                  District Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/districts")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission("edit_districts") && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/districts/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit District
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Info Card 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      District Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {district?.name}
                    </p>
                  </div>
                </div>

                {/* Info Card 3 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Created At
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {district?.createdAt
                        ? new Date(district.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {/* Info Card 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Division
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {district?.division?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Info Card - State */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      State
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {district?.division?.state?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-4">
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    System Information
                  </h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Unique System ID:{" "}
                    <code className="bg-white px-2 py-1 rounded shadow-sm ml-1">
                      {district?._id}
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewDistrict;
