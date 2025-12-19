import { ContentHeader } from "@components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Updated Interface for Project Summary
interface IProject {
  _id: string;
  district: string;
  block: string;
  department: string;
  workName: string;
  projectCost: number;
  proposalEstimate: number;
  tsNoDate: string;
  asNoDate: string;
  status: string;
  officerName: string;
  contactNumber: string;
  remarks: string;
  createdAt?: string;
}

const ProjectSummary = () => {
  const [data, setData] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Filters
  const [filterBlock, setFilterBlock] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    district: true,
    block: true,
    department: true,
    workName: true,
    projectCost: true,
    proposalEstimate: true,
    tsNoDate: true,
    asNoDate: true,
    status: true,
    officerName: true,
    contactNumber: true,
    remarks: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage === -1 ? -1 : entriesPerPage,
      };
      if (filterBlock) params.block = filterBlock;
      if (filterDepartment) params.department = filterDepartment;
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      // Update endpoint if different from public-problems
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });

      setData(res.data.data || []);
      setTotalCount(res.data.count || 0);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    entriesPerPage,
    filterBlock,
    filterDepartment,
    filterStatus,
    searchTerm,
  ]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchData();
    toast.info("Filters applied");
  };

  const handleExport = () => {
    if (data.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, "ProjectSummary.xlsx");
    toast.success("Exported successfully");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Implement import logic later if needed
    toast.info("Import feature coming soon");
  };

  return (
    <div>
      <ContentHeader title="Project Summary" />

      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-4 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0 text-dark">
                <i className="fas fa-project-diagram mr-2 text-primary"></i>
                Project Summary Management
              </h1>
            </div>
            <div className="col-sm-6">
              <div className="d-flex justify-content-end align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-warning btn-sm shadow-sm px-2 mr-1 rounded"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-file-import mr-2"></i>
                  Import Excel
                </button>

                <button
                  type="button"
                  className="btn btn-success btn-sm shadow-sm px-2 mr-1 rounded"
                  onClick={() => navigate("/projects/create")}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Project
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Filters */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label>Block</label>
                  <select
                    className="form-control"
                    value={filterBlock}
                    onChange={(e) => setFilterBlock(e.target.value)}
                  >
                    <option value="">All Blocks</option>
                    <option value="Bagh">Bagh</option>
                    <option value="Tanda">Tanda</option>
                    {/* Add more */}
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="PWD">PWD</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-3 mb-2 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleFilter}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <strong>Project List</strong>
              </h3>
            </div>

            <div className="card-body">
              {/* Controls */}
              <div className="d-flex justify-content-between flex-wrap mb-3">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="d-flex align-items-center">
                    <span className="mr-2">Show</span>
                    <select
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                      value={entriesPerPage}
                      onChange={(e) =>
                        setEntriesPerPage(Number(e.target.value))
                      }
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="-1">All</option>
                    </select>
                    <span className="ml-2 mr-2">entries</span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm mr-2"
                    onClick={handleExport}
                  >
                    Export Excel
                  </button>

                  <div className="position-relative">
                    <button
                      className="btn btn-default btn-sm border"
                      onClick={() => setShowColumnToggle(!showColumnToggle)}
                    >
                      Columns
                    </button>
                    {showColumnToggle && (
                      <div
                        className="position-absolute bg-white border shadow p-3 mt-1"
                        style={{ zIndex: 1000, minWidth: "200px" }}
                      >
                        {Object.keys(visibleColumns).map((key) => (
                          <div key={key} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={
                                visibleColumns[
                                  key as keyof typeof visibleColumns
                                ]
                              }
                              onChange={() =>
                                toggleColumn(key as keyof typeof visibleColumns)
                              }
                            />
                            <label className="form-check-label text-capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center mb-2">
                  <label className="mr-2 mb-0">Search:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search projects..."
                  />
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover text-center">
                  <thead className="bg-primary text-white">
                    <tr>
                      {visibleColumns.srNo && <th>Sr. No.</th>}
                      {visibleColumns.district && <th>District</th>}
                      {visibleColumns.block && <th>Block</th>}
                      {visibleColumns.department && <th>Department</th>}
                      {visibleColumns.workName && <th>Work Name</th>}
                      {visibleColumns.projectCost && <th>Project Cost (₹)</th>}
                      {visibleColumns.proposalEstimate && (
                        <th>Proposal Estimate (₹)</th>
                      )}
                      {visibleColumns.tsNoDate && <th>TS No/Date</th>}
                      {visibleColumns.asNoDate && <th>AS No/Date</th>}
                      {visibleColumns.status && <th>Status</th>}
                      {visibleColumns.officerName && <th>Officer Name</th>}
                      {visibleColumns.contactNumber && <th>Contact Number</th>}
                      {visibleColumns.remarks && <th>Remarks</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={14} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center py-4">
                          <strong>No projects found</strong>
                          <div className="mt-2 text-muted">
                            Try adjusting filters or add a new project
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.map((project, idx) => (
                        <tr key={project._id}>
                          {visibleColumns.srNo && (
                            <td>
                              {(currentPage - 1) * entriesPerPage + idx + 1}
                            </td>
                          )}
                          {visibleColumns.district && (
                            <td>{project.district}</td>
                          )}
                          {visibleColumns.block && <td>{project.block}</td>}
                          {visibleColumns.department && (
                            <td>{project.department}</td>
                          )}
                          {visibleColumns.workName && (
                            <td>{project.workName}</td>
                          )}
                          {visibleColumns.projectCost && (
                            <td>₹{project.projectCost.toLocaleString()}</td>
                          )}
                          {visibleColumns.proposalEstimate && (
                            <td>
                              ₹{project.proposalEstimate.toLocaleString()}
                            </td>
                          )}
                          {visibleColumns.tsNoDate && (
                            <td>{project.tsNoDate || "-"}</td>
                          )}
                          {visibleColumns.asNoDate && (
                            <td>{project.asNoDate || "-"}</td>
                          )}
                          {visibleColumns.status && (
                            <td>
                              <span
                                className={`badge badge-${project.status === "Completed" ? "success" : project.status === "In Progress" ? "warning" : "secondary"}`}
                              >
                                {project.status}
                              </span>
                            </td>
                          )}
                          {visibleColumns.officerName && (
                            <td>{project.officerName || "-"}</td>
                          )}
                          {visibleColumns.contactNumber && (
                            <td>{project.contactNumber || "-"}</td>
                          )}
                          {visibleColumns.remarks && (
                            <td>{project.remarks || "-"}</td>
                          )}
                          <td>
                            <button
                              className="btn btn-sm btn-primary mr-1"
                              onClick={() =>
                                navigate(`/projects/${project._id}`)
                              }
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() =>
                                navigate(`/projects/${project._id}/edit`)
                              }
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted small">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                  {Math.min(currentPage * entriesPerPage, totalCount)} of{" "}
                  {totalCount} entries
                </div>
                {entriesPerPage !== -1 && totalCount > entriesPerPage && (
                  <nav>
                    <ul className="pagination pagination-sm">
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                        >
                          Previous
                        </button>
                      </li>
                      <li className="page-item active">
                        <span className="page-link">{currentPage}</span>
                      </li>
                      <li
                        className={`page-item ${currentPage * entriesPerPage >= totalCount ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage((p) => p + 1)}
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

export default ProjectSummary;
