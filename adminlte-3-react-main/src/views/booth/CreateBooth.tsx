import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import BoothForm from "./BoothForm";

const CreateBooth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    code: string;
    block: string;
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/booths", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Booth created successfully");
      router.push("/booths");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create booth");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Booth" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Booth Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a block and enter the name/code for the new booth.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <BoothForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateBooth;
