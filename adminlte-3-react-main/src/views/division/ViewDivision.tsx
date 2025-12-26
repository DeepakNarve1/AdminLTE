"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Edit, ArrowLeft, ShieldCheck, Hash, MapPin } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";

const ViewDivision = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [divisionData, setDivisionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDivision = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/divisions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDivisionData(res.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load division");
        router.push("/divisions");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDivision();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Division Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Division Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {divisionData?.name}
                </h2>
                <p className="text-gray-500 mt-1">
                  Division Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/divisions")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission("edit_divisions") && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/divisions/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Division
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {/* Info Card 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Division Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {divisionData?.name}
                    </p>
                  </div>
                </div>

                {/* Info Card 2 - State */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      State
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {divisionData?.state?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Info Card 3 - ID */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      System ID
                    </label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {divisionData?._id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Districts List */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Districts under {divisionData?.name}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {divisionData?.districts &&
                  divisionData.districts.length > 0 ? (
                    divisionData.districts.map((dist: any) => (
                      <div
                        key={dist._id}
                        className="px-6 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700 font-medium">
                          {dist.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-gray-500 italic">
                      No districts found for this division.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewDivision;
