"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const EditEntry = () => {
  return (
    <RouteGuard
      requiredPermissions={["manage_roles", "edit_mp_public_problems"]}
    >
      <EditEntryContent />
    </RouteGuard>
  );
};

const EditEntryContent = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statesList, setStatesList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

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
    status: "Pending",
  });

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

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/public-problems/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data?.data;
        if (data) {
          setFormData({
            srNo: data.srNo || "",
            reglNo: data.regNo || "",
            timer: data.timer || "",
            year: data.year || "",
            month: data.month || "",
            date: data.day || data.dateString?.split("-")[2] || "",
            district: data.district || "",
            assembly: data.assembly || "",
            block: data.block || "",
            recommendedLetterNo: data.recommendedLetterNo || "",
            boothNo: data.boothNo || "",
            status: data.status || "Pending",
          });

          // Fetch division for this district
          if (data.district) {
            const districtRes = await axios.get(
              `http://localhost:5000/api/districts?search=${data.district}&limit=1`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const foundDistrict = districtRes.data?.data[0];

            if (foundDistrict && foundDistrict.division) {
              const divObj = foundDistrict.division;
              const divId = divObj._id || divObj;

              // Pre-select state if available
              if (divObj._id && divObj.state) {
                const stateId = divObj.state._id || divObj.state;
                setSelectedState(stateId);
                setSelectedDivision(divId);
              } else if (divObj._id) {
                // Fetch full division if state is missing
                const divRes = await axios.get(
                  `http://localhost:5000/api/divisions/${divId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const fullDiv = divRes.data?.data;
                if (fullDiv && fullDiv.state) {
                  const stateId = fullDiv.state._id || fullDiv.state;
                  setSelectedState(stateId);
                  setSelectedDivision(divId);
                }
              }
            }
          }
        }
      } catch (error: any) {
        toast.error("Failed to fetch entry details");
        router.push("/mp-public-problem");
      } finally {
        setFetching(false);
      }
    };

    fetchEntry();
  }, [id, router]);

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
        status: formData.status,
        dateString: `${formData.year}-${formData.month}-${formData.date}`,
      };

      await axios.put(
        `http://localhost:5000/api/public-problems/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Entry updated successfully!");
      router.push("/mp-public-problem");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update entry");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <ContentHeader title="Edit Public Problem Entry" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 p-8">
              <p className="text-center text-gray-600">
                Loading entry details...
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Public Problem Entry" />

      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-5xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Update Entry Details
              </h2>
              <p className="text-gray-600 mt-1">
                Modify the public problem entry below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sr. No. */}
                <div className="space-y-2">
                  <Label>Sr. No.</Label>
                  <Input
                    name="srNo"
                    value={formData.srNo}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                  />
                </div>

                {/* Regl. No. */}
                <div className="space-y-2">
                  <Label>Regl. No.</Label>
                  <Input
                    name="reglNo"
                    value={formData.reglNo}
                    onChange={handleChange}
                    placeholder="Enter registration number"
                  />
                </div>

                {/* Timer */}
                <div className="space-y-2">
                  <Label>Timer</Label>
                  <Input
                    name="timer"
                    value={formData.timer}
                    onChange={handleChange}
                    placeholder="e.g. 10d, 5h, 30m"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    name="year"
                    min="2000"
                    max="2030"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2025"
                  />
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <Label>Month</Label>
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
                  <Label>Date (Day)</Label>
                  <Input
                    type="number"
                    name="date"
                    min="1"
                    max="31"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="1-31"
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
                  <Label>District</Label>
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
                  <Label>Assembly</Label>
                  <Input
                    name="assembly"
                    value={formData.assembly}
                    onChange={handleChange}
                    placeholder="Enter assembly"
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
                  <Label>Booth No</Label>
                  <Input
                    name="boothNo"
                    value={formData.boothNo}
                    onChange={handleChange}
                    placeholder="Enter booth number"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: string) =>
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
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {loading ? "Updating..." : "Update Entry"}
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

export default EditEntry;
