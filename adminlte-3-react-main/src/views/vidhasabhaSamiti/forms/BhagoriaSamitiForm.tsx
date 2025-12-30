"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea"; // Ensure this exists or use native
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

interface BhagoriaSamitiFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const BhagoriaSamitiForm = ({
  initialData,
  isEdit = false,
}: BhagoriaSamitiFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uniqueId: "", // Maps to Serial No
    block: "",
    date: "",
    day: "",
    bhagoriaHat: "",
    numberOfDol: "",
    inChargeName: "",
    mobileNumber: "",
    remark: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        uniqueId: initialData.uniqueId || "",
        block: initialData.block || "",
        date: initialData.date || "",
        day: initialData.day || "",
        bhagoriaHat: initialData.bhagoriaHat || "",
        numberOfDol: initialData.numberOfDol || "",
        inChargeName: initialData.inChargeName || "",
        mobileNumber: initialData.mobileNumber || "",
        remark: initialData.remark || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/bhagoria-samiti${
        isEdit && initialData?._id ? `/${initialData._id}` : ""
      }`;
      const method = isEdit ? "put" : "post";

      await axios[method](
        url,
        { ...formData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `Bhagoria Samiti record ${isEdit ? "updated" : "created"} successfully`
      );
      router.push("/vidhasabha-samiti/bhagoria-samiti");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} record`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader
        title={`${isEdit ? "Edit" : "Enter"} Bhagoria Karyakram Samiti Details`}
      />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="uniqueId">Serial No (क्र. )</Label>
                  <Input
                    id="uniqueId"
                    name="uniqueId"
                    value={formData.uniqueId}
                    onChange={handleChange}
                    placeholder="Enter Serial No"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block">Block (ब्लॉक)</Label>
                  <Select
                    value={formData.block}
                    onValueChange={(val) => handleSelectChange("block", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Barwani">Barwani</SelectItem>
                      <SelectItem value="Pati">Pati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date (दिनांक)</Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Day (वार)</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(val) => handleSelectChange("day", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday (सोमवार)</SelectItem>
                      <SelectItem value="Tuesday">Tuesday (मंगलवार)</SelectItem>
                      <SelectItem value="Wednesday">
                        Wednesday (बुधवार)
                      </SelectItem>
                      <SelectItem value="Thursday">
                        Thursday (गुरुवार)
                      </SelectItem>
                      <SelectItem value="Friday">Friday (शुक्रवार)</SelectItem>
                      <SelectItem value="Saturday">
                        Saturday (शनिवार)
                      </SelectItem>
                      <SelectItem value="Sunday">Sunday (रविवार)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bhagoriaHat">
                    Bhagoria Hat (भगोरिया हाट)
                  </Label>
                  <Input
                    id="bhagoriaHat"
                    name="bhagoriaHat"
                    value={formData.bhagoriaHat}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfDol">
                    Number of Dol (डोल की संख्या)
                  </Label>
                  <Input
                    id="numberOfDol"
                    name="numberOfDol"
                    value={formData.numberOfDol}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inChargeName">
                    In-charge Name (प्रभारी का नाम)
                  </Label>
                  <Input
                    id="inChargeName"
                    name="inChargeName"
                    value={formData.inChargeName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    Mobile Number (मोबाइल नम्बर)
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remark">Remark (रिमार्क)</Label>
                  <textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    // @ts-ignore
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#368F8B] hover:bg-[#2e7a77]"
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
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

export default BhagoriaSamitiForm;
