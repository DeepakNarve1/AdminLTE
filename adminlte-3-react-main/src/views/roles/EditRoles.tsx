import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

const EditRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  // Fetch all permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/permissions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPermissions(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
      }
    };
    fetchPermissions();
  }, []);

  // Fetch current role
  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/roles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const roleData = res.data.data;

        setRole({
          name: roleData.name || "",
          displayName: roleData.displayName || "",
          description: roleData.description || "",
          permissions:
            roleData.permissions?.map((p: IPermission) => p._id) || [],
        });

        setSidebarAccess(roleData.sidebarAccess || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load role");
      }
    };

    fetchRole();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRole({ ...role, [e.target.name]: e.target.value });
  };

  const togglePermission = (permId: string) => {
    setRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const toggleSidebarAccess = (path: string) => {
    setSidebarAccess((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const updateRole = async () => {
    const newErrors: Record<string, string> = {};

    if (!role.name.trim()) newErrors.name = "Name is required";
    if (!role.displayName.trim())
      newErrors.displayName = "Display Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/roles/${id}`,
        { ...role, sidebarAccess },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Role updated successfully!");
      navigate("/roles");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ContentHeader title="Update Role" />
      <section className="content">
        <div className="container-fluid">
          <div className="card p-4">
            <h5 className="mb-3">Role Details</h5>

            <div className="row">
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

              <div className="col-md-12 mb-3">
                <label>Description</label>
                <textarea
                  name="description"
                  value={role.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="form-control"
                  rows={3}
                />
              </div>
            </div>

            <h5 className="mt-4">Select Permissions</h5>
            <div className="row">
              {permissions.map((p) => (
                <div className="col-md-4 mb-3" key={p._id}>
                  <label
                    htmlFor={`perm-${p._id}`}
                    className="d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      id={`perm-${p._id}`}
                      type="checkbox"
                      checked={role.permissions.includes(p._id)}
                      onChange={() => togglePermission(p._id)}
                      style={{ marginRight: "10px" }}
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
                    <th className="text-center" style={{ width: "120px" }}>
                      Access
                      <label
                        htmlFor="select-all-sidebar"
                        style={{ cursor: "pointer", marginLeft: "8px" }}
                      >
                        <input
                          id="select-all-sidebar"
                          type="checkbox"
                          checked={
                            menuItems.length > 0 &&
                            menuItems.every(
                              (i) => i.path && sidebarAccess.includes(i.path)
                            )
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSidebarAccess(
                                menuItems
                                  .map((i) => i.path)
                                  .filter((p): p is string => !!p)
                              );
                            } else {
                              setSidebarAccess([]);
                            }
                          }}
                        />
                      </label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.path}>
                      <td>
                        <label
                          htmlFor={`sidebar-${item.path}`}
                          style={{
                            cursor: "pointer",
                            display: "block",
                            padding: "8px 0",
                          }}
                        >
                          {item.name}
                        </label>
                      </td>
                      <td className="text-center">
                        <input
                          id={`sidebar-${item.path}`}
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

            <div className="d-flex mt-4" style={{ gap: "12px" }}>
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={updateRole}
              >
                {loading ? "Saving..." : "Update Role"}
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
                  setErrors({});
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

export default EditRole;
