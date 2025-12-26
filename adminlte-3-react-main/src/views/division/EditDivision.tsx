"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import DivisionForm from "./DivisionForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditDivision = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<{
    name: string;
    state: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        const data = res.data?.data;
        if (data) {
          const stateId = data.state?._id || data.state || "";
          setInitialValues({
            name: data.name,
            state: stateId,
          });
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load division");
        router.push("/divisions");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDivision();
  }, [id, router]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/divisions/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Division updated successfully");
      router.push("/divisions");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update division");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ContentHeader title="Edit Division" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Update Division Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Modify the name for this division.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              {loading ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              ) : (
                initialValues && (
                  <DivisionForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    loading={saving}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditDivision;
