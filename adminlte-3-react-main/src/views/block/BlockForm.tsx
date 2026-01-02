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

interface IBlockFormValues {
  name: string;
  assembly: string;
}

interface BlockFormProps {
  initialValues?: IBlockFormValues;
  onSubmit: (values: IBlockFormValues & { booths: string[] }) => void;
  loading?: boolean;
}

const BlockForm = ({
  initialValues = { name: "", assembly: "" },
  onSubmit,
  loading = false,
}: BlockFormProps) => {
  const [assembliesList, setAssembliesList] = useState([]);
  const [newBooths, setNewBooths] = useState<string[]>([]);
  const [currentBoothInput, setCurrentBoothInput] = useState("");

  useEffect(() => {
    fetchAssemblies();
  }, []);

  const fetchAssemblies = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/assemblies?limit=-1",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssembliesList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch assemblies", error);
    }
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Block name is required"),
      assembly: Yup.string().required("Assembly is required"),
    }),
    onSubmit: (values) => {
      onSubmit({ ...values, booths: newBooths });
    },
  });

  const addBooth = () => {
    if (currentBoothInput.trim() !== "") {
      setNewBooths([...newBooths, currentBoothInput.trim()]);
      setCurrentBoothInput("");
    }
  };

  const removeBooth = (index: number) => {
    const updated = [...newBooths];
    updated.splice(index, 1);
    setNewBooths(updated);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Assembly Select */}
            <div className="grid gap-2">
              <Label htmlFor="assembly">Assembly</Label>
              <Select
                value={formik.values.assembly}
                onValueChange={(value) =>
                  formik.setFieldValue("assembly", value)
                }
              >
                <SelectTrigger
                  className={
                    formik.touched.assembly && formik.errors.assembly
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select assembly" />
                </SelectTrigger>
                <SelectContent>
                  {assembliesList.map((asm: any) => (
                    <SelectItem key={asm._id} value={asm._id}>
                      {asm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.assembly && formik.errors.assembly && (
                <p className="text-sm text-red-500">{formik.errors.assembly}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Block Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter block name"
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

            {/* Add Booths Section */}
            <div className="grid gap-2">
              <Label>Add Booths (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter booth name/number"
                  value={currentBoothInput}
                  onChange={(e) => setCurrentBoothInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBooth();
                    }
                  }}
                />
                <Button type="button" onClick={addBooth} variant="secondary">
                  Add
                </Button>
              </div>

              {newBooths.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newBooths.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{item}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeBooth(idx)}
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
                "Save Block"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlockForm;
