"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { usePermissions } from "@app/hooks/usePermissions";

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
  file?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SamitiViewProps {
  title: string;
  apiEndpoint: string;
  resourceName: string; // for edit permission check
  basePath: string; // e.g. /vidhasabha-samiti/ganesh-samiti
}

const SamitiView = ({
  title,
  apiEndpoint,
  resourceName,
  basePath,
}: SamitiViewProps) => {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<ISamitiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/${apiEndpoint}/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, apiEndpoint]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-6 text-center">Record not found</div>;

  return (
    <>
      <ContentHeader title={`${title} Details`} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                Record Information
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {hasPermission(`edit_${resourceName}`) && (
                  <Button
                    onClick={() => router.push(`${basePath}/${id}/edit`)}
                    className="bg-[#00563B] hover:bg-[#2e7a77] text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Record
                  </Button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                {/* Unique ID */}
                <ViewField label="Unique ID" value={data.uniqueId} />
                <ViewField label="Year" value={data.year} />
                <ViewField label="AC/MP No_" value={data.acMpNo} />

                {/* Location Info */}
                <ViewField label="Block" value={data.block} />
                <ViewField label="Sector" value={data.sector} />

                {/* Combined or Separate Micro Sector Info */}
                <ViewField
                  label="Micro Sector"
                  value={`${data.microSectorNo} - ${data.microSectorName}`}
                />

                {/* Booth Info */}
                <ViewField label="Booth Name" value={data.boothName} />
                <ViewField label="Booth No" value={data.boothNo} />

                {/* Village Details */}
                <ViewField label="Gram Panchayat" value={data.gramPanchayat} />
                <ViewField label="Village" value={data.village} />
                <ViewField label="Faliya" value={data.faliya} />

                {/* File */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Attached File
                  </h3>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-700">
                    {data.file ? data.file : "No file attached"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ViewField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </h3>
    <p className="text-lg font-semibold text-gray-800 break-words">
      {value || <span className="text-gray-400 italic">N/A</span>}
    </p>
  </div>
);

export default SamitiView;
