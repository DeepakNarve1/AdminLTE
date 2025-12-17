import { useState, useEffect } from "react";
import { ContentHeader } from "@components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { flattenMenu } from "@app/utils/sidebarMenu";

interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

const CreateRole = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[],
  });

  const [sidebarAccess, setSidebarAccess] = useState<string[]>([]);
  const menuItems = flattenMenu();
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch all permissions from backend
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/permissions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPermissions(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPermissions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRole({ ...role, [e.target.name]: e.target.value });
  };

  const togglePermission = (id: string) => {
    setRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  };

  const toggleSidebarAccess = (path: string) => {
    setSidebarAccess((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const createRole = async () => {
    const newErrors: Record<string, string> = {};

    if (!role.name) newErrors.name = "Name is required";
    if (!role.displayName) newErrors.displayName = "Display Name is required";

    if (Object.keys(newErrors).length > 0) {
      toast.error("Fix the errors");
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/roles",
        {
          ...role,
          sidebarAccess,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Role created successfully!");
      navigate("/roles");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ContentHeader title="Create Role" />
      <section className="content">
        <div className="container-fluid">
          <div className="card p-4">
            <h5 className="mb-3">Role Details</h5>

            <div className="row">
              {/* Name */}
              <div className="col-md-6 mb-3">
                <label>Role Name (system name)</label>
                <input
                  name="name"
                  value={role.name}
                  onChange={handleChange}
                  placeholder="e.g. superadmin, hr, manager"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                />
              </div>

              {/* Display Name */}
              <div className="col-md-6 mb-3">
                <label>Display Name</label>
                <input
                  name="displayName"
                  value={role.displayName}
                  onChange={handleChange}
                  placeholder="e.g. Super Admin, HR Manager"
                  className={`form-control ${errors.displayName ? "is-invalid" : ""}`}
                />
              </div>

              {/* Description */}
              <div className="col-md-12 mb-3">
                <label>Description</label>
                <textarea
                  name="description"
                  value={role.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="form-control"
                />
              </div>
            </div>

            <h5 className="mt-4">Select Permissions</h5>
            <div className="row">
              {permissions.map((p) => (
                <div className="col-md-4" key={p._id}>
                  <label className="d-flex align-items-center">
                    <input
                      type="checkbox"
                      checked={role.permissions.includes(p._id)}
                      onChange={() => togglePermission(p._id)}
                      style={{ marginRight: "8px" }}
                    />
                    {p.displayName}
                  </label>
                </div>
              ))}
            </div>

            <h5 className="mt-5">Sidebar Access</h5>
            <p className="text-muted">
              Select which sidebar menu items this role can see
            </p>

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Menu Name</th>
                    <th>Path</th>
                    <th className="text-center" style={{ width: "120px" }}>
                      Total
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={menuItems.length > 0 && menuItems.every((i) => i.path && sidebarAccess.includes(i.path))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSidebarAccess(menuItems.map((i) => i.path).filter((p) => p) as string[]);
                          } else {
                            setSidebarAccess([]);
                          }
                        }}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.path}>
                      <td>{item.name}</td>
                      <td>{item.path}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={sidebarAccess.includes(item.path)}
                          onChange={() => toggleSidebarAccess(item.path)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex mt-4">
              <button
                className="btn btn-primary mr-2"
                disabled={loading}
                onClick={createRole}
              >
                {loading ? "Saving..." : "Create Role"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRole({
                    name: "",
                    displayName: "",
                    description: "",
                    permissions: [],
                  });
                  setSidebarAccess([]);
                }}
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

export default CreateRole;
