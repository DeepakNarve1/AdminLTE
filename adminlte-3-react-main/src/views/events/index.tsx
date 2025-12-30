"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { usePermissions } from "@app/hooks/usePermissions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";

import * as XLSX from "xlsx";
import { useDebounce } from "@app/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  X,
  Eye,
  Columns,
  Calendar1,
} from "lucide-react";
import { Calendar } from "@fullcalendar/core/index.js";

interface IEvent {
  _id: string;
  uniqueId: string;
  district: string;
  year: string;
  month: string;
  receivingDate: string;
  programDate: string;
  time: string;
  eventType: string;
  eventDetails: string;
}

const EventList = () => {
  return (
    <RouteGuard requiredPermissions={["view_events"]}>
      <EventListContent />
    </RouteGuard>
  );
};

const EventListContent = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("All Months");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    uniqueId: true,
    district: true,
    year: true,
    month: true,
    receivingDate: true,
    programDate: true,
    time: true,
    eventType: true,
    eventDetails: true,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params: any = {
        page: currentPage,
        limit: entriesPerPage, // Send -1 directly, don't convert to undefined
        search: debouncedSearchTerm || undefined,
        month: filterMonth === "All Months" ? undefined : filterMonth,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const { data } = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setEvents(data.data || []);
      setTotalCount(data.count || 0);
      if (data.filteredCount !== undefined) {
        setTotalCount(data.filteredCount);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    filterMonth,
    startDate,
    endDate,
  ]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleExport = () => {
    if (events.length === 0) return toast.warning("No data to export");
    const ws = XLSX.utils.json_to_sheet(events);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Events");
    XLSX.writeFile(wb, "Events.xlsx");
    toast.success("Exported successfully");
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/events/sync",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(data.message);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to sync events");
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.warning("No data found in excel file");
          return;
        }

        const token = localStorage.getItem("token");
        let importedCount = 0;

        // Helper to find value by possible keys
        const getVal = (obj: any, keys: string[]) => {
          for (const k of keys) {
            if (obj[k] !== undefined) return obj[k];
          }
          return undefined;
        };

        // Helper to parse Excel date
        const parseDate = (val: any) => {
          if (!val) return new Date();
          if (typeof val === "number") {
            // Excel serial date (days since 1900-01-01)
            // Subtract 25569 to get Unix time (days since 1970-01-01)
            // Multiply by 86400 * 1000 for milliseconds
            // This is a rough approx, typically sufficient or use XLSX utility
            const date = new Date((val - 25569) * 86400 * 1000);
            return date;
          }
          return new Date(val);
        };

        for (const item of data as any[]) {
          try {
            // Map known columns to schema
            // "Unique ID" or "uniqueId" -> uniqueId
            const uniqueId = getVal(item, [
              "uniqueId",
              "Unique ID",
              "UniqueId",
              "ID",
            ]);
            const district = getVal(item, ["district", "District"]);
            const year = getVal(item, ["year", "Year"]);
            const month = getVal(item, ["month", "Month"]);
            const receivingDateRaw = getVal(item, [
              "receivingDate",
              "Receiving Date",
              "ReceivingDate",
            ]);
            const programDateRaw = getVal(item, [
              "programDate",
              "Program Date",
              "ProgramDate",
            ]);
            const time = getVal(item, ["time", "Time"]);
            const eventType = getVal(item, ["eventType", "Event Type", "Type"]);
            const eventDetails = getVal(item, [
              "eventDetails",
              "Event Details",
              "Details",
              "Description",
            ]);

            if (!uniqueId || !programDateRaw) {
              // Skip rows that look empty identify-wise
              continue;
            }

            const payload = {
              uniqueId: String(uniqueId),
              district: String(district || ""),
              year: String(year || new Date().getFullYear()),
              month: String(month || ""),
              receivingDate: parseDate(receivingDateRaw),
              programDate: parseDate(programDateRaw),
              time: String(time || "00:00"),
              eventType: String(eventType || "General"),
              eventDetails: String(eventDetails || ""),
            };

            await axios.post("http://localhost:5000/api/events", payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
            importedCount++;
          } catch (err: any) {
            console.error("Failed to import row:", item, err);
            // Optional: toast warning for specific row failures?
            // toast.warning(`Failed to import row: ${err.message}`);
          }
        }

        toast.success(`Successfully imported ${importedCount} events`);
        fetchEvents();
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to parse excel file");
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <ContentHeader title="Events Management" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Filter Section */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3 mt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImport}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/events/calendar")}
                  className="border-[#2e7875] text-[#2e7875] hover:bg-[#2e7875] hover:text-white"
                >
                  <Calendar1 className="w-4 h-4 mr-1" /> Calendar View
                </Button>

                <Button
                  className="bg-white dark:bg-neutral-900 rounded-sm text-[#2e7875] hover:bg-[#2e7875] hover:text-white 
