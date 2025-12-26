"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { Card, CardContent } from "@app/components/ui/card";
import { Loader2 } from "lucide-react";

interface IDistrictFormValues {
  name: string;
  division: string;
}

interface DistrictFormProps {
  initialValues?: IDistrictFormValues;
  onSubmit: (values: IDistrictFormValues) => void;
  loading?: boolean;
}

const DistrictForm = ({
  initialValues = { name: "", division: "" },
  onSubmit,
  loading = false,
}: DistrictFormProps) => {
  const [statesList, setStatesList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDivisions(selectedState);
    } else {
      setDivisionsList([]);
    }
  }, [selectedState]);

  // Pre-select state if initial division is present
  useEffect(() => {
    const init = async () => {
      if (initialValues.division && !selectedState) {
        // Need to find which state this division belongs to
        try {
          const token = localStorage.getItem("token");
          // If the division is just an ID
          const res = await axios.get(
            `http://localhost:5000/api/divisions/${initialValues.division}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const divData = res.data?.data;
          if (divData && divData.state) {
            const stId = divData.state._id || divData.state;
            setSelectedState(stId);
          }
        } catch (err) {
          console.error(
            "Failed to fetch division details for state pre-selection",
            err
          );
        }
      }
    };
    init();
  }, [initialValues.division]);

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

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("District name is required"),
      division: Yup.string().required("Division is required"),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* State Select */}
            <div className="grid gap-2">
              <Label>State</Label>
              <Select
                value={selectedState}
                onValueChange={(val) => {
                  setSelectedState(val);
                  formik.setFieldValue("division", ""); // Reset division when state changes
                }}
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

            {/* Division Select */}
            <div className="grid gap-2">
              <Label htmlFor="division">Division</Label>
              <Select
                value={formik.values.division}
                onValueChange={(value) =>
                  formik.setFieldValue("division", value)
                }
                disabled={!selectedState}
              >
                <SelectTrigger
                  className={
                    formik.touched.division && formik.errors.division
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                >
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
              {formik.touched.division && formik.errors.division && (
                <p className="text-sm text-red-500">{formik.errors.division}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">District Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter district name (e.g. Indore)"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.name && formik.errors.name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00563B] hover:bg-[#368F8B] min-w-[120px]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save District"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DistrictForm;
