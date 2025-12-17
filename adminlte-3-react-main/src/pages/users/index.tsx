import { ContentHeader } from "@components";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { IUserRow } from "@app/types/user";

const Users = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null as HTMLInputElement | null);
  const [users, setUsers] = useState([] as IUserRow[]);
  const [filteredUsers, setFilteredUsers] = useState([] as IUserRow[]);
  const [displayedUsers, setDisplayedUsers] = useState([] as IUserRow[]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const roleOptions = useMemo(() => {
  const set = new Set<string>();
  users.forEach((u) => {
    if (u.role && typeof u.role === "object" && u.role.name) {
      set.add(u.role.name);
    }
  });
  return Array.from(set).sort();
}, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data?.data || []);
      setFilteredUsers(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter users by selected role and search term
  useEffect(() => {
    let filtered = users;

    // Filter by role
   if (selectedRole !== "") {
  filtered = filtered.filter((u) => {
    return typeof u.role === "object" ? u.role.name === selectedRole : u.role === selectedRole;
  });
}

    // Filter by search term (name, email, or mobile)
    if (searchTerm !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.mobile && u.mobile.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(filtered);
  }, [selectedRole, searchTerm, users]);

  // Handle pagination and entries per page
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedRole, searchTerm, entriesPerPage]);

  // Calculate paginated users
  useEffect(() => {
    if (entriesPerPage === -1) {
      // Show all entries
      setDisplayedUsers(filteredUsers);
    } else {
      const startIndex = (currentPage - 1) * entriesPerPage;
      const endIndex = startIndex + entriesPerPage;
      setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
    }
  }, [filteredUsers, entriesPerPage, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  // Export users to Excel
  const handleExport = () => {
    if (filteredUsers.length === 0) {
      toast.warning("No users to export");
      return;
    }

    const data = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Mobile: user.mobile || "-",
      Role: user.role || "-",
      "Created On": user.createdAt
        ? new Date(user.createdAt).toLocaleString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `users_${new Date().getTime()}.xlsx`);
    toast.success("Users exported successfully");
  };

  // Import users from Excel
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.warning("No data found in Excel file");
          return;
        }

        // Validate and prepare data
        const token = localStorage.getItem("token");
        let successCount = 0;
        let failureCount = 0;

        for (const row of jsonData) {
          try {
            const payload = {
              name: (row as any)["Name"] || "",
              email: (row as any)["Email"] || "",
              password: "DefaultPassword123!",
              role: (row as any)["Role"] || "employee",
              mobile: (row as any)["Mobile"] || "",
              userType: "",
              block: "",
            };

            if (!payload.name || !payload.email) {
              failureCount++;
              continue;
            }

            await axios.post(
              "http://localhost:5000/api/auth/register",
              payload,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            successCount++;
          } catch (error) {
            failureCount++;
          }
        }

        toast.success(
          `Import complete: ${successCount} users added, ${failureCount} failed`
        );
        fetchUsers();
      } catch (error) {
        console.error(error);
        toast.error("Failed to import file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <ContentHeader title="Users" />
      <section className="content">
        <div className="container-fluid">
          <div className="card p-3">
            {/* Search and Filter Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div
                className="d-flex align-items-center"
                style={{ gap: "12px" }}
              >
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ width: "220px", height: "36px" }}
                />

                {/* Role Filter Dropdown */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ width: "140px", height: "36px" }}
                >
                  <option value="">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                {/* Entries Per Page Dropdown */}
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="form-control form-control-sm"
                  style={{ width: "100px", height: "36px" }}
                  title="Show entries"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={1000}>1000</option>
                  <option value={-1}>All</option>
                </select>
              </div>

              {/* Create User Button */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/users/create")}
                  style={{ height: "36px", padding: "0 16px" }}
                >
                  Create User
                </button>

                {/* Export Button */}
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleExport}
                  style={{ height: "36px", padding: "0 16px" }}
                  title="Export to Excel"
                >
                  <i className="fas fa-download"></i> Export
                </button>

                {/* Import Button */}
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ height: "36px", padding: "0 16px" }}
                  title="Import from Excel"
                >
                  <i className="fas fa-upload"></i> Import
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div className="card-body">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.mobile || "-"}</td>
                        <td>{u.role && typeof u.role === "object" ? u.role.displayName || u.role.name : u.role || "-"}</td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {/* View Button */}
                            <button
                              className="btn btn-sm btn-info p-2 mr-2"
                              onClick={() => navigate(`/users/${u._id}/view`)}
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>

                            {/* Edit Button */}
                            <button
                              className="btn btn-sm btn-warning p-2 mr-2"
                              onClick={() => navigate(`/users/${u._id}/edit`)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            {/* Delete Button */}
                            <button
                              className="btn btn-sm btn-danger p-2 mr-2"
                              onClick={() => handleDelete(u._id)}
                              title="Delete"
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

              {/* Pagination and Footer */}
              <div
                className="d-flex justify-content-between align-items-center mt-3"
                style={{
                  borderTop: "1px solid #dee2e6",
                  paddingTop: "12px",
                }}
              >
                {/* Showing Info */}
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Showing{" "}
                  <strong>
  {filteredUsers.length === 0 ? 0 : 1
    ? (currentPage - 1) * entriesPerPage + 1
    : 0}
</strong>{" "}
                  to{" "}
                  <strong>
                    {entriesPerPage === -1
                      ? filteredUsers.length
                      : Math.min(
                          currentPage * entriesPerPage,
                          filteredUsers.length
                        )}
                  </strong>{" "}
                  of <strong>{filteredUsers.length}</strong> entries
                </div>

                {/* Pagination Controls */}
                {entriesPerPage !== -1 &&
                  filteredUsers.length > entriesPerPage && (
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0" style={{ gap: "4px" }}>
                        {/* Previous Button */}
                        <li
                          className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            style={{
                              padding: "6px 10px",
                              fontSize: "12px",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            Previous
                          </button>
                        </li>

                        {/* Page Numbers */}
                        {Array.from(
                          {
                            length: Math.ceil(
                              filteredUsers.length / entriesPerPage
                            ),
                          },
                          (_, i) => i + 1
                        )
                          .slice(
                            Math.max(0, currentPage - 3),
                            Math.min(
                              Math.ceil(filteredUsers.length / entriesPerPage),
                              currentPage + 2
                            )
                          )
                          .map((page) => (
                            <li
                              key={page}
                              className={`page-item ${page === currentPage ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(page)}
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "12px",
                                  border: "1px solid #dee2e6",
                                }}
                              >
                                {page}
                              </button>
                            </li>
                          ))}

                        {/* Next Button */}
                        <li
                          className={`page-item ${
                            currentPage >=
                            Math.ceil(filteredUsers.length / entriesPerPage)
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(
                                  prev + 1,
                                  Math.ceil(
                                    filteredUsers.length / entriesPerPage
                                  )
                                )
                              )
                            }
                            disabled={
                              currentPage >=
                              Math.ceil(filteredUsers.length / entriesPerPage)
                            }
                            style={{
                              padding: "6px 10px",
                              fontSize: "12px",
                              border: "1px solid #dee2e6",
                            }}
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

export default Users;
