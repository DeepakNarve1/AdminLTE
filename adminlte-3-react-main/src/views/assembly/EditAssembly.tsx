import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import AssemblyForm from "./AssemblyForm";

const EditAssembly = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    parliament: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchAssembly();
  }, [id]);

  const fetchAssembly = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/assemblies/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const assembly = data.data;
      setInitialValues({
        name: assembly.name,
        parliament: assembly.parliament?._id || assembly.parliament,
      });
    } catch (err: any) {
      toast.error("Failed to fetch assembly details");
      router.push("/assemblies");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    parliament: string;
    blocks: string[];
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/assemblies/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Assembly updated successfully");
      router.push("/assemblies");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update assembly");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ContentHeader title="Edit Assembly" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Assembly
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <AssemblyForm
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

export default EditAssembly;
