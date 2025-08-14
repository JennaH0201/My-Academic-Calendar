import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function NotificationSettings() {
  const { user } = useAuth();
  const token = user?.token || null;
  const calRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [subs, setSubs] = useState(new Map());       
  const [channel, setChannel] = useState('Email');   

  const headers = token ? { Authorization: `Bearer ${token}` } : {};


  const toApiChannel = (ch) => (ch === 'InApp' ? 'InApp' : 'Email');
  const toUiChannel  = (api) => (api === 'InApp' ? 'InApp' : 'Email');

  const mapAcad = (e, sub) => ({
    id: `acad:${e._id}`,
    title: e.title,
    start: e.startDate,
    end: e.endDate || e.startDate,
    allDay: true,
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    classNames: sub ? ['notify-on'] : [],
    extendedProps: { type: 'acad', subscription: sub || null },
  });

  const fetchData = useCallback(async (startStr, endStr) => {
    const [evRes, subRes] = await Promise.all([
      axiosInstance.get('/api/calendar/events', { params: { from: startStr, to: endStr }, headers }),
      axiosInstance.get('/api/notifications/subscriptions', { params: { from: startStr, to: endStr }, headers }),
    ]);

    const subMap = new Map();
    for (const s of (subRes.data?.items || [])) {
    
      subMap.set(String(s.eventId), { ...s, channel: toUiChannel(s.channel) });
    }
    setSubs(subMap);

    const acad = (evRes.data?.items || []).map(e => mapAcad(e, subMap.get(String(e._id))));
    setEvents(acad);
  }, [token]); 

 
  const createSub = useCallback(async (eventId, minutesBefore, chUi) => {
    const { data } = await axiosInstance.post(
      '/api/notifications/subscriptions',
      { eventId, minutesBefore, channel: toApiChannel(chUi) },
      { headers }
    );
    return { ...data, channel: toUiChannel(data.channel) };
  }, [token]);

  const updateSub = useCallback(async (subId, patchUi) => {
    const patch = { ...patchUi };
    if (patch.channel) patch.channel = toApiChannel(patch.channel);
    const { data } = await axiosInstance.patch(`/api/notifications/subscriptions/${subId}`, patch, { headers });
    return { ...data, channel: toUiChannel(data.channel) };
  }, [token]);

  const deleteSub = useCallback(async (subId) => {
    await axiosInstance.delete(`/api/notifications/subscriptions/${subId}`, { headers });
  }, [token]);

 
  const refreshEventDecoration = (eventId, subscription) => {
    setEvents(prev => prev.map(ev => {
      const [type, raw] = String(ev.id).split(':');
      if (type === 'acad' && raw === String(eventId)) {
        const next = { ...ev };
        next.extendedProps = { ...next.extendedProps, subscription };
        next.classNames = subscription ? ['notify-on'] : [];
        return next;
      }
      return ev;
    }));
  };

  const onEventClick = async ({ event }) => {
    const [type, eventId] = String(event.id).split(':');
    if (type !== 'acad') return;

    const existing = subs.get(eventId) || null;

    if (!existing) {
      const input = window.prompt('Minutes before to notify? (default 30)', '30');
      if (input === null) return;
      const minutesBefore = Math.max(1, parseInt(input, 10) || 30);
      try {
        const created = await createSub(eventId, minutesBefore, channel);
        const nextSubs = new Map(subs);
        nextSubs.set(eventId, created);
        setSubs(nextSubs);
        refreshEventDecoration(eventId, created);
      } catch {
        alert('Failed to enable notification');
      }
      return;
    }


   
    const choice = window.prompt(
      `Notification is ON (${existing.channel}, minutesBefore=${existing.minutesBefore}).\n` +
      `Enter new minutesBefore to update, or leave blank to turn OFF.`,
      String(existing.minutesBefore)
    );
    if (choice === null) return;

    if (choice.trim() === '') {
      try {
        await deleteSub(existing._id);
        const nextSubs = new Map(subs);
        nextSubs.delete(eventId);
        setSubs(nextSubs);
        refreshEventDecoration(eventId, null);
      } catch {
        alert('Fail to disable notification');
      }
    } else {
      const minutesBefore = Math.max(1, parseInt(choice, 10) || existing.minutesBefore);
      try {
        const updated = await updateSub(existing._id, { minutesBefore });
        const nextSubs = new Map(subs);
        nextSubs.set(eventId, updated);
        setSubs(nextSubs);
        refreshEventDecoration(eventId, updated);
      } catch {
        alert('Fail to update notification');
      }
    }
  };

  // 채널 선택 버튼
  const Btn = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1 rounded border text-sm',
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300',
        'mr-2'
      ].join(' ')}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center">
        <span className="mr-3 text-sm font-semibold">Channel:</span>
        <Btn active={channel === 'email'}  onClick={() => setChannel('email')}>Email</Btn>
        <Btn active={channel === 'in-app'} onClick={() => setChannel('in-app')}>In-app</Btn>
        <span className="ml-4 text-xs text-gray-500">
          
        </span>
      </div>

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
        eventClick={onEventClick}
        dayMaxEventRows={3}
      />
    </div>
  );
}