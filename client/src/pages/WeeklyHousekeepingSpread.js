import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../assets/styles/WeeklyHousekeepingSpread.css'; 

const WeeklyHousekeepingCalendar = () => {
  const [tasks, setTasks] = useState([
    { id: 1, room: '202 — Apt B202', date: '2025-06-10', time: '14:00', issue: 'Leaky faucet in bathroom', type: 'maintenance', status: 'pending' },
    { id: 2, room: '304 — Apt C304', date: '2025-06-11', time: '09:30', issue: 'AC not working', type: 'maintenance', status: 'pending' },
    { id: 3, room: '105 — Apt A105', date: '2025-06-12', time: '11:00', issue: 'Broken window in living room', type: 'maintenance', status: 'pending' },
    { id: 4, room: '401 — Apt D401', date: '2025-06-13', time: '08:00', issue: 'Water heater malfunction', type: 'maintenance', status: 'pending' },
    { id: 5, room: '212 — Apt B212', date: '2025-06-10', time: '10:00', issue: 'Regular cleaning', type: 'cleaning', status: 'pending' },
    { id: 6, room: '309 — Apt C309', date: '2025-06-11', time: '13:00', issue: 'Deep cleaning', type: 'cleaning', status: 'pending' }
  ]);

  const [currentWeekStart, setCurrentWeekStart] = useState(new Date('2025-06-09'));

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => task.date === dateStr);
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'pending' ? 'done' : 'pending' }
        : task
    ));
  };

  const weekDates = getWeekDates();

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <button onClick={prevWeek} className="nav-button">
          <FiChevronLeft size={20} />
        </button>

        <div className="week-title">
          <h2>{formatWeekRange()}</h2>
          <button onClick={goToCurrentWeek} className="current-week-button">
            Today
          </button>
        </div>

        <button onClick={nextWeek} className="nav-button">
          <FiChevronRight size={20} />
        </button>
      </div>

      <div className="week-grid">
        {weekDates.map((date, index) => {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = date.getDate();
          const isToday = formatDate(date) === formatDate(new Date());
          const dailyTasks = getTasksForDate(date);

          return (
            <div key={index} className={`day-column ${isToday ? 'today' : ''}`}>
              <div className="day-header">
                <div className="day-name">{dayName}</div>
                <div className="day-number">{monthDay}</div>
              </div>

              <div className="tasks-container">
                {dailyTasks.length > 0 ? (
                  dailyTasks.map(task => (
                    <div key={task.id} className={`task-card ${task.type} ${task.status}`}>
                      <div className="task-header">
                        <span className="room">{task.room}</span>
                        <span className="time">{formatTime(task.time)}</span>
                      </div>
                      <div className="task-issue">{task.issue}</div>
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`status-button ${task.status}`}
                      >
                        {task.status === 'pending' ? 'Mark as Done' : 'Undo'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-tasks">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyHousekeepingCalendar;
