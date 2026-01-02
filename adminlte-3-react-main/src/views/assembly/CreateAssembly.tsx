import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import AssemblyForm from "./AssemblyForm";

const CreateAssembly = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    parliament: string;
    blocks: string[];
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/assemblies", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Assembly created successfully");
      router.push("/assemblies");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create assembly");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Assembly" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Assembly Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a parliament and enter the name for the new assembly.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <AssemblyForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateAssembly;
