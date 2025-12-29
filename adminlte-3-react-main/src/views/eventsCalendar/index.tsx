"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
} from "date-fns";
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
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 11, 29)); // Defaulting to Dec 29, 2025 as per screenshot
  const [view, setView] = React.useState("Month view");

  // Mock events based on the screenshot
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);

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
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Calendar Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
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
                onClick={prevMonth}
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
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4 text-neutral-600" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="h-9 gap-2 border-neutral-200 px-4 text-sm font-medium text-neutral-700 bg-transparent"
            >
              {view}
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </Button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
          {/* Day Headers */}
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

          {/* Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const isSelected = isSameDay(day, currentDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative min-h-[140px] border-r border-b border-neutral-200 p-2 transition-colors last:border-r-0",
                    !isCurrentMonth && "bg-neutral-50/30",
                    isSelected && "bg-indigo-50/20"
                  )}
                  onClick={() => setCurrentDate(day)}
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center text-sm font-medium transition-colors",
                      !isCurrentMonth ? "text-neutral-300" : "text-neutral-900",
                      isToday(day) && "rounded-full bg-indigo-600 text-white"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="mt-2 flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-[11px] font-medium transition-shadow hover:shadow-sm",
                          colorStyles[event.color]
                        )}
                      >
                        <span className="truncate">{event.title}</span>
                        <span className="ml-1 shrink-0 opacity-60">
                          {event.time}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
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
    </main>
  );
}
