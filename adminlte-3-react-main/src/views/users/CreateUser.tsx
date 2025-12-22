import { ContentHeader } from "@components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { IRoleOption, UserForm } from "@app/types/user";

import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Label } from "@app/components/ui/label";

const CreateUser = () => {
  const router = useRouter();

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    role: "",
    userType: "",
    block: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<IRoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const res = await axios.get("http://localhost:5000/api/rbac/roles", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRoles(res.data?.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load roles");
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createUser = async () => {
    const newErrors: Record<string, string> = {};
    const required = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "role",
      "block",
    ];
    required.forEach((field) => {
      if (!form[field as keyof UserForm]) {
        newErrors[field] = "This field is required";
      }
    });

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        mobile: form.mobile || "",
        userType: form.userType || "",
        block: form.block || "",
      };

      await axios.post("http://localhost:5000/api/auth/register", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("User created successfully!");
      router.push("/users");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to create user";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      role: "",
      userType: "",
      block: "",
    });
    setErrors({});
  };

  return (
    <>
      <ContentHeader title="Create User" />

      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Enter User Details
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the information below to create a new user account.
              </p>
            </div>

            <div className="p-8">
              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {Object.values(errors).map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("name", e.target.value)
                    }
                    placeholder="Enter full name"
                    className={
                      errors.name
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("email", e.target.value)
                    }
                    placeholder="Enter email address"
                    className={
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("password", e.target.value)
                    }
                    placeholder="Enter password"
                    className={
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter password"
                    className={
                      errors.confirmPassword
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={form.mobile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("mobile", e.target.value)
                    }
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value: string) =>
                      handleChange("role", value)
                    }
                    disabled={rolesLoading}
                  >
                    <SelectTrigger
                      id="role"
                      className={errors.role ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={
                          rolesLoading ? "Loading roles..." : "Select a role"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r._id} value={r._id}>
                          {r.displayName || r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* User Type */}
                <div className="space-y-2">
                  <Label htmlFor="userType">User Type</Label>
                  <Select
                    value={form.userType}
                    onValueChange={(value: string) =>
                      handleChange("userType", value)
                    }
                  >
                    <SelectTrigger id="userType">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regularUser">Regular User</SelectItem>
                      <SelectItem value="systemAdministrator">
                        System Administrator
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Block */}
                <div className="space-y-2">
                  <Label htmlFor="block">Block</Label>
                  <Select
                    value={form.block}
                    onValueChange={(value: string) =>
                      handleChange("block", value)
                    }
                  >
                    <SelectTrigger
                      id="block"
                      className={errors.block ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanda">Tanda</SelectItem>
                      <SelectItem value="gandhwani">Gandhwani</SelectItem>
                      <SelectItem value="bagh">Bagh</SelectItem>
                      <SelectItem value="tirla">Tirla</SelectItem>
                      <SelectItem value="bhopal">Bhopal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.block && (
                    <p className="text-sm text-red-600">{errors.block}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  onClick={createUser}
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Creating..." : "Create User"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Reset Form
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => router.push("/users")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateUser;
