"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  getWeekOfMonth,
  isToday,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "@app/components/ui/button";
import { cn } from "@app/lib/utils";
import axios from "axios";

const colorStyles = {
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  pink: "bg-pink-50 text-pink-700 border border-pink-200",
  green: "bg-green-50 text-green-700 border border-green-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
  orange: "bg-orange-50 text-orange-700 border border-orange-200",
  neutral: "bg-neutral-50 text-neutral-700 border border-neutral-200",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

// Types matching the provided attachment structure
interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color:
    | "blue"
    | "pink"
    | "green"
    | "purple"
    | "orange"
    | "neutral"
    | "emerald";
  date: Date;
  details: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 11, 29)); // Defaulting to Dec 29, 2025 as per screenshot
  const [view, setView] = React.useState("Month view");

  // Mock events based on the screenshot
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEvent | null>(null);

  const getEventColor = (title: string): CalendarEvent["color"] => {
    const t = title.toLowerCase();
    if (t.includes("meeting")) return "blue";
    if (t.includes("inauguration")) return "orange";
    if (t.includes("visit")) return "green";
    if (t.includes("conference") || t.includes("vc")) return "purple";
    if (t.includes("ceremony")) return "pink";
    return "neutral";
  };

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: -1 },
        });

        const mappedEvents = data.data.map((e: any) => ({
          id: e._id,
          title: e.eventType,
          time: e.time || "", // optional, you can format time
          color: getEventColor(e.eventType || ""),
          date: new Date(e.programDate),
          details: e.eventDetails || "No details provided",
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };

    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);

  // Calculate calendar days based on view
  const getCalendarDays = () => {
    switch (view) {
      case "Week view":
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        });
      case "Day view":
        return [currentDate];
      case "Month view":
      default:
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        return eachDayOfInterval({
          start: startDate,
          end: endDate,
        });
    }
  };

  const calendarDays = getCalendarDays();

  const handleNext = () => {
    switch (view) {
      case "Week view":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "Day view":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "Month view":
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handlePrev = () => {
    switch (view) {
      case "Week view":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "Day view":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "Month view":
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Calendar Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            {/* Date Chip */}
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-neutral-100 bg-white shadow-sm">
              <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                {format(currentDate, "MMM")}
              </span>
              <span className="text-2xl font-bold text-indigo-600 leading-none">
                {format(currentDate, "d")}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">
                  {format(currentDate, "MMMM yyyy")}
                </h1>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                  Week {getWeekOfMonth(currentDate)}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                {format(monthStart, "MMM d, yyyy")} –{" "}
                {format(monthEnd, "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4 text-neutral-600" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4 text-neutral-600" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 gap-2 border-neutral-200 px-4 text-sm font-medium text-neutral-700 bg-transparent"
                >
                  {view}
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setView("Month view")}>
                  Month view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("Week view")}>
                  Week view
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("Day view")}>
                  Day view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
          {/* Day Headers - Hidden in Day view */}
          {view !== "Day view" && (
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-white">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-neutral-400"
                >
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Days */}
          <div
            className={cn(
              "grid",
              view === "Day view" ? "grid-cols-1" : "grid-cols-7"
            )}
          >
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const isSelected = isSameDay(day, currentDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative min-h-[140px] border-b border-neutral-200 p-2 transition-colors",
                    view !== "Day view" && "border-r last:border-r-0",
                    !isCurrentMonth && "bg-neutral-50/30",
                    isSelected && "bg-indigo-50/20"
                  )}
                  onClick={() => setCurrentDate(day)}
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      view !== "Day view"
                        ? "inline-flex h-7 w-7 items-center justify-center"
                        : "inline-block mb-2",
                      !isCurrentMonth ? "text-neutral-300" : "text-neutral-900",
                      isToday(day) &&
                        (view !== "Day view"
                          ? "rounded-full bg-indigo-600 text-white"
                          : "text-indigo-600 font-bold")
                    )}
                  >
                    {view !== "Day view"
                      ? format(day, "d")
                      : format(day, "EEEE, d")}
                  </span>

                  <div className="mt-2 flex flex-col gap-1">
                    {(view === "Month view"
                      ? dayEvents.slice(0, 3)
                      : dayEvents
                    ).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between transition-shadow hover:shadow-sm",
                          colorStyles[event.color],
                          view === "Month view"
                            ? "rounded-md px-2 py-1 text-[11px] font-medium"
                            : "rounded-md px-3 py-2 text-xs font-semibold"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        <span className="truncate">{event.title}</span>
                        <span className="ml-1 shrink-0 opacity-60">
                          {event.time}
                        </span>
                      </div>
                    ))}
                    {view === "Month view" && dayEvents.length > 3 && (
                      <div className="px-2 text-[11px] font-medium text-neutral-500">
                        {dayEvents.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open: boolean) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  selectedEvent?.color === "blue" && "bg-blue-500",
                  selectedEvent?.color === "pink" && "bg-pink-500",
                  selectedEvent?.color === "green" && "bg-green-500",
                  selectedEvent?.color === "purple" && "bg-purple-500",
                  selectedEvent?.color === "orange" && "bg-orange-500",
                  selectedEvent?.color === "neutral" && "bg-neutral-500",
                  selectedEvent?.color === "emerald" && "bg-emerald-500"
                )}
              />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.date &&
                format(selectedEvent.date, "EEEE, MMMM d, yyyy")}
              {selectedEvent?.time && ` at ${selectedEvent.time}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-sm text-neutral-600">
              {selectedEvent?.details}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
