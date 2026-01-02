import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import BoothForm from "./BoothForm";

const EditBooth = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    code: "",
    block: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchBooth();
  }, [id]);

  const fetchBooth = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/booths/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const booth = data.data;
      setInitialValues({
        name: booth.name,
        code: booth.code || "",
        block: booth.block?._id || booth.block,
      });
    } catch (err: any) {
      toast.error("Failed to fetch booth details");
      router.push("/booths");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    code: string;
    block: string;
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/booths/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Booth updated successfully");
      router.push("/booths");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update booth");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ContentHeader title="Edit Booth" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Booth
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <BoothForm
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

export default EditBooth;
