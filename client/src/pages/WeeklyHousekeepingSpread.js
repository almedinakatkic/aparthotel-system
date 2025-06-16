import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/WeeklyHousekeepingSpread.css';

const WeeklyHousekeepingCalendar = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfCurrentWeek());

  function getStartOfCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/${user.propertyGroupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchTasks();
  }, [user.propertyGroupId, token]);

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
    setCurrentWeekStart(getStartOfCurrentWeek());
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    return hour >= 12
      ? `${hour === 12 ? 12 : hour - 12}:${minutes} PM`
      : `${hour}:${minutes} AM`;
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => task.date && task.date.startsWith(dateStr));
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
      await api.put(`/tasks/status/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
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
                    <div key={task._id} className={`task-card ${task.type} ${task.status}`}>
                      <div className="task-header">
                        <span className="room">{task.unitId?.unitNumber || 'N/A'}</span>
                        <span className="time">{task.time ? formatTime(task.time) : ''}</span>
                      </div>
                      <div className="task-issue">
                        {task.issue || (task.type === 'cleaning' ? 'Cleaning task' : 'Maintenance task')}
                      </div>
                      <button
                        onClick={() => toggleTaskStatus(task._id, task.status)}
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
