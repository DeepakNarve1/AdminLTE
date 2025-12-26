"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";

const EditAssemblyIssue = () => {
  return (
    <RouteGuard requiredPermissions={["edit_assembly_issues"]}>
      <EditAssemblyIssueContent />
    </RouteGuard>
  );
};

const EditAssemblyIssueContent = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    uniqueId: "",
    year: "",
    acMpNo: "",
    block: "",
    sector: "",
    microSectorNo: "",
    microSectorName: "",
    boothName: "",
    boothNo: "",
    gramPanchayat: "",
    village: "",
    faliya: "",
    totalMembers: 0,
    file: "",
  });

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/assembly-issues/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data && data.data) {
          setFormData({
            uniqueId: data.data.uniqueId || "",
            year: data.data.year || "",
            acMpNo: data.data.acMpNo || "",
            block: data.data.block || "",
            sector: data.data.sector || "",
            microSectorNo: data.data.microSectorNo || "",
            microSectorName: data.data.microSectorName || "",
            boothName: data.data.boothName || "",
            boothNo: data.data.boothNo || "",
            gramPanchayat: data.data.gramPanchayat || "",
            village: data.data.village || "",
            faliya: data.data.faliya || "",
            totalMembers: data.data.totalMembers || 0,
            file: data.data.file || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch issue", error);
        toast.error("Failed to load assembly issue details");
        router.push("/assembly-issue");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchIssue();
    }
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/assembly-issues/${id}`,
        { ...formData, totalMembers: Number(formData.totalMembers) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Assembly Issue updated successfully!");
      router.push("/assembly-issue");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
      <ContentHeader title="Edit Assembly Issue" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Assembly Issue
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Unique ID */}
                <div className="space-y-2">
                  <Label>
                    Unique ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="uniqueId"
                    value={formData.uniqueId}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label>
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* AC/MP No */}
                <div className="space-y-2">
                  <Label>AC/MP No.</Label>
                  <Input
                    name="acMpNo"
                    value={formData.acMpNo}
                    onChange={handleChange}
                  />
                </div>

                {/* Block */}
                <div className="space-y-2">
                  <Label>
                    Block <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Sector */}
                <div className="space-y-2">
                  <Label>
                    Sector <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Micro Sector No */}
                <div className="space-y-2">
                  <Label>
                    Micro Sector No <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="microSectorNo"
                    value={formData.microSectorNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Micro Sector Name */}
                <div className="space-y-2">
                  <Label>
                    Micro Sector Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="microSectorName"
                    value={formData.microSectorName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Booth Name */}
                <div className="space-y-2">
                  <Label>
                    Booth Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="boothName"
                    value={formData.boothName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Booth No */}
                <div className="space-y-2">
                  <Label>
                    Booth No <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="boothNo"
                    value={formData.boothNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Gram Panchayat */}
                <div className="space-y-2">
                  <Label>
                    Gram Panchayat <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="gramPanchayat"
                    value={formData.gramPanchayat}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Village */}
                <div className="space-y-2">
                  <Label>
                    Village <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Faliya */}
                <div className="space-y-2">
                  <Label>
                    Faliya <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="faliya"
                    value={formData.faliya}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Total Members */}
                <div className="space-y-2">
                  <Label>Total Members</Label>
                  <Input
                    type="number"
                    name="totalMembers"
                    value={formData.totalMembers}
                    onChange={handleChange}
                  />
                </div>

                {/* File (Optional URL/Path) */}
                <div className="space-y-2">
                  <Label>File URL (Optional)</Label>
                  <Input
                    name="file"
                    value={formData.file}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Updating..." : "Update Issue"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/assembly-issue")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditAssemblyIssue;
