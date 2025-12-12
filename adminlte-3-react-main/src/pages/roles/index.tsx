import { ContentHeader } from "@components";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface IRoleRow {
  _id: string;
  role: string;
  status: string;
  createdAt?: string;
}

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<IRoleRow[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<IRoleRow[]>([]);
  const [displayedRoles, setDisplayedRoles] = useState<IRoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoles(res.data?.data || []);
      setFilteredRoles(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Search Filter
  useEffect(() => {
    let filtered = roles;

    if (searchTerm !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.role.toLowerCase().includes(term) ||
          r.status.toLowerCase().includes(term)
      );
    }

    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  // Pagination Reset
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Paginated Roles
  useEffect(() => {
    if (entriesPerPage === -1) {
      setDisplayedRoles(filteredRoles);
    } else {
      const startIndex = (currentPage - 1) * entriesPerPage;
      const endIndex = startIndex + entriesPerPage;
      setDisplayedRoles(filteredRoles.slice(startIndex, endIndex));
    }
  }, [filteredRoles, entriesPerPage, currentPage]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (err: any) {
      toast.error("Could not delete role");
    }
  };

  return (
    <div>
      <ContentHeader title="Role Management" />
      <section className="content">
        <div className="container-fluid">
          <div className="card p-3">
            {/* Search + Create Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control form-control-sm"
                style={{ width: "220px", height: "36px" }}
              />

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/roles/create")}
                style={{ height: "36px", padding: "0 16px" }}
              >
                Create New Role
              </button>
            </div>

            {/* Table */}
            <div className="card-body">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : displayedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    displayedRoles.map((r) => (
                      <tr key={r._id}>
                        <td>{r.role}</td>
                        <td>
                          {r.status === "active" ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
                        <td>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-info p-2 mr-2"
                              onClick={() => navigate(`/roles/${r._id}/view`)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-warning p-2 mr-2"
                              onClick={() => navigate(`/roles/${r._id}/edit`)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-danger p-2 mr-2"
                              onClick={() => handleDelete(r._id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div
                className="d-flex justify-content-between align-items-center mt-3"
                style={{ borderTop: "1px solid #dee2e6", paddingTop: "12px" }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Showing{" "}
                  <strong>
                    {filteredRoles.length > 0
                      ? (currentPage - 1) * entriesPerPage + 1
                      : 0}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {entriesPerPage === -1
                      ? filteredRoles.length
                      : Math.min(
                          currentPage * entriesPerPage,
                          filteredRoles.length
                        )}
                  </strong>{" "}
                  of <strong>{filteredRoles.length}</strong> entries
                </div>

                {entriesPerPage !== -1 &&
                  filteredRoles.length > entriesPerPage && (
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0" style={{ gap: "4px" }}>
                        <li
                          className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                          >
                            Previous
                          </button>
                        </li>

                        {Array.from(
                          {
                            length: Math.ceil(
                              filteredRoles.length / entriesPerPage
                            ),
                          },
                          (_, i) => i + 1
                        ).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${page === currentPage ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}

                        <li
                          className={`page-item ${
                            currentPage >=
                            Math.ceil(filteredRoles.length / entriesPerPage)
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoleList;
