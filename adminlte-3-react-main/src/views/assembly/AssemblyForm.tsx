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

interface IAssemblyFormValues {
  name: string;
  parliament: string;
}

interface AssemblyFormProps {
  initialValues?: IAssemblyFormValues;
  onSubmit: (values: IAssemblyFormValues & { blocks: string[] }) => void;
  loading?: boolean;
}

const AssemblyForm = ({
  initialValues = { name: "", parliament: "" },
  onSubmit,
  loading = false,
}: AssemblyFormProps) => {
  const [parliamentsList, setParliamentsList] = useState([]);
  const [newBlocks, setNewBlocks] = useState<string[]>([]);
  const [currentBlockInput, setCurrentBlockInput] = useState("");

  useEffect(() => {
    fetchParliaments();
  }, []);

  const fetchParliaments = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/parliaments?limit=-1",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setParliamentsList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch parliaments", error);
    }
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Assembly name is required"),
      parliament: Yup.string().required("Parliament is required"),
    }),
    onSubmit: (values) => {
      onSubmit({ ...values, blocks: newBlocks });
    },
  });

  const addBlock = () => {
    if (currentBlockInput.trim() !== "") {
      setNewBlocks([...newBlocks, currentBlockInput.trim()]);
      setCurrentBlockInput("");
    }
  };

  const removeBlock = (index: number) => {
    const updated = [...newBlocks];
    updated.splice(index, 1);
    setNewBlocks(updated);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Parliament Select */}
            <div className="grid gap-2">
              <Label htmlFor="parliament">Parliament</Label>
              <Select
                value={formik.values.parliament}
                onValueChange={(value) =>
                  formik.setFieldValue("parliament", value)
                }
              >
                <SelectTrigger
                  className={
                    formik.touched.parliament && formik.errors.parliament
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select parliament" />
                </SelectTrigger>
                <SelectContent>
                  {parliamentsList.map((par: any) => (
                    <SelectItem key={par._id} value={par._id}>
                      {par.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.parliament && formik.errors.parliament && (
                <p className="text-sm text-red-500">
                  {formik.errors.parliament}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Assembly Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter assembly name"
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

            {/* Add Blocks Section */}
            <div className="grid gap-2">
              <Label>Add Blocks (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter block name"
                  value={currentBlockInput}
                  onChange={(e) => setCurrentBlockInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBlock();
                    }
                  }}
                />
                <Button type="button" onClick={addBlock} variant="secondary">
                  Add
                </Button>
              </div>

              {newBlocks.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newBlocks.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{item}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeBlock(idx)}
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
                "Save Assembly"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssemblyForm;
