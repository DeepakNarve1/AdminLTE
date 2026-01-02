import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import BlockForm from "./BlockForm";

const EditBlock = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    assembly: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchBlock();
  }, [id]);

  const fetchBlock = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/blocks/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const block = data.data;
      setInitialValues({
        name: block.name,
        assembly: block.assembly?._id || block.assembly,
      });
    } catch (err: any) {
      toast.error("Failed to fetch block details");
      router.push("/blocks");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    assembly: string;
    booths: string[];
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/blocks/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Block updated successfully");
      router.push("/blocks");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update block");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ContentHeader title="Edit Block" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Block
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <BlockForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditBlock;
