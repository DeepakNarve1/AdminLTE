"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import GenericSamitiForm from "@app/views/vidhasabhaSamiti/forms/BlockSamitiForm";

export default function EditNirmanSamiti() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/nirman-samiti/${id}`,
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
    <GenericSamitiForm
      title="Nirman Samiti"
      apiEndpoint="nirman-samiti"
      initialData={data}
      isEdit
    />
  );
}
