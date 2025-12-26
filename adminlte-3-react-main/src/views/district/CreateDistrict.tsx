"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import DistrictForm from "./DistrictForm";

const CreateDistrict = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string; division: string }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/districts", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("District created successfully");
      router.push("/districts");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create district");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New District" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                District Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the name for the new district.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <DistrictForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateDistrict;
