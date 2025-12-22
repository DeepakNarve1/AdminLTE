import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@components";
import {
  DEFAULT_SIDEBAR_ACCESS_BY_ROLE,
  MENU,
} from "@app/modules/main/menu-sidebar/MenuSidebar";
import { useAppSelector } from "@app/store/store";

type SidebarAccessMap = Record<string, string[]>;

interface IRole {
  _id: string;
  role?: string;
  name?: string;
  displayName?: string;
}

const flattenMenu = (items = MENU) => {
  const flattened: { name: string; path?: string }[] = [];

  const walk = (list: typeof MENU) => {
    list.forEach((item) => {
      if (item.path) {
        flattened.push({ name: item.name, path: item.path });
      }
      if (item.children && item.children.length > 0) {
        walk(item.children as any);
      }
    });
  };

  walk(items as any);
  return flattened;
};

const PermissionsPage = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [accessMap, setAccessMap] = useState<SidebarAccessMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const menuItems = useMemo(() => flattenMenu(), []);

  const isSuperAdmin = useMemo(() => {
    const rolesList = Array.isArray(currentUser?.roles)
      ? currentUser?.roles
      : [];
    return (
      currentUser?.role === "superadmin" || rolesList.includes("superadmin")
    );
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const [rolesRes, accessRes] = await Promise.all([
          axios.get("http://localhost:5000/api/roles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/rbac/sidebar-permissions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRoles(rolesRes.data?.data || []);

        const map = accessRes.data?.data;
        if (map && typeof map === "object" && !Array.isArray(map)) {
          // FORCE superadmin wildcard
          map.superadmin = ["*"];
          setAccessMap(map);
        } else {
          setAccessMap(DEFAULT_SIDEBAR_ACCESS_BY_ROLE);
        }
      } catch (err: any) {
        console.warn("Could not load sidebar permissions from server", err);
        setAccessMap(DEFAULT_SIDEBAR_ACCESS_BY_ROLE);
        toast.error(
          err?.response?.data?.message || "Failed to load permissions map"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTogglePath = (path: string) => {
    if (!selectedRole) {
      toast.warn("Select a role first");
      return;
    }
    setAccessMap((prev) => {
      const roleAccess = new Set(prev[selectedRole] || []);
      if (roleAccess.has(path)) {
        roleAccess.delete(path);
      } else {
        roleAccess.add(path);
      }
      return { ...prev, [selectedRole]: Array.from(roleAccess) };
    });
  };

  const handleSave = async () => {
    if (selectedRole === "superadmin") {
      toast.info("Superadmin permissions are fixed and cannot be changed");
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/rbac/sidebar-permissions",
        accessMap,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem("sidebarAccessByRole", JSON.stringify(accessMap));
      toast.success("Sidebar permissions updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="container-fluid">
        <ContentHeader title="Sidebar Permissions" />
        <div className="alert alert-warning mt-3">
          You do not have access to manage sidebar permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <ContentHeader title="Sidebar Permissions" />
      <div className="card p-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="font-weight-bold mb-1">Select Role</label>
            <select
              className="form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">-- Choose Role --</option>
              {roles.map((r) => (
                <option key={r._id} value={r.role || r.displayName || r.name}>
                  {r.displayName || r.name || r.role}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <button
              className="btn btn-primary ml-auto"
              disabled={!selectedRole || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sidebar Item</th>
                <th>Path</th>
                <th className="text-center" style={{ width: 140 }}>
                  Visible for Role
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
                      checked={
                        selectedRole === "superadmin"
                          ? true
                          : !!selectedRole &&
                            (accessMap[selectedRole] || []).includes(
                              item.path || ""
                            )
                      }
                      onChange={() => item.path && handleTogglePath(item.path)}
                      disabled={!selectedRole || selectedRole === "superadmin"}
                    />
                  </td>
                </tr>
              ))}
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">
                    No menu items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {isLoading && (
            <div className="text-center p-3 text-muted">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
