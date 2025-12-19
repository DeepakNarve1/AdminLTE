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
    <div>
      <ContentHeader title="User Management" />

      <section className="content">
        <div className="container-fluid">
          <div className="card p-4" style={{ maxWidth: "900px" }}>
            <h5 className="mb-3">Enter User Details</h5>

            {Object.keys(errors).length > 0 && (
              <div className="alert alert-danger" role="alert">
                <strong>Please fix the following:</strong>
                <ul className="mb-0">
                  {Object.keys(errors).map((k) => (
                    <li key={k}>{errors[k]}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4×2 GRID */}
            <div className="row">
              {/* Full Name */}
              <div className="col-md-6 mb-3">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div className="col-md-6 mb-3">
                <label>Email Address</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Enter email"
                />
              </div>

              {/* Password */}
              <div className="col-md-6 mb-3">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Enter password"
                />
              </div>

              {/* Confirm Password */}
              <div className="col-md-6 mb-3">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Re-enter password"
                />
              </div>

              {/* Mobile Number */}
              <div className="col-md-6 mb-3">
                <label>Mobile Number</label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                  placeholder="Enter mobile number"
                />
              </div>

              {/* Role */}
              <div className="col-md-6 mb-3">
                <label>Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`form-control ${errors.role ? "is-invalid" : ""}`}
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
              </div>

              {/* User Type */}
              <div className="col-md-6 mb-3">
                <label>User Type</label>
                <select
                  name="userType"
                  value={form.userType}
                  onChange={handleChange}
                  className={`form-control ${errors.userType ? "is-invalid" : ""}`}
                >
                  <option value="">Select User Type</option>
                  <option value="regularUser">Regular User</option>
                  <option value="systemAdministrator">
                    System Administrator
                  </option>
                </select>
              </div>

              {/* Select Block */}
              <div className="col-md-6 mb-3">
                <label>Select Block</label>
                <select
                  name="block"
                  value={form.block}
                  onChange={handleChange}
                  className={`form-control ${errors.block ? "is-invalid" : ""}`}
                >
                  <option value="">Select Block</option>
                  <option value="tanda">Tanda</option>
                  <option value="gandhwani">Gandhwani</option>
                  <option value="bagh">Bagh</option>
                  <option value="tirla">Tirla</option>
                  <option value="bhopal">Bhopal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}

            <div className="d-flex mt-4">
              <button
                className="btn btn-primary mr-2"
                onClick={createUser}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create User"}
              </button>
              <button
                className="btn btn-secondary"
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
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateUser;
