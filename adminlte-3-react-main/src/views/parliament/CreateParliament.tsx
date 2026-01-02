import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import ParliamentForm from "./ParliamentForm";

const CreateParliament = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    division: string;
    assemblies: string[];
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/parliaments", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Parliament created successfully");
      router.push("/parliaments");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create parliament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Parliament" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Parliament Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a division and enter the name for the new parliament.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <ParliamentForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateParliament;
