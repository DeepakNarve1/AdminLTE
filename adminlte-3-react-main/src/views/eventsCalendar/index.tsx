"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ContentHeader } from "@app/components";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
}

export default function EventsCalendarView() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: -1 },
      });

      setEvents(
        data.data.map((e: any) => ({
          id: e._id,
          title: e.eventType,
          start: e.programDate,
        }))
      );
    };

    fetchEvents();
  }, []);

  return (
    <>
      <ContentHeader title="Events Calendar" />

      <section className="content">
        <div className="container-fluid px-6 py-6">
          {/* Soft background wrapper */}
          <div className="bg-neutral-50 dark:bg-neutral-950 rounded-2xl p-6">
            {/* Calendar Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
                fixedWeekCount={false}
                showNonCurrentDates={false}
                dayMaxEvents={2}
                eventDisplay="block"
                eventClick={(info) =>
                  router.push(`/events/${info.event.id}/view`)
                }
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
