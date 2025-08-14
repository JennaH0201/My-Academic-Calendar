import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar() {
  const { user } = useAuth();
  const token = user?.token || null;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);


  const fetchData = useCallback(
    async (startStr, endStr) => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        
        const [evRes, dlRes] = await Promise.all([
          axiosInstance.get('/api/calendar/events', {
            params: { semester: '2025S2', from: startStr, to: endStr },
            headers,
          }),
          axiosInstance.get('/api/assignments/deadlines', {
            params: { dueAfter: startStr, dueBefore: endStr, status: 'pending' },
            headers,
          }),
        ]);

        const acad = (evRes.data?.items || []).map((e) => ({
          id: `acad-${e._id}`,
          title: e.title,
          start: e.startDate,
          end: e.endDate || e.startDate,
          allDay: true,
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
        }));

        const dls = (dlRes.data?.items || []).map((a) => ({
          id: `dl-${a._id}`,
          title: `[Due] ${a.courseId} ${a.title}`,
          start: a.dueDate,
          allDay: true,
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
        }));

        setEvents([...acad, ...dls]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return (
    <div className="p-4">
      {loading && <div className="text-sm mb-2">Loading…</div>}

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        firstDay={1}                   
        height="auto"
        events={events}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}

        datesSet={({ startStr, endStr }) => fetchData(startStr, endStr)}
       
      />
    </div>
  );
}
