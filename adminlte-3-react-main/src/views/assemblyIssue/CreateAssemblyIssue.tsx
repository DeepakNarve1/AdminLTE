"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const CreateAssemblyIssue = () => {
  return (
    <RouteGuard requiredPermissions={["create_assembly_issues"]}>
      <CreateAssemblyIssueContent />
    </RouteGuard>
  );
};

const CreateAssemblyIssueContent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    uniqueId: "",
    year: new Date().getFullYear().toString(),
    acMpNo: "N/A",
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
      const payload = {
        ...formData,
        totalMembers: Number(formData.totalMembers),
      };

      await axios.post("http://localhost:5000/api/assembly-issues", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Assembly Issue created successfully!");
      router.push("/assembly-issue");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create Assembly Issue" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                New Assembly Issue
              </h2>
              <p className="text-gray-600 mt-1">
                Add a new Ganesh Samiti Location entry.
              </p>
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
                    placeholder="e.g. GS/177"
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
                    placeholder="e.g. 2025"
                  />
                </div>

                {/* AC/MP No */}
                <div className="space-y-2">
                  <Label>AC/MP No.</Label>
                  <Input
                    name="acMpNo"
                    value={formData.acMpNo}
                    onChange={handleChange}
                    placeholder="e.g. N/A"
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
                    placeholder="Block Name"
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
                    placeholder="Sector Name"
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
                    placeholder="e.g. GGR 10"
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
                    placeholder="Micro Sector Name"
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
                    placeholder="Booth Name"
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
                    placeholder="Booth Number"
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
                    placeholder="Gram Panchayat"
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
                    placeholder="Village Name"
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
                    placeholder="Faliya Name"
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
                    placeholder="0"
                  />
                </div>

                {/* File (Optional URL/Path) */}
                <div className="space-y-2">
                  <Label>File URL (Optional)</Label>
                  <Input
                    name="file"
                    value={formData.file}
                    onChange={handleChange}
                    placeholder="File path or URL"
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
                  {loading ? "Submitting..." : "Submit Issue"}
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

export default CreateAssemblyIssue;
