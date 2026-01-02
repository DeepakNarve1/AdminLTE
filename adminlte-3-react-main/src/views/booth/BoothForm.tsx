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

interface IBoothFormValues {
  name: string;
  code: string;
  block: string;
}

interface BoothFormProps {
  initialValues?: IBoothFormValues;
  onSubmit: (values: IBoothFormValues) => void;
  loading?: boolean;
}

const BoothForm = ({
  initialValues = { name: "", code: "", block: "" },
  onSubmit,
  loading = false,
}: BoothFormProps) => {
  const [blocksList, setBlocksList] = useState([]);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/blocks?limit=-1",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlocksList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch blocks", error);
    }
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Booth name is required"),
      code: Yup.string().optional(),
      block: Yup.string().required("Block is required"),
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
            {/* Block Select */}
            <div className="grid gap-2">
              <Label htmlFor="block">Block</Label>
              <Select
                value={formik.values.block}
                onValueChange={(value) => formik.setFieldValue("block", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.block && formik.errors.block
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  {blocksList.map((blk: any) => (
                    <SelectItem key={blk._id} value={blk._id}>
                      {blk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.block && formik.errors.block && (
                <p className="text-sm text-red-500">{formik.errors.block}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Booth Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter booth name"
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

            <div className="grid gap-2">
              <Label htmlFor="code">Booth Code (Optional)</Label>
              <Input
                id="code"
                name="code"
                placeholder="Enter booth code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
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
                "Save Booth"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BoothForm;
