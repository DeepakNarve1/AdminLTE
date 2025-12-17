import { useState, useEffect } from "react";
import { ContentHeader } from "@components";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

interface UserForm {
  name: string;
  email: string;
  mobile: string;
  role: string;
  userType: string;
  block: string;
}

interface IRoleOption {
  _id: string;
  role?: string;
  displayName?: string;
  name?: string;
}

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    mobile: "",
    role: "",
    userType: "",
    block: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<IRoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Fetch roles and user data on mount
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

    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/auth/users/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data?.data) {
          const user = res.data.data;
          setForm({
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            role: typeof user.role === "object" && user.role ? (user.role as any).name || (user.role as any).role || "" : user.role || "",
            userType: user.userType || "",
            block: user.block || "",
          });
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load user");
        setTimeout(() => navigate("/users"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
    if (id) {
      fetchUser();
    }
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateUser = async () => {
    // Inline validation with field highlighting
    const newErrors: Record<string, string> = {};
    const required = ["name", "email", "role", "block"];
    required.forEach((f) => {
      // @ts-ignore
      if (!form[f]) newErrors[f] = "This field is required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        mobile: form.mobile || "",
        userType: form.userType || "",
        block: form.block || "",
      };

      await axios.put(`http://localhost:5000/api/auth/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User updated successfully!");
      navigate("/users");
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update user";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ContentHeader title="Edit User" />

      <section className="content">
        <div className="container-fluid">
          <div className="card p-4" style={{ maxWidth: "900px" }}>
            <h5 className="mb-3">Edit User Details</h5>

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
                  disabled
                />
                <small className="text-muted">Email cannot be changed</small>
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
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="D">Block D</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex mt-4">
              <button
                className="btn btn-primary mr-2"
                onClick={updateUser}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update User"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/users")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditUser;
