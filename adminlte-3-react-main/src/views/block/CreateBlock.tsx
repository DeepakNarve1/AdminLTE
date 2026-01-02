import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import BlockForm from "./BlockForm";

const CreateBlock = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    assembly: string;
    booths: string[];
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/blocks", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Block created successfully");
      router.push("/blocks");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create block");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Block" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Block Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select an assembly and enter the name for the new block.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <BlockForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateBlock;
