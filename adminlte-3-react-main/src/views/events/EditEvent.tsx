"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@app/components/ui/textarea";

const schema = Yup.object().shape({
  uniqueId: Yup.string().required("Unique ID is required"),
  district: Yup.string().required("District is required"),
  year: Yup.string().required("Year is required"),
  month: Yup.string().required("Month is required"),
  receivingDate: Yup.date().required("Receiving Date is required"),
  programDate: Yup.date().required("Program Date is required"),
  time: Yup.string().required("Time is required"),
  eventType: Yup.string().required("Event Type is required"),
  eventDetails: Yup.string().required("Event Details is required"),
});

const EditEvent = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({
    uniqueId: "",
    district: "",
    year: "",
    month: "",
    receivingDate: "",
    programDate: "",
    time: "",
    eventType: "",
    eventDetails: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/events/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const eventData = data.data;
        // Format dates for input fields
        if (eventData.receivingDate)
          eventData.receivingDate = eventData.receivingDate.split("T")[0];
        if (eventData.programDate)
          eventData.programDate = eventData.programDate.split("T")[0];

        setInitialValues(eventData);
      } catch (error) {
        toast.error("Failed to fetch event details");
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, router]);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:5000/api/events/${id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event updated successfully");
        router.push("/events");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update event");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (loading) return <div>Loading...</div>;

  return (
    <RouteGuard requiredPermissions={["edit_events"]}>
      <ContentHeader title="Edit Event" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Unique ID</Label>
                  <Input
                    name="uniqueId"
                    value={formik.values.uniqueId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. ET/1"
                  />
                  {formik.touched.uniqueId && formik.errors.uniqueId && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.uniqueId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  <Select
                    onValueChange={(val) =>
                      formik.setFieldValue("district", val)
                    }
                    value={formik.values.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indore">Indore</SelectItem>
                      <SelectItem value="Bhopal">Bhopal</SelectItem>
                      <SelectItem value="Jabalpur">Jabalpur</SelectItem>
                      <SelectItem value="Gwalior">Gwalior</SelectItem>
                      <SelectItem value="Ujjain">Ujjain</SelectItem>
                      <SelectItem value="Dewas">Dewas</SelectItem>
                      <SelectItem value="Satna">Satna</SelectItem>
                      <SelectItem value="Sagar">Sagar</SelectItem>
                      <SelectItem value="Ratlam">Ratlam</SelectItem>
                      <SelectItem value="Rewa">Rewa</SelectItem>
                      <SelectItem value="Burhanpur">Burhanpur</SelectItem>
                      <SelectItem value="Dhar">Dhar</SelectItem>
                      <SelectItem value="Katni">Katni</SelectItem>
                      <SelectItem value="Raisen">Raisen</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.district && formik.errors.district && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.district}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
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
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.year && formik.errors.year && (
                    <p className="text-red-500 text-sm">{formik.errors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("month", val)}
                    value={formik.values.month}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
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
                  {formik.touched.month && formik.errors.month && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.month}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Receiving Date</Label>
                  <Input
                    type="date"
                    name="receivingDate"
                    value={formik.values.receivingDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.receivingDate &&
                    formik.errors.receivingDate && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.receivingDate}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>Program Date</Label>
                  <Input
                    type="date"
                    name="programDate"
                    value={formik.values.programDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.programDate && formik.errors.programDate && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.programDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    name="time"
                    value={formik.values.time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.time && formik.errors.time && (
                    <p className="text-red-500 text-sm">{formik.errors.time}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    onValueChange={(val) =>
                      formik.setFieldValue("eventType", val)
                    }
                    value={formik.values.eventType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Social Events">
                        Social Events (विवाह/उत्सव)
                      </SelectItem>
                      <SelectItem value="Religious Events">
                        Religious Events (धर्मसभा/कथा)
                      </SelectItem>
                      <SelectItem value="Political Rally">
                        Political Rally
                      </SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Inauguration">Inauguration</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.eventType && formik.errors.eventType && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.eventType}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Details</Label>
                <Textarea
                  name="eventDetails"
                  placeholder="Enter event details here..."
                  className="h-24"
                  value={formik.values.eventDetails}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.eventDetails && formik.errors.eventDetails && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.eventDetails}
                  </p>
                )}
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
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {isSubmitting ? "Updateing..." : "Update Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </RouteGuard>
  );
};

export default EditEvent;
