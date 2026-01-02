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

interface IParliamentDetails {
  _id: string;
  name: string;
  division: {
    _id: string;
    name: string;
  };
  assemblies: {
    _id: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const ViewParliament = () => {
  const { id } = useParams();
  const router = useRouter();
  const [parliament, setParliament] = useState<IParliamentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchParliamentDetails();
  }, [id]);

  const fetchParliamentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/parliaments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setParliament(data.data);
    } catch (error) {
      toast.error("Failed to fetch parliament details");
      router.push("/parliaments");
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

  if (!parliament) return null;

  return (
    <>
      <ContentHeader title="Parliament Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/parliaments")}
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
                  onClick={() => router.push(`/parliaments/${id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {parliament.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Division
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {parliament.division?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assemblies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Associated Assemblies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parliament.assemblies && parliament.assemblies.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {parliament.assemblies.map((assembly) => (
                      <div
                        key={assembly._id}
                        className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors"
                      >
                        <span className="font-medium text-gray-700">
                          {assembly.name}
                        </span>
                        {/* Could add link to view assembly details later */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No assemblies found for this parliament
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewParliament;
