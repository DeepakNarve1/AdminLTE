import { ContentHeader } from "@components";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

interface IPublicProblem {
  _id: string;
  regNo: string;
  submissionDate: string;
  year: string;
  month: string;
  dateString: string;
  district: string;
  assembly: string;
  block: string;
  recommendedLetterNo: string;
  boothNo: string;
  status: string;
  department: string;
}

const calculateTimer = (dateStr: string) => {
  const now = new Date();
  const sub = new Date(dateStr);
  const diff = now.getTime() - sub.getTime();

  if (diff < 0) return "0d, 0h, 0m, 0s";

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
};

const MpPublicProblem = () => {
  const [data, setData] = useState<IPublicProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterBlock, setFilterBlock] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility State
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    regNo: true,
    timer: true,
    year: true,
    month: true,
    date: true,
    district: true,
    assembly: true,
    block: true,
    recLetterNo: true,
    boothNo: true,
  });

  // Timer for live update
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
      };
      if (filterBlock) params.block = filterBlock;
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;
      if (filterDepartment) params.department = filterDepartment;
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get("http://localhost:5000/api/public-problems", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });

      setData(res.data.data);
      setTotal(res.data.count);
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to fetch data");
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
    filterYear,
    filterMonth,
    filterDepartment,
    filterStatus,
    searchTerm,
  ]);

  // Apply Filters
  const handleFilter = () => {
    setCurrentPage(1); // Reset to first page on filter change
    fetchData(); // Trigger data fetch with new filters
    toast.info("Filters applied");
  };

  // Search Logic (now triggers fetchData)
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search change
      fetchData(); // Trigger data fetch with new search term
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Pagination Logic (no longer needed for client-side slicing, just triggers fetchData)
  // The useEffect for pagination is now merged into the main fetchData useEffect.

  const handleSeed = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/public-problems/seed",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Database seeded! Refreshing...");
      fetchData();
    } catch (err) {
      toast.error("Failed to seed database");
    }
  };

  const handleExport = () => {
    // For export, we might want to fetch all data without pagination or apply current filters
    // For simplicity, exporting currently displayed data.
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PublicProblems");
    XLSX.writeFile(wb, "PublicProblems.xlsx");
    toast.success("Exported to Excel");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <ContentHeader title="Public Problems Management" />
      <section className="content">
        <div className="container-fluid">
          {/* Filters Card */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-2 mb-2">
                  <label>Block</label>
                  <select
                    className="form-control"
                    value={filterBlock}
                    onChange={(e) => setFilterBlock(e.target.value)}
                  >
                    <option value="">Select Block</option>
                    <option value="Bagh">Bagh</option>
                    <option value="Tanda">Tanda</option>
                  </select>
                </div>
                <div className="col-md-2 mb-2">
                  <label>Year</label>
                  <select
                    className="form-control"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
                <div className="col-md-2 mb-2">
                  <label>Month</label>
                  <select
                    className="form-control"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  >
                    <option value="">Select Month</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div className="col-md-2 mb-2">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="PWD">PWD</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div className="col-md-2 mb-2">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div className="col-md-2 mb-2 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleFilter}
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List Card */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title font-weight-bold">
                Public Problems List
              </h3>
              <button className="btn btn-info btn-sm">
                Add <i className="fas fa-plus ml-1"></i>
              </button>
            </div>

            <div className="card-body">
              {/* Top Controls */}
              <div className="d-flex justify-content-between flex-wrap mb-3">
                {/* Left Side: Entries & Buttons */}
                <div
                  className="d-flex align-items-center mb-2"
                  style={{ gap: "10px" }}
                >
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
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="1000">1000</option>
                      <option value="-1">All</option>
                    </select>
                    <span className="ml-2">entries</span>
                  </div>

                  <button
                    className="btn btn-default btn-sm border"
                    onClick={handleExport}
                  >
                    Export Excel
                  </button>

                  <div className="position-relative">
                    <button
                      className="btn btn-default btn-sm border"
                      onClick={() => setShowColumnToggle(!showColumnToggle)}
                    >
                      Show/Hide Columns
                    </button>
                    {showColumnToggle && (
                      <div
                        className="position-absolute bg-white border shadow p-2"
                        style={{
                          zIndex: 1000,
                          top: "100%",
                          left: 0,
                          minWidth: "150px",
                        }}
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

                {/* Right Side: Search */}
                <div className="d-flex align-items-center mb-2">
                  <label className="mr-2 mb-0">Search:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-striped text-center">
                  <thead style={{ backgroundColor: "#002147", color: "white" }}>
                    <tr>
                      {visibleColumns.srNo && <th>Sr.No.</th>}
                      {visibleColumns.regNo && <th>Regl. No.</th>}
                      {visibleColumns.timer && <th>Timer</th>}
                      {visibleColumns.year && <th>Year</th>}
                      {visibleColumns.month && <th>Month</th>}
                      {visibleColumns.date && <th>Date</th>}
                      {visibleColumns.district && <th>District</th>}
                      {visibleColumns.assembly && <th>Assembly</th>}
                      {visibleColumns.block && <th>Block</th>}
                      {visibleColumns.recLetterNo && (
                        <th>Recommended Letter No</th>
                      )}
                      {visibleColumns.boothNo && <th>Booth No</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11}>Loading...</td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan={11}>
                          No data found
                          {total === 0 && (
                            <div className="mt-2">
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={handleSeed}
                              >
                                Seed Database (Demo)
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      data.map((row: IPublicProblem, idx) => (
                        <tr key={row._id}>
                          {visibleColumns.srNo && (
                            <td>
                              {(currentPage - 1) * entriesPerPage + idx + 1}
                            </td>
                          )}
                          {visibleColumns.regNo && <td>{row.regNo}</td>}
                          {visibleColumns.timer && (
                            <td style={{ color: "red", fontWeight: "bold" }}>
                              {calculateTimer(row.submissionDate)}
                            </td>
                          )}
                          {visibleColumns.year && <td>{row.year}</td>}
                          {visibleColumns.month && <td>{row.month}</td>}
                          {visibleColumns.date && <td>{row.dateString}</td>}
                          {visibleColumns.district && <td>{row.district}</td>}
                          {visibleColumns.assembly && <td>{row.assembly}</td>}
                          {visibleColumns.block && <td>{row.block}</td>}
                          {visibleColumns.recLetterNo && (
                            <td>{row.recommendedLetterNo}</td>
                          )}
                          {visibleColumns.boothNo && (
                            <td>{row.boothNo || ""}</td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
                <div className="text-muted small">
                  Showing{" "}
                  {data.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}{" "}
                  to {Math.min(currentPage * entriesPerPage, total)} of {total}{" "}
                  entries
                </div>
                <nav>
                  {entriesPerPage !== -1 && total > entriesPerPage && (
                    <ul className="pagination pagination-sm m-0">
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
                        className={`page-item ${currentPage * entriesPerPage >= total ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MpPublicProblem;
