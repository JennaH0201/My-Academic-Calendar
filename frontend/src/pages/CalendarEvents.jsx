import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

import axiosInstance from '../axiosConfig';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarEvents() {
  const { user } = useAuth();
  const token = user?.token || null;
  const calRef = useRef(null);

  const [events, setEvents] = useState([]);

  const mapAcad = (e) => ({
    id: `acad:${e._id}`, title: e.title,
    start: e.startDate, end: e.endDate || e.startDate, allDay: true,
    backgroundColor: '#3b82f6', borderColor: '#3b82f6',
  });
  const mapDeadline = (a) => ({
    id: `dl:${a._id}`, title: `[Due] ${a.courseId} ${a.title}`,
    start: a.dueDate, allDay: true,
    backgroundColor: '#ef4444', borderColor: '#ef4444',
  });
  const parseId = (fcId) => { const [type, raw] = String(fcId).split(':'); return { type, raw }; };

  const fetchData = useCallback(async (startStr, endStr) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const [evRes, dlRes] = await Promise.all([
      axiosInstance.get('/api/calendar/events', { params: { from: startStr, to: endStr }, headers }),
      axiosInstance.get('/api/assignments/deadlines', { params: { dueAfter: startStr, dueBefore: endStr, status: 'pending' }, headers }),
    ]);
    const acad = (evRes.data?.items || []).map(mapAcad);
    const dls  = (dlRes.data?.items || []).map(mapDeadline);
    setEvents([...acad, ...dls]);
  }, [token]);

  
  const onSelect = async ({ startStr, endStr }) => {
    const title = window.prompt('Event title');
    if (!title) return;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const tempId = `tmp:${Date.now()}`;
    setEvents((p) => [...p, { id: tempId, title, start: startStr, end: endStr, allDay: true,
      backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]);

    try {
      const res = await axiosInstance.post('/api/calendar/events',
        { title, startDate: startStr, endDate: endStr, type: 'term' }, { headers });
      const created = mapAcad(res.data);
      setEvents((p) => p.filter(e => e.id !== tempId).concat(created));
    } catch {
      setEvents((p) => p.filter(e => e.id !== tempId));
      alert('Create failed');
    }
  };

  
  const onEventDrop = async ({ event, revert }) => {
    const { type, raw } = parseId(event.id);
    if (type !== 'acad') { revert(); return; }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      await axiosInstance.patch(`/api/calendar/events/${raw}`, {
        startDate: event.start?.toISOString(),
        endDate: event.end?.toISOString() || event.start?.toISOString(),
      }, { headers });
    } catch { revert(); alert('Update failed'); }
  };

  
  const onEventResize = async ({ event, revert }) => {
    const { type, raw } = parseId(event.id);
    if (type !== 'acad') { revert(); return; }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      await axiosInstance.patch(`/api/calendar/events/${raw}`, {
        startDate: event.start?.toISOString(),
        endDate: event.end?.toISOString() || event.start?.toISOString(),
      }, { headers });
    } catch { revert(); alert('Resize failed'); }
  };

 
  const onEventClick = async ({ event }) => {
    const { type, raw } = parseId(event.id);
    if (type !== 'acad') return; // 마감은 금지
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      await axiosInstance.delete(`/api/calendar/events/${raw}`, { headers });
      event.remove();
    } catch { alert('Delete failed'); }
  };

  return (
    <div className="p-4">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        timeZone="Australia/Brisbane"
        height="auto"
        events={events}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        datesSet={({ startStr, endStr }) => fetchData(startStr, endStr)}
        selectable selectMirror selectOverlap
        select={onSelect}
        editable
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventClick={onEventClick}
        dayMaxEventRows={3}
      />
    </div>
  );
}

