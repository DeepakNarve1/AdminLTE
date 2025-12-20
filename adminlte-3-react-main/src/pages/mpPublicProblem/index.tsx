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
      <section className="content p-4">
        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Block
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
              >
                <option value="">Select Block</option>
                <option value="Bagh">Bagh</option>
                <option value="Tanda">Tanda</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Year
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">Select Year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Month
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Department
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="PWD">PWD</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="w-full bg-blue-600 text-white font-medium py-2 rounded shadow hover:bg-blue-700 transition duration-200"
                onClick={handleFilter}
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800">
              Public Problems List
            </h3>
            <div className="flex items-center gap-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1.5 rounded shadow hover:bg-yellow-600 transition flex items-center text-sm font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                Import <i className="fas fa-file-import ml-2"></i>
              </button>
              <button
                className="bg-cyan-500 text-white px-3 py-1.5 rounded shadow hover:bg-cyan-600 transition flex items-center text-sm font-medium"
                onClick={() => navigate("/mp-public-problems/create-entry")}
              >
                Add <i className="fas fa-plus ml-2"></i>
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

          <div className="p-4">
            {/* Top Controls */}
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center text-sm">
                  <span className="mr-2 text-gray-600">Show</span>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="1000">1000</option>
                    <option value="-1">All</option>
                  </select>
                  <span className="ml-2 text-gray-600">entries</span>
                </div>

                <button
                  className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 transition"
                  onClick={handleExport}
                >
                  Export Excel
                </button>

                <div className="relative">
                  <button
                    className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 transition"
                    onClick={() => setShowColumnToggle(!showColumnToggle)}
                  >
                    Show/Hide Columns
                  </button>
                  {showColumnToggle && (
                    <div className="absolute z-10 top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded p-3 min-w-[200px]">
                      {Object.keys(visibleColumns).map((key) => (
                        <div
                          key={key}
                          className="flex items-center mb-2 last:mb-0"
                        >
                          <input
                            type="checkbox"
                            id={`col-${key}`}
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={
                              visibleColumns[key as keyof typeof visibleColumns]
                            }
                            onChange={() =>
                              toggleColumn(key as keyof typeof visibleColumns)
                            }
                          />
                          <label
                            htmlFor={`col-${key}`}
                            className="text-sm text-gray-700 capitalize cursor-pointer"
                          >
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-600">Search:</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-[#002147] text-white">
                  <tr>
                    {visibleColumns.srNo && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Sr.No.
                      </th>
                    )}
                    {visibleColumns.regNo && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Regl. No.
                      </th>
                    )}
                    {visibleColumns.timer && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Timer
                      </th>
                    )}
                    {visibleColumns.year && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Year
                      </th>
                    )}
                    {visibleColumns.month && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Month
                      </th>
                    )}
                    {visibleColumns.date && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Date
                      </th>
                    )}
                    {visibleColumns.district && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        District
                      </th>
                    )}
                    {visibleColumns.assembly && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Assembly
                      </th>
                    )}
                    {visibleColumns.block && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Block
                      </th>
                    )}
                    {visibleColumns.recLetterNo && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Recommended Letter No
                      </th>
                    )}
                    {visibleColumns.boothNo && (
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        Booth No
                      </th>
                    )}
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-6 text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-8">
                        {totalCount > 0 ? (
                          <div>
                            <strong className="text-gray-700">
                              No records match the current filters
                            </strong>
                            <div className="mt-2 text-gray-500 text-sm">
                              Try adjusting or clearing the filters
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="mb-3 text-gray-600">
                              No data available in the database
                            </div>
                            <button
                              className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition text-sm font-medium"
                              onClick={handleSeed}
                            >
                              Seed Database (Add Demo Data)
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50 transition-colors even:bg-gray-50"
                      >
                        {visibleColumns.srNo && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {(currentPage - 1) * entriesPerPage + idx + 1}
                          </td>
                        )}
                        {visibleColumns.regNo && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.regNo}
                          </td>
                        )}
                        {visibleColumns.timer && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600 text-center border-r border-gray-100">
                            {calculateTimer(row.submissionDate)}
                          </td>
                        )}
                        {visibleColumns.year && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.year}
                          </td>
                        )}
                        {visibleColumns.month && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.month}
                          </td>
                        )}
                        {visibleColumns.date && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.dateString}
                          </td>
                        )}
                        {visibleColumns.district && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.district}
                          </td>
                        )}
                        {visibleColumns.assembly && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.assembly}
                          </td>
                        )}
                        {visibleColumns.block && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.block}
                          </td>
                        )}
                        {visibleColumns.recLetterNo && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.recommendedLetterNo}
                          </td>
                        )}
                        {visibleColumns.boothNo && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-100">
                            {row.boothNo || "-"}
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            className="bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500 transition shadow-sm"
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
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                Showing{" "}
                <span className="font-medium">
                  {data.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * entriesPerPage, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> entries
              </div>

              {entriesPerPage !== -1 && totalCount > entriesPerPage && (
                <nav className="flex items-center space-x-1">
                  <button
                    className={`px-3 py-1 rounded border ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1 bg-blue-600 text-white rounded border border-blue-600">
                    {currentPage}
                  </span>

                  <button
                    className={`px-3 py-1 rounded border ${
                      currentPage * entriesPerPage >= totalCount
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage * entriesPerPage >= totalCount}
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MpPublicProblem;
