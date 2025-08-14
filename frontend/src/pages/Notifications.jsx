import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

import axiosInstance from '../axiosConfig';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Notifications() {
  const { user } = useAuth();
  const token = user?.token || null;
  const calRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const mapAcad = (e, subscribed) => ({
    id: `acad:${e._id}`,
    title: e.title,
    start: e.startDate,
    end: e.endDate || e.startDate,
    allDay: true,
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    classNames: subscribed ? ['notify-on'] : [],
    extendedProps: { type: 'acad', subscribed },
  });

  const fetchData = useCallback(async (startStr, endStr) => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [evRes, subRes] = await Promise.all([
        axiosInstance.get('/api/calendar/events', { params: { from: startStr, to: endStr }, headers }),
        axiosInstance.get('/api/notifications/subscriptions', { params: { from: startStr, to: endStr }, headers }),
      ]);

      const subsByEvent = new Map(
        (subRes.data?.items || []).map(s => [String(s.eventId), s])
      );

      const acad = (evRes.data?.items || []).map(e => mapAcad(e, !!subsByEvent.get(String(e._id))));
      setEvents(acad);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="p-4">
      {loading && <div className="text-sm mb-2">Loading…</div>}
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        height="auto"
        events={events}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        datesSet={({ startStr, endStr }) => fetchData(startStr, endStr)}
        selectable={false}
        editable={false}    
      />
    </div>
  );
}