import { ContentHeader } from "@components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const [totalCount, setTotalCount] = useState(0); // Total records in DB (unfiltered)
  const navigate = useNavigate();
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

  // Column Visibility
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

  // Live timer
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
        limit: entriesPerPage === -1 ? -1 : entriesPerPage,
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

      setData(res.data.data || []);
      setTotalCount(res.data.count || 0); // This is now the TRUE total in DB
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch data");
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

  const handleSeed = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/public-problems/seed",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Database seeded successfully!");
      fetchData();
    } catch (err) {
      toast.error("Failed to seed database");
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PublicProblems");
    XLSX.writeFile(wb, "PublicProblems.xlsx");
    toast.success("Exported successfully");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import from Excel
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.warning("No data found in Excel file");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        let successCount = 0;
        let failureCount = 0;

        // Iterate and create entries
        for (const row of jsonData) {
          try {
            const anyRow = row as any;
            const payload = {
              srNo: anyRow["Sr.No."] || anyRow["SrNo"] || anyRow["srNo"] || "",
              regNo:
                anyRow["Regl. No."] || anyRow["RegNo"] || anyRow["regNo"] || "",
              timer: anyRow["Timer"] || anyRow["timer"] || "",
              year:
                anyRow["Year"] ||
                anyRow["year"] ||
                new Date().getFullYear().toString(),
              month: anyRow["Month"] || anyRow["month"] || "",
              day: anyRow["Date"] || anyRow["Day"] || anyRow["day"] || "",
              district: anyRow["District"] || anyRow["district"] || "",
              assembly: anyRow["Assembly"] || anyRow["assembly"] || "",
              block: anyRow["Block"] || anyRow["block"] || "",
              recommendedLetterNo:
                anyRow["Recommended Letter No"] ||
                anyRow["RecLetterNo"] ||
                anyRow["recommendedLetterNo"] ||
                "",
              boothNo:
                anyRow["Booth No"] ||
                anyRow["Booth"] ||
                anyRow["boothNo"] ||
                "",
              department: anyRow["Department"] || anyRow["department"] || "",
              status: anyRow["Status"] || anyRow["status"] || "Pending",
            };

            // Basic validation
            if (!payload.regNo || !payload.district) {
              failureCount++;
              continue;
            }

            // Using existing create endpoint
            await axios.post(
              "http://localhost:5000/api/public-problems",
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
          `Import complete: ${successCount} entries added, ${failureCount} failed`
        );
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to import file. Please check the format.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
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

          {/* Main Table Card */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title font-weight-bold">
                Public Problems List
              </h3>
              <div className="ml-auto">
                <button
                  className="btn btn-warning btn-sm mr-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import <i className="fas fa-file-import ml-1"></i>
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => navigate("/mp-public-problems/create-entry")}
                >
                  Add <i className="fas fa-plus ml-1"></i>
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

            <div className="card-body">
              {/* Top Controls */}
              <div className="d-flex justify-content-between flex-wrap mb-3">
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

                <div className="d-flex align-items-center mb-2">
                  <label className="mr-2 mb-0">Search:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-4">
                          {totalCount > 0 ? (
                            <div>
                              <strong>
                                No records match the current filters
                              </strong>
                              <div className="mt-2 text-muted small">
                                Try adjusting or clearing the filters
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="mb-3">
                                No data available in the database
                              </div>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={handleSeed}
                              >
                                Seed Database (Add Demo Data)
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      data.map((row, idx) => (
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
                            <td>{row.boothNo || "-"}</td>
                          )}
                          <td>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() =>
                                navigate(`/mp-public-problems/${row._id}/edit`)
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
              <div className="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
                <div className="text-muted small">
                  Showing{" "}
                  {data.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}{" "}
                  to {Math.min(currentPage * entriesPerPage, totalCount)} of{" "}
                  {totalCount} entries
                </div>

                {entriesPerPage !== -1 && totalCount > entriesPerPage && (
                  <nav>
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
                        className={`page-item ${
                          currentPage * entriesPerPage >= totalCount
                            ? "disabled"
                            : ""
                        }`}
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

export default MpPublicProblem;
