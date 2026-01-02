import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Skeleton } from "@app/components/ui/skeleton";
import { ArrowLeft, Edit } from "lucide-react";

interface IBoothDetails {
  _id: string;
  name: string;
  code?: string;
  block: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ViewBooth = () => {
  const { id } = useParams();
  const router = useRouter();
  const [booth, setBooth] = useState<IBoothDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBoothDetails();
  }, [id]);

  const fetchBoothDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/booths/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooth(data.data);
    } catch (error) {
      toast.error("Failed to fetch booth details");
      router.push("/booths");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-4 py-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booth) return null;

  return (
    <>
      <ContentHeader title="Booth Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/booths")}
              className="group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  Basic Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/booths/${id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booth.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Code</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booth.code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Block</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booth.block?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewBooth;
