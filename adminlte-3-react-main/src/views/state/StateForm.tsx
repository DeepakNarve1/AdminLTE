"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Card, CardContent } from "@app/components/ui/card";
import { Loader2 } from "lucide-react";

interface IStateFormValues {
  name: string;
}

interface StateFormProps {
  initialValues?: IStateFormValues;
  onSubmit: (values: IStateFormValues) => void;
  loading?: boolean;
}

const StateForm = ({
  initialValues = { name: "" },
  onSubmit,
  loading = false,
}: StateFormProps) => {
  const [newDivisions, setNewDivisions] = useState<string[]>([]);
  const [currentDivInput, setCurrentDivInput] = useState("");

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("State name is required"),
    }),
    onSubmit: (values) => {
      // Pass new divisions alongside other values
      onSubmit({ ...values, divisions: newDivisions } as any);
    },
  });

  const addDivision = () => {
    if (currentDivInput.trim() !== "") {
      setNewDivisions([...newDivisions, currentDivInput.trim()]);
      setCurrentDivInput("");
    }
  };

  const removeDivision = (index: number) => {
    const updated = [...newDivisions];
    updated.splice(index, 1);
    setNewDivisions(updated);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">State Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter state name"
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

            {/* Add Divisions Section */}
            <div className="grid gap-2">
              <Label>Add Divisions (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter division name"
                  value={currentDivInput}
                  onChange={(e) => setCurrentDivInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDivision();
                    }
                  }}
                />
                <Button type="button" onClick={addDivision} variant="secondary">
                  Add
                </Button>
              </div>

              {newDivisions.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newDivisions.map((div, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{div}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeDivision(idx)}
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
                "Save State"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StateForm;
