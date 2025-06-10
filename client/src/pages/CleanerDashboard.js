import React, { useState } from 'react';
import '../assets/styles/taskAssignment.css';

const CleanerDashboard = () => {
  const cleanerName = 'Elma';

  const initialTasks = [
    {
      room: '101',
      apartment: 'Apt A101',
      type: 'Cleaning',
      cleaningType: 'Regular Cleaning',
      date: '2025-06-10',
      time: '09:00',
      status: 'Pending'
    },
    {
      room: '103',
      apartment: 'Apt A102',
      type: 'Cleaning',
      cleaningType: 'Deep Cleaning',
      date: '2025-06-10',
      time: '11:00',
      status: 'Pending'
    },
    {
      room: '201',
      apartment: 'Apt B201',
      type: 'Cleaning',
      cleaningType: 'Regular Cleaning',
      date: '2025-06-11',
      time: '10:30',
      status: 'Pending'
    },
    {
      room: '301',
      apartment: 'Apt C301',
      type: 'Cleaning',
      cleaningType: 'Deep Cleaning',
      date: '2025-06-12',
      time: '08:00',
      status: 'Pending'
    },
    {
      room: '104',
      apartment: 'Apt A104',
      type: 'Cleaning',
      cleaningType: 'Regular Cleaning',
      date: '2025-06-12',
      time: '13:00',
      status: 'Pending'
    }
  ];

  const [tasks, setTasks] = useState(initialTasks);

  const toggleStatus = (index) => {
    const updated = [...tasks];
    updated[index].status = updated[index].status === 'Done' ? 'Pending' : 'Done';
    setTasks(updated);
  };

  return (
    <div className="task-dashboard">
      <h2>{cleanerName}'s Cleaning Tasks</h2>

      <div className="task-list">
        {tasks.map((task, index) => (
          <div key={index} className={`task-card ${task.status === 'Done' ? 'done' : ''}`}>
            <h4>Room {task.room} — {task.apartment}</h4>
            <p><strong>Date:</strong> {task.date}</p>
            <p><strong>Time:</strong> {task.time}</p>
            <p><strong>Type:</strong> {task.cleaningType}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <button onClick={() => toggleStatus(index)}>
              {task.status === 'Done' ? 'Undo' : 'Mark as Done'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleanerDashboard;
