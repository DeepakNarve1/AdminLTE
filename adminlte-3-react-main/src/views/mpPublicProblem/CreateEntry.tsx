"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

import { Input } from "@app/components/ui/input";
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
import { RouteGuard } from "@app/components/RouteGuard";

const MPPublicProblem = () => {
  return (
    <RouteGuard
      requiredPermissions={["manage_roles", "create_mp_public_problems"]}
    >
      <MPPublicProblemContent />
    </RouteGuard>
  );
};

const MPPublicProblemContent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDivisions(selectedState);
    } else {
      setDivisionsList([]);
      setDistrictsList([]);
      setSelectedDivision("");
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDivision) {
      fetchDistricts(selectedDivision);
    } else {
      setDistrictsList([]);
    }
  }, [selectedDivision]);

  const fetchStates = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/states", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatesList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch states", error);
    }
  };

  const fetchDivisions = async (stateId: string) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/divisions?state=${stateId}&limit=-1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDivisionsList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch divisions", error);
    }
  };

  const fetchDistricts = async (divisionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/districts?division=${divisionId}&limit=-1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDistrictsList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch districts", error);
    }
  };

  const [formData, setFormData] = useState({
    srNo: "",
    reglNo: "",
    timer: "",
    year: "",
    month: "",
    date: "",
    district: "",
    assembly: "",
    block: "",
    recommendedLetterNo: "",
    boothNo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        srNo: formData.srNo,
        regNo: formData.reglNo,
        timer: formData.timer,
        year: formData.year,
        month: formData.month,
        day: formData.date,
        district: formData.district,
        assembly: formData.assembly,
        block: formData.block,
        recommendedLetterNo: formData.recommendedLetterNo,
        boothNo: formData.boothNo,
        dateString: formData.date
          ? `${formData.year}-${formData.month}-${formData.date}`
          : "",
      };

      await axios.post("http://localhost:5000/api/public-problems", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Entry created successfully!");
      router.push("/mp-public-problem");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create Public Problem Entry" />

      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-5xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Submit New Entry
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the details to add a new public problem entry.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sr. No. */}
                <div className="space-y-2">
                  <Label>
                    Sr. No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="srNo"
                    value={formData.srNo}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    required
                  />
                </div>

                {/* Regl. No. */}
                <div className="space-y-2">
                  <Label>
                    Regl. No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="reglNo"
                    value={formData.reglNo}
                    onChange={handleChange}
                    placeholder="Enter registration number"
                    required
                  />
                </div>

                {/* Timer */}
                <div className="space-y-2">
                  <Label>Timer</Label>
                  <Input
                    name="timer"
                    value={formData.timer}
                    onChange={handleChange}
                    placeholder="e.g. 10:30 AM"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label>
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="year"
                    min="2000"
                    max="2030"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2025"
                    required
                  />
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <Label>
                    Month <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.month}
                    onValueChange={(v: string) =>
                      handleChange({
                        target: { name: "month", value: v },
                      } as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>
                    Date (Day) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="date"
                    min="1"
                    max="31"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="1-31"
                    required
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label>
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedState}
                    onValueChange={(v) => setSelectedState(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesList.map((st: any) => (
                        <SelectItem key={st._id} value={st._id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Division */}
                <div className="space-y-2">
                  <Label>
                    Division <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedDivision}
                    onValueChange={(v) => setSelectedDivision(v)}
                    disabled={!selectedState}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisionsList.map((div: any) => (
                        <SelectItem key={div._id} value={div._id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label>
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(v) =>
                      handleChange({
                        target: { name: "district", value: v },
                      } as any)
                    }
                    disabled={!selectedDivision}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsList.map((dist: any) => (
                        <SelectItem key={dist._id} value={dist.name}>
                          {dist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assembly */}
                <div className="space-y-2">
                  <Label>
                    Assembly <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="assembly"
                    value={formData.assembly}
                    onChange={handleChange}
                    placeholder="Enter assembly"
                    required
                  />
                </div>

                {/* Block */}
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Input
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    placeholder="Enter block"
                  />
                </div>

                {/* Recommended Letter No */}
                <div className="space-y-2">
                  <Label>Recommended Letter No</Label>
                  <Input
                    name="recommendedLetterNo"
                    value={formData.recommendedLetterNo}
                    onChange={handleChange}
                    placeholder="Enter letter number"
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
                    placeholder="Enter booth number"
                    required
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
                  {loading ? "Submitting..." : "Submit Entry"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/mp-public-problem")}
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

export default MPPublicProblem;
