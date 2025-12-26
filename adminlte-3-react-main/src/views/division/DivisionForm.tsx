import { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Card, CardContent } from "@app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Loader2 } from "lucide-react";

interface IDivisionFormValues {
  name: string;
  state: string;
}

interface DivisionFormProps {
  initialValues?: IDivisionFormValues;
  onSubmit: (values: IDivisionFormValues) => void;
  loading?: boolean;
}

const DivisionForm = ({
  initialValues = { name: "", state: "" },
  onSubmit,
  loading = false,
}: DivisionFormProps) => {
  const [statesList, setStatesList] = useState([]);
  const [newDistricts, setNewDistricts] = useState<string[]>([]);
  const [currentDistInput, setCurrentDistInput] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

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

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Division name is required"),
      state: Yup.string().required("State is required"),
    }),
    onSubmit: (values) => {
      onSubmit({ ...values, districts: newDistricts } as any);
    },
  });

  const addDistrict = () => {
    if (currentDistInput.trim() !== "") {
      setNewDistricts([...newDistricts, currentDistInput.trim()]);
      setCurrentDistInput("");
    }
  };

  const removeDistrict = (index: number) => {
    const updated = [...newDistricts];
    updated.splice(index, 1);
    setNewDistricts(updated);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* State Select */}
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formik.values.state}
                onValueChange={(value) => formik.setFieldValue("state", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.state && formik.errors.state
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                >
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
              {formik.touched.state && formik.errors.state && (
                <p className="text-sm text-red-500">{formik.errors.state}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Division Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter division name"
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

            {/* Add Districts Section */}
            <div className="grid gap-2">
              <Label>Add Districts (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter district name"
                  value={currentDistInput}
                  onChange={(e) => setCurrentDistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDistrict();
                    }
                  }}
                />
                <Button type="button" onClick={addDistrict} variant="secondary">
                  Add
                </Button>
              </div>

              {newDistricts.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newDistricts.map((dist, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{dist}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeDistrict(idx)}
                        className="h-6 w-6 text-red-500 p-0 hover:bg-red-50"
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
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
                "Save Division"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DivisionForm;
