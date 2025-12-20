import { useEffect, useState } from "react";
import { ContentHeader } from "@components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// (no redux selector needed here)
import { toast } from "react-toastify";
import { IRoleOption, UserForm } from "@app/types/user";

const CreateUser = () => {
  const navigate = useNavigate();

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
        const res = await axios.get("http://localhost:5000/api/roles", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRoles(res.data?.data || []);
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load roles");
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createUser = async () => {
    // Inline validation with field highlighting
    const newErrors: Record<string, string> = {};
    const required = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "role",
      "block",
    ];
    required.forEach((f) => {
      // @ts-ignore
      if (!form[f]) newErrors[f] = "This field is required";
    });

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors["confirmPassword"] = "Passwords do not match";
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

      // Use backend auth register endpoint (no axiosInstance)
      await axios.post("http://localhost:5000/api/auth/register", payload);

      toast.success("User Created Successfully!");
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
      navigate("/users");
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create user";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ContentHeader title="User Management" />

      <section className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <h5 className="font-semibold text-lg text-gray-800">
                Enter User Details
              </h5>
            </div>

            <div className="p-6">
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following:
                      </h3>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        {Object.keys(errors).map((k) => (
                          <li key={k}>{errors[k]}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.mobile
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.role
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    disabled={rolesLoading}
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option
                        key={r._id}
                        value={r.role || r.displayName || r.name || r._id}
                      >
                        {r.displayName || r.name || r.role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-xs text-red-500 mt-1">{errors.role}</p>
                  )}
                </div>

                {/* User Type */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    User Type
                  </label>
                  <select
                    name="userType"
                    value={form.userType}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.userType
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                  >
                    <option value="">Select User Type</option>
                    <option value="regularUser">Regular User</option>
                    <option value="systemAdministrator">
                      System Administrator
                    </option>
                  </select>
                  {errors.userType && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.userType}
                    </p>
                  )}
                </div>

                {/* Select Block */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Select Block
                  </label>
                  <select
                    name="block"
                    value={form.block}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                      errors.block
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                  >
                    <option value="">Select Block</option>
                    <option value="tanda">Tanda</option>
                    <option value="gandhwani">Gandhwani</option>
                    <option value="bagh">Bagh</option>
                    <option value="tirla">Tirla</option>
                    <option value="bhopal">Bhopal</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.block && (
                    <p className="text-xs text-red-500 mt-1">{errors.block}</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={createUser}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>{" "}
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
                <button
                  className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={() =>
                    setForm({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      mobile: "",
                      role: "",
                      userType: "",
                      block: "",
                    })
                  }
                  disabled={loading}
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateUser;
