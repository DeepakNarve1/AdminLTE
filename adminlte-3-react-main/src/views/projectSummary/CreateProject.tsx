"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { ContentHeader } from "@app/components";

const CreateProject = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    district: "",
    block: "",
    department: "",
    workName: "",
    projectCost: "",
    proposalEstimate: "",
    tsNoDate: "",
    asNoDate: "",
    status: "Pending",
    officerName: "",
    contactNumber: "",
    remarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
        projectCost: Number(formData.projectCost) || 0,
        proposalEstimate: Number(formData.proposalEstimate) || 0,
      };

      await axios.post("http://localhost:5000/api/projects", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Project created successfully!");
      router.push("/project-summary");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create Project" />

      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-5xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Project
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the details to add a new project.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* District */}
                <div className="space-y-2">
                  <Label>
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    required
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
                    placeholder="Enter block"
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label>
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) =>
                      handleChange({
                        target: { name: "department", value: v },
                      } as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PWD">PWD</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="PHE">PHE</SelectItem>
                      <SelectItem value="RES">RES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Name */}
                <div className="md:col-span-3 space-y-2">
                  <Label>
                    Work Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="workName"
                    value={formData.workName}
                    onChange={handleChange}
                    placeholder="Enter work name"
                    required
                  />
                </div>

                {/* Project Cost */}
                <div className="space-y-2">
                  <Label>
                    Project Cost (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="projectCost"
                    value={formData.projectCost}
                    onChange={handleChange}
                    placeholder="Enter cost"
                    required
                  />
                </div>

                {/* Proposal Estimate */}
                <div className="space-y-2">
                  <Label>
                    Proposal Estimate (₹){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="proposalEstimate"
                    value={formData.proposalEstimate}
                    onChange={handleChange}
                    placeholder="Enter estimate"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      handleChange({
                        target: { name: "status", value: v },
                      } as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* TS No/Date */}
                <div className="space-y-2">
                  <Label>TS No. / Date</Label>
                  <Input
                    name="tsNoDate"
                    value={formData.tsNoDate}
                    onChange={handleChange}
                    placeholder="e.g. TS-123 / 2025-01-01"
                  />
                </div>

                {/* AS No/Date */}
                <div className="space-y-2">
                  <Label>AS No. / Date</Label>
                  <Input
                    name="asNoDate"
                    value={formData.asNoDate}
                    onChange={handleChange}
                    placeholder="e.g. AS-456 / 2025-02-01"
                  />
                </div>

                {/* Officer Name */}
                <div className="space-y-2">
                  <Label>Officer Name</Label>
                  <Input
                    name="officerName"
                    value={formData.officerName}
                    onChange={handleChange}
                    placeholder="Enter officer name"
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                  />
                </div>

                {/* Remarks */}
                <div className="md:col-span-3 space-y-2">
                  <Label>Remarks</Label>
                  <Textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Enter any remarks"
                    rows={4}
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
                  {loading ? "Creating..." : "Create Project"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/project-summary")}
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

export default CreateProject;
