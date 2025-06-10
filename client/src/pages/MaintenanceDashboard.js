import React, { useState } from 'react';
import '../assets/styles/maintenanceTasks.css';

const MaintenanceDashboard = () => {
  const maintenanceTasks = [
    {
      room: '202',
      apartment: 'Apt B202',
      type: 'Maintenance',
      issue: 'Leaky faucet in bathroom',
      date: '2025-06-10',
      time: '14:00',
      status: 'Pending'
    },
    {
      room: '304',
      apartment: 'Apt C304',
      type: 'Maintenance',
      issue: 'AC not working',
      date: '2025-06-11',
      time: '09:30',
      status: 'Pending'
    },
    {
      room: '105',
      apartment: 'Apt A105',
      type: 'Maintenance',
      issue: 'Broken window in living room',
      date: '2025-06-12',
      time: '11:00',
      status: 'Pending'
    },
    {
      room: '401',
      apartment: 'Apt D401',
      type: 'Maintenance',
      issue: 'Water heater malfunction',
      date: '2025-06-13',
      time: '08:00',
      status: 'Pending'
    },
    {
      room: '212',
      apartment: 'Apt B212',
      type: 'Maintenance',
      issue: 'Clogged kitchen sink',
      date: '2025-06-14',
      time: '13:30',
      status: 'Pending'
    },
    {
      room: '309',
      apartment: 'Apt C309',
      type: 'Maintenance',
      issue: 'Door lock replacement',
      date: '2025-06-15',
      time: '10:00',
      status: 'Pending'
    },
    {
      room: '108',
      apartment: 'Apt A108',
      type: 'Maintenance',
      issue: 'Power outlet not working',
      date: '2025-06-16',
      time: '15:45',
      status: 'Pending'
    }
  ];

  const [tasks, setTasks] = useState(maintenanceTasks);

  const toggleStatus = (index) => {
    const updated = [...tasks];
    updated[index].status = updated[index].status === 'Done' ? 'Pending' : 'Done';
    setTasks(updated);
  };

  return (
    <div className="maintenance-dashboard">
      <h2>Maintenance Tasks</h2>
      <div className="maintenance-task-list">
        {tasks.map((task, index) => (
          <div key={index} className={`maintenance-card ${task.status === 'Done' ? 'done' : ''}`}>
            <h4>Room {task.room} — {task.apartment}</h4>
            <p><strong>Date:</strong> {task.date}</p>
            <p><strong>Time:</strong> {task.time}</p>
            <p><strong>Issue:</strong> {task.issue}</p>
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

export default MaintenanceDashboard;
