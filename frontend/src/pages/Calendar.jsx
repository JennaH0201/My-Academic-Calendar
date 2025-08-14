import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


const Calendar = (date) => {
    const currentYear = new Date(date).getFullYear();
    const currentMonth = new Date(date).getMonth() + 1;
  
    const firstDay = new Date(date.setDate(1)).getDay();
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  
    const limitDay = firstDay + lastDay;
    const nextDay = Math.ceil(limitDay / 7) * 7;
  
    let htmlDummy = '';
  
    for (let i = 0; i < firstDay; i++) {
      htmlDummy += `<div class="noColor"></div>`;
    }
  
    for (let i = 1; i <= lastDay; i++) {    
      htmlDummy += `<div>${i}</div>`;
    }
  
    for (let i = limitDay; i < nextDay; i++) {
      htmlDummy += `<div class="noColor"></div>`;
    }
  
    document.querySelector(`.dateBoard`).innerHTML = htmlDummy;
    document.querySelector(`.dateTitle`).innerText = `${currentYear} ${currentMonth}`;
  }

const data = [
    { date: '2022-10-15', content: '테스트1' },
    { date: '2022-10-03', content: '테스트2' },
    { date: '2022-10-15', content: '테스트3' },
    { date: '2022-10-26', content: '테스트4' },
    { date: '2022-10-21', content: '테스트5' },
  ];

const calendarList = data.reduce(
    (acc, v) => 
      ({ ...acc, [v.date]: [...(acc[v.date] || []), v.content] })
    , {}
  );
  
  Number.prototype.pad = function() {
    return this > 9 ? this : '0' + this;
  }

    const currentYear = new Date(date).getFullYear();
    const currentMonth = new Date(date).getMonth() + 1;
  
    const firstDay = new Date(date.setDate(1)).getDay();
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  
    const limitDay = firstDay + lastDay;
    const nextDay = Math.ceil(limitDay / 7) * 7;
  
    let htmlDummy = '';
  
    for (let i = 0; i < firstDay; i++) {
      htmlDummy += `<div class="noColor"></div>`;
    }
  
    for (let i = 1; i <= lastDay; i++) {
      const date = `${currentYear}-${currentMonth.pad()}-${i.pad()}`
      
      htmlDummy += `
        <div>
          ${i}
          <p>
            ${calendarList[date]?.join('</p><p>') || ''}
          </p>
        </div>
      `;
    }
  
    for (let i = limitDay; i < nextDay; i++) {
      htmlDummy += `<div class="noColor"></div>`;
    }
    
    document.querySelector(`.dateBoard`).innerHTML = htmlDummy;
    document.querySelector(`.dateTitle`).innerText = `${currentYear} ${currentMonth}`;
  

const date = new Date();
  
  Calendar(date);