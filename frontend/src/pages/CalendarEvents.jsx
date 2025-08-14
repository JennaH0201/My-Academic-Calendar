import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
  
  function CalendarwithEvents() {
    const events = [
      { title: 'Meeting', date: '2024-08-15' },
      { title: 'Conference', date: '2024-08-20' },
    ];

    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
    );
  }

  export default CalendarwithEvents;