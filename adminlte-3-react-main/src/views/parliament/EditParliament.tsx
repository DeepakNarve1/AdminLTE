import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import ParliamentForm from "./ParliamentForm";

const EditParliament = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    division: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchParliament();
  }, [id]);

  const fetchParliament = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/parliaments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Flatten or adjust if necessary. Backend returns { ..., division: { _id, name } } or just id if not populated?
      // Controller says .populate("division", "name").
      // So data.data.division is an object. Form expects ID string.
      const parliament = data.data;
      setInitialValues({
        name: parliament.name,
        division: parliament.division?._id || parliament.division,
      });
    } catch (err: any) {
      toast.error("Failed to fetch parliament details");
      router.push("/parliaments");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    division: string;
    assemblies: string[];
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/parliaments/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Parliament updated successfully");
      router.push("/parliaments");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update parliament");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <div>Loading...</div>; // Or better skeleton
  }

  return (
    <>
      <ContentHeader title="Edit Parliament" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Parliament
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <ParliamentForm
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

export default EditParliament;
