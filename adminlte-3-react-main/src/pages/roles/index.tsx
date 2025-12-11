import { useState, useEffect } from "react";
import { ContentHeader } from "@components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

interface IRole {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: IPermission[];
  isSystem: boolean;
  createdAt: string;
}

const Roles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);

  const [form, setForm] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/rbac/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data?.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/rbac/permissions",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPermissions(res.data?.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to load permissions"
      );
    }
  };

  const handleEdit = (role: IRole) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions.map((p) => p._id),
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingRole(null);
    setForm({
      name: "",
      displayName: "",
      description: "",
      permissions: [],
    });
  };

  const handlePermissionChange = (permissionId: string) => {
    setForm({
      ...form,
      permissions: form.permissions.includes(permissionId)
        ? form.permissions.filter((p) => p !== permissionId)
        : [...form.permissions, permissionId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.displayName) {
      toast.error("Display name is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (editingRole) {
        // Update existing role
        await axios.put(
          `http://localhost:5000/api/rbac/roles/${editingRole._id}`,
          {
            displayName: form.displayName,
            description: form.description,
            permissions: form.permissions,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Role updated successfully!");
      } else {
        // Create new role
        await axios.post(
          "http://localhost:5000/api/rbac/roles",
          {
            name: form.name,
            displayName: form.displayName,
            description: form.description,
            permissions: form.permissions,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Role created successfully!");
      }

      fetchRoles();
      handleClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/rbac/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  const getPermissionsByCategory = (category: string) => {
    return permissions.filter((p) => p.category === category);
  };

  const categories = ["users", "reports", "settings", "dashboard", "other"];

  return (
    <div>
      <ContentHeader title="Role Management" />
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-md-12">
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-plus"></i> Create New Role
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-4">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="row">
              {roles.map((role) => (
                <div key={role._id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">{role.displayName}</h5>
                      {role.isSystem && (
                        <small className="badge badge-secondary">System</small>
                      )}
                    </div>
                    <div className="card-body">
                      <p className="text-muted">{role.description}</p>
                      <div className="mb-3">
                        <strong>Permissions ({role.permissions.length})</strong>
                        <div className="mt-2">
                          {role.permissions.length === 0 ? (
                            <small className="text-muted">No permissions</small>
                          ) : (
                            role.permissions.map((perm) => (
                              <span
                                key={perm._id}
                                className="badge badge-info mr-1 mb-1"
                              >
                                {perm.displayName}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(role)}
                        disabled={role.isSystem}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger ml-2"
                        onClick={() => handleDelete(role._id)}
                        disabled={role.isSystem}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          role="dialog"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRole ? "Edit Role" : "Create New Role"}
                </h5>
                <button type="button" className="close" onClick={handleClose}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      disabled={!!editingRole}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.displayName}
                      onChange={(e) =>
                        setForm({ ...form, displayName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Permissions</label>
                    {categories.map((category) => (
                      <div key={category} className="mb-3">
                        <strong className="text-capitalize">{category}</strong>
                        <div className="ml-3">
                          {getPermissionsByCategory(category).map((perm) => (
                            <div
                              key={perm._id}
                              className="custom-control custom-checkbox"
                            >
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={perm._id}
                                checked={form.permissions.includes(perm._id)}
                                onChange={() =>
                                  handlePermissionChange(perm._id)
                                }
                              />
                              <label
                                className="custom-control-label"
                                htmlFor={perm._id}
                              >
                                {perm.displayName}{" "}
                                <small className="text-muted">
                                  {perm.description}
                                </small>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingRole ? "Update Role" : "Create Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