border border-[#2e7875]"
                  onClick={handleSyncAll}
                  disabled={syncing}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                    alt="GCal"
                    className="w-5 h-5 mr-2"
                  />
                  {syncing ? "Syncing..." : "Sync to Google Calendar"}
                </Button>
                {hasPermission("create_events") && (
                  <Button
                    onClick={() => router.push("/events/create")}
                    className="border border-[#2e7875] bg-white text-[#2e7875] hover:bg-[#2e7875] hover:text-white"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add New Events
                  </Button>
                )}
              </div>
            </div>

            {/* List Header Actions (Search & Export) */}
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Show</span>
                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={(v: string) =>
                    setEntriesPerPage(v === "-1" ? -1 : Number(v))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="-1">All</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">entries</span>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[#2e7875] text-[#2e7875] hover:bg-[#2e7875] hover:text-white"
                >
                  Import Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="border-[#2e7875] text-[#2e7875] hover:bg-[#2e7875] hover:text-white"
                >
                  Export Excel
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Search:</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            {/* Column Visibility */}
            <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Month:
                  </span>
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-40 bg-white">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Months">All Months</SelectItem>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Date Range:
                  </span>
                  <Input
                    type="date"
                    className="w-40 bg-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span>to</span>
                  <Input
                    type="date"
                    className="w-40 bg-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  className="border-[#2e7875] text-[#2e7875] hover:bg-[#2e7875] hover:text-white"
                >
                  <Filter className="w-4 h-4 mr-1" /> Filter
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilterMonth("All Months");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {Object.keys(visibleColumns).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={
                        visibleColumns[key as keyof typeof visibleColumns]
                      }
                      onCheckedChange={() =>
                        toggleColumn(key as keyof typeof visibleColumns)
                      }
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#001f3f] hover:bg-[#001f3f]">
                    <TableHead className="text-white font-bold whitespace-nowrap">
                      Sr No
                    </TableHead>
                    {visibleColumns.uniqueId && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Unique ID
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.month && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Month
                      </TableHead>
                    )}
                    {visibleColumns.receivingDate && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Receiving Date
                      </TableHead>
                    )}
                    {visibleColumns.programDate && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Program Date
                      </TableHead>
                    )}
                    {visibleColumns.time && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Time
                      </TableHead>
                    )}
                    {visibleColumns.eventType && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Event Type
                      </TableHead>
                    )}
                    {visibleColumns.eventDetails && (
                      <TableHead className="text-white font-bold whitespace-nowrap">
                        Event Details
                      </TableHead>
                    )}
                    <TableHead className="text-white font-bold whitespace-nowrap text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-10">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-20 text-gray-500"
                      >
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event, index) => (
                      <TableRow key={event._id} className="hover:bg-gray-50">
                        <TableCell>
                          {entriesPerPage === -1
                            ? index + 1
                            : (currentPage - 1) * entriesPerPage + index + 1}
                        </TableCell>
                        {visibleColumns.uniqueId && (
                          <TableCell className="font-bold">
                            {event.uniqueId}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>{event.district}</TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell>{event.year}</TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell>{event.month}</TableCell>
                        )}
                        {visibleColumns.receivingDate && (
                          <TableCell>
                            {new Date(event.receivingDate).toLocaleDateString()}
                          </TableCell>
                        )}
                        {visibleColumns.programDate && (
                          <TableCell>
                            {new Date(event.programDate).toLocaleDateString()}
                          </TableCell>
                        )}
                        {visibleColumns.time && (
                          <TableCell>{event.time}</TableCell>
                        )}
                        {visibleColumns.eventType && (
                          <TableCell>{event.eventType}</TableCell>
                        )}
                        {visibleColumns.eventDetails && (
                          <TableCell className="max-w-xs truncate">
                            {event.eventDetails}
                          </TableCell>
                        )}
                        <TableCell className="text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/events/${event._id}/view`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              {hasPermission("edit_events") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/events/${event._id}/edit`)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {hasPermission("delete_events") && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(event._id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  {(currentPage - 1) *
                    (entriesPerPage === -1 ? totalCount : entriesPerPage) +
                    1}{" "}
                  to{" "}
                  {entriesPerPage === -1
                    ? totalCount
                    : Math.min(currentPage * entriesPerPage, totalCount)}{" "}
                  of {totalCount} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      entriesPerPage === -1 ||
                      currentPage * entriesPerPage >= totalCount
                    }
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventList;
