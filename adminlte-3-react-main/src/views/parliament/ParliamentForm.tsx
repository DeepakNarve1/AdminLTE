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

interface IParliamentFormValues {
  name: string;
  division: string;
}

interface ParliamentFormProps {
  initialValues?: IParliamentFormValues;
  onSubmit: (values: IParliamentFormValues & { assemblies: string[] }) => void;
  loading?: boolean;
}

const ParliamentForm = ({
  initialValues = { name: "", division: "" },
  onSubmit,
  loading = false,
}: ParliamentFormProps) => {
  const [divisionsList, setDivisionsList] = useState([]);
  const [newAssemblies, setNewAssemblies] = useState<string[]>([]);
  const [currentAssemblyInput, setCurrentAssemblyInput] = useState("");

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/divisions?limit=-1",
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
      name: Yup.string().required("Parliament name is required"),
      division: Yup.string().required("Division is required"),
    }),
    onSubmit: (values) => {
      onSubmit({ ...values, assemblies: newAssemblies });
    },
  });

  const addAssembly = () => {
    if (currentAssemblyInput.trim() !== "") {
      setNewAssemblies([...newAssemblies, currentAssemblyInput.trim()]);
      setCurrentAssemblyInput("");
    }
  };

  const removeAssembly = (index: number) => {
    const updated = [...newAssemblies];
    updated.splice(index, 1);
    setNewAssemblies(updated);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Division Select */}
            <div className="grid gap-2">
              <Label htmlFor="division">Division</Label>
              <Select
                value={formik.values.division}
                onValueChange={(value) =>
                  formik.setFieldValue("division", value)
                }
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
              <Label htmlFor="name">Parliament Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter parliament name"
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

            {/* Add Assemblies Section */}
            <div className="grid gap-2">
              <Label>Add Assemblies (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter assembly name"
                  value={currentAssemblyInput}
                  onChange={(e) => setCurrentAssemblyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAssembly();
                    }
                  }}
                />
                <Button type="button" onClick={addAssembly} variant="secondary">
                  Add
                </Button>
              </div>

              {newAssemblies.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newAssemblies.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{item}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeAssembly(idx)}
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
                "Save Parliament"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ParliamentForm;
