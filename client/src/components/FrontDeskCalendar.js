import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  getDay,
  startOfYear,
  endOfYear,
  addMonths as addMonthToDate
} from 'date-fns';

const FrontDeskCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const goToToday = () => setCurrentDate(new Date());

  const prevPeriod = () => {
    if (viewMode === 'year') {
      setCurrentDate(subYears(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate((prev) => subMonths(prev, 0) && new Date(prev.setDate(prev.getDate() - 7)));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'year') {
      setCurrentDate(addYears(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate((prev) => addMonths(prev, 0) && new Date(prev.setDate(prev.getDate() + 7)));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeks = [];
    let week = [];

    for (let i = 0; i < getDay(monthStart); i++) {
      week.push(null);
    }

    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return (
      <>
        <div className="weekdays-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="weekday">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="week-row month-view">
            {week.map((day, j) => (
              <div
                key={j}
                className={`day-cell ${day ? '' : 'empty'} ${day && isSameDay(day, new Date()) ? 'today' : ''}`}
              >
                {day && (
                  <>
                    <div className="day-number">{format(day, 'd')}</div>
                    <div className="day-events"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <>
        <div className="week-range-label">
          {format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')}
        </div>
        <div className="week-row week-view">
          {days.map((day, i) => (
            <div
              key={i}
              className={`day-cell wide-cell ${isSameDay(day, new Date()) ? 'today' : ''}`}
            >
              <div className="day-number">{format(day, 'EEE d')}</div>
              <div className="day-events"></div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const months = Array.from({ length: 12 }, (_, i) => addMonthToDate(yearStart, i));

    return (
      <div className="year-view">
        <div className="year-grid">
          {months.map((month) => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const firstDayOfMonth = getDay(monthStart);

            return (
              <div key={format(month, 'MMM')} className="month-cell">
                <div className="month-header">{format(month, 'MMM')}</div>
                <div className="month-days">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                    <div key={d} className="weekday-tiny">{d}</div>
                  ))}
                  {Array(firstDayOfMonth).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="day-tiny empty"></div>
                  ))}
                  {days.map((day) => (
                    <div
                      key={day.toString()}
                      className={`day-tiny ${isSameDay(day, new Date()) ? 'today' : ''}`}
                    >
                      {format(day, 'd')}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeaderLabel = () => {
    if (viewMode === 'year') return format(currentDate, 'yyyy');
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`;
    }
  };

  return (
    <div className="front-desk-calendar">
      <div className="calendar-header">
        <div className="view-options">
          <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
          <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
          <button className={viewMode === 'year' ? 'active' : ''} onClick={() => setViewMode('year')}>Year</button>
        </div>

        <div className="period-navigation">
          <h2>{renderHeaderLabel()}</h2>
          <button onClick={prevPeriod}>&lt;</button>
          <button className="today-btn" onClick={goToToday}> - </button>
          <button onClick={nextPeriod}>&gt;</button>
        </div>

        <div className="search-add">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by room number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-booking-btn" onClick={() => setShowBookingForm(true)}>Add booking</button>
        </div>
      </div>

      <div className="calendar-grid">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'year' && renderYearView()}
      </div>

      {showBookingForm && (
        <div className="booking-modal">
          <div className="modal-content">
            <h3>Add New Booking</h3>
            <button onClick={() => setShowBookingForm(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontDeskCalendar;
