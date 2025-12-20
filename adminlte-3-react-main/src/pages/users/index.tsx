import { ContentHeader } from "@components";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { IUserRow } from "@app/types/user";
import { useAuthorization } from "@app/hooks/useAuthorization";

const Users = () => {
  const { checkPermission } = useAuthorization();
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
        return typeof u.role === "object"
          ? u.role.name === selectedRole
          : u.role === selectedRole;
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
      <section className="p-4">
        <div className="w-full">
          <div className="bg-white rounded shadow-sm p-4 border border-gray-200">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[220px]"
                />

                {/* Role Filter Dropdown */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[140px]"
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
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[100px]"
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

              {/* Action Buttons */}
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                {checkPermission("create_users") && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded whitespace-nowrap transition-colors"
                    onClick={() => navigate("/users/create")}
                  >
                    Create User
                  </button>
                )}

                {/* Export Button */}
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded whitespace-nowrap transition-colors flex items-center gap-2"
                  onClick={handleExport}
                  title="Export to Excel"
                >
                  <i className="fas fa-download"></i> Export
                </button>

                {/* Import Button */}
                <button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium py-2 px-4 rounded whitespace-nowrap transition-colors flex items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
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
                  className="hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Mobile
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Created On
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-gray-200 px-4 py-8 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-gray-200 px-4 py-8 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {u.name}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {u.email}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {u.mobile || "-"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {u.role && typeof u.role === "object"
                            ? u.role.displayName || u.role.name
                            : u.role || "-"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            {/* View Button */}
                            {checkPermission("view_users") && (
                              <button
                                className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded transition-colors h-8 w-8 flex items-center justify-center"
                                onClick={() => navigate(`/users/${u._id}/view`)}
                                title="View"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            )}

                            {/* Edit Button */}
                            {checkPermission("edit_users") && (
                              <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors h-8 w-8 flex items-center justify-center"
                                onClick={() => navigate(`/users/${u._id}/edit`)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            )}

                            {/* Delete Button */}
                            {checkPermission("delete_users") && (
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors h-8 w-8 flex items-center justify-center"
                                onClick={() => handleDelete(u._id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
              {/* Showing Info */}
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                Showing{" "}
                <strong className="font-semibold text-gray-800">
                  {filteredUsers.length === 0
                    ? 0
                    : (currentPage - 1) * entriesPerPage + 1}
                </strong>{" "}
                to{" "}
                <strong className="font-semibold text-gray-800">
                  {entriesPerPage === -1
                    ? filteredUsers.length
                    : Math.min(
                        currentPage * entriesPerPage,
                        filteredUsers.length
                      )}
                </strong>{" "}
                of{" "}
                <strong className="font-semibold text-gray-800">
                  {filteredUsers.length}
                </strong>{" "}
                entries
              </div>

              {/* Pagination Controls */}
              {entriesPerPage !== -1 &&
                filteredUsers.length > entriesPerPage && (
                  <nav aria-label="Page navigation">
                    <ul className="flex list-none gap-1 m-0 p-0">
                      {/* Previous Button */}
                      <li>
                        <button
                          className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                              ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700"}`}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
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
                          <li key={page}>
                            <button
                              className={`px-3 py-1 text-sm border rounded transition-colors
                                  ${
                                    page === currentPage
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                  }`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}

                      {/* Next Button */}
                      <li>
                        <button
                          className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                              ${currentPage >= Math.ceil(filteredUsers.length / entriesPerPage) ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700"}`}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(filteredUsers.length / entriesPerPage)
                              )
                            )
                          }
                          disabled={
                            currentPage >=
                            Math.ceil(filteredUsers.length / entriesPerPage)
                          }
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
      </section>
    </div>
  );
};

export default Users;
