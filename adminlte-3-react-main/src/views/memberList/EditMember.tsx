"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

const schema = Yup.object().shape({
  block: Yup.string().required("Block is required"),
  year: Yup.string().required("Year is required"),
  vehicle: Yup.string().required("Vehicle is required"),
  samiti: Yup.string().required("Samiti is required"),
  code: Yup.string().required("Code is required"),
  instagram: Yup.string(),
  twitter: Yup.string(),
  startLat: Yup.number(),
  startLong: Yup.number(),
  startDate: Yup.date(),
  endLat: Yup.number(),
  endLong: Yup.number(),
  endDate: Yup.date(),
  image: Yup.string().nullable(),
});

const SAMITI_TYPES = [
  "Ganesh Samiti",
  "Tenkar Samiti",
  "Dp Samiti",
  "Mandir Samiti",
  "Bhagoria Samiti",
  "Nirman Samiti",
  "Booth Samiti",
  "Block Samiti",
];

const EditMember = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [blocksList, setBlocksList] = useState<any[]>([]);

  const formik = useFormik({
    initialValues: {
      block: "",
      year: "",
      vehicle: "",
      samiti: "",
      code: "",
      instagram: "",
      twitter: "",
      startLat: 0,
      startLong: 0,
      startDate: "",
      endLat: 0,
      endLong: 0,
      endDate: "",
      image: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:5000/api/members/${id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Member updated successfully");
        router.push("/member-list");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update member");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch Blocks
        try {
          const blocksRes = await axios.get(
            "http://localhost:5000/api/blocks?limit=-1",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setBlocksList(blocksRes.data.data || []);
        } catch (err) {
          console.error("Failed to fetch blocks", err);
        }

        // Fetch Member
        if (!id) return;
        const { data } = await axios.get(
          `http://localhost:5000/api/members/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const member = data.data;

        // Format dates for input type="datetime-local" if they exist
        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          return new Date(dateString).toISOString().slice(0, 16);
        };

        formik.setValues({
          block: member.block,
          year: member.year,
          vehicle: member.vehicle,
          samiti: member.samiti,
          code: member.code,
          instagram: member.instagram || "",
          twitter: member.twitter || "",
          startLat: member.startLat || 0,
          startLong: member.startLong || 0,
          startDate: formatDate(member.startDate),
          endLat: member.endLat || 0,
          endLong: member.endLong || 0,
          endDate: formatDate(member.endDate),
          image: member.image || "",
        });
        if (member.image) {
          setFileName("Existing Image");
        }
      } catch (error) {
        toast.error("Failed to load member details");
        router.push("/member-list");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <RouteGuard requiredPermissions={["edit_members"]}>
      <ContentHeader title="Edit Member" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Required Fields */}
                <div className="space-y-2">
                  <Label>
                    Block <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("block", val)}
                    value={formik.values.block}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocksList.map((block: any) => (
                        <SelectItem key={block._id} value={block.name}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.block && formik.errors.block && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.block}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("year", val)}
                    value={formik.values.year}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.year && formik.errors.year && (
                    <p className="text-red-500 text-sm">{formik.errors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Vehicle <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      formik.setFieldValue("vehicle", val)
                    }
                    value={formik.values.vehicle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bike">Bike</SelectItem>
                      <SelectItem value="Car">Car</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.vehicle && formik.errors.vehicle && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.vehicle}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Samiti <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("samiti", val)}
                    value={formik.values.samiti}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Samiti" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMITI_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.samiti && formik.errors.samiti && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.samiti}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("code", val)}
                    value={formik.values.code}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C001">C001</SelectItem>
                      <SelectItem value="C002">C002</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.code && formik.errors.code && (
                    <p className="text-red-500 text-sm">{formik.errors.code}</p>
                  )}
                </div>

                {/* Optional Fields */}
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    name="instagram"
                    value={formik.values.instagram}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input
                    name="twitter"
                    value={formik.values.twitter}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image (Max 10MB)</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      {formik.values.image && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 shrink-0">
                          <img
                            src={formik.values.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Input
                        type="text"
                        value={fileName}
                        placeholder="No file chosen"
                        readOnly
                        className="flex-1"
                      />
                    </div>

                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("File size exceeds 10MB");
                            return;
                          }
                          setFileName(file.name);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            formik.setFieldValue("image", reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                  {formik.touched.image && formik.errors.image && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.image}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Lat</Label>
                  <Input
                    type="number"
                    name="startLat"
                    value={formik.values.startLat}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Long</Label>
                  <Input
                    type="number"
                    name="startLong"
                    value={formik.values.startLong}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    value={formik.values.endDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Lat</Label>
                  <Input
                    type="number"
                    name="endLat"
                    value={formik.values.endLat}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Long</Label>
                  <Input
                    type="number"
                    name="endLong"
                    value={formik.values.endLong}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Updating..." : "Update Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </RouteGuard>
  );
};

export default EditMember;
