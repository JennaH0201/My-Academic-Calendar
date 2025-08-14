import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
  
  function CalendarwithEvents() {
    const events = [
      { title: 'dueDate', date: '2024-08-17' },
      { title: 'finalExam', date: '2024-10-27' },
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