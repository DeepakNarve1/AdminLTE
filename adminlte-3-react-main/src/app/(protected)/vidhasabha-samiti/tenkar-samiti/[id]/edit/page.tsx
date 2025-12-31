"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditTenkarSamiti() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      // Fetch data
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/tenkar-samiti/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setData(res.data.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <RouteGuard requiredPermissions={["edit_tenkar_samiti"]}>
      <GenericSamitiForm
        title="Tenkar Samiti"
        apiEndpoint="tenkar-samiti"
        initialData={data}
        isEdit
      />
    </RouteGuard>
  );
}
