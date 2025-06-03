import React, { useState } from 'react';
import '../assets/styles/taskAssignment.css';

const CleanerDashboard = () => {
  const cleanerName = 'Elma';

  const initialTasks = [
    {
      room: '101',
      apartment: 'Apt A101',
      type: 'Cleaning',
      date: '2025-06-05',
      time: '10:00',
      status: 'Pending'
    },
    {
      room: '102',
      apartment: 'Apt A101',
      type: 'Maintenance',
      issue: 'Leaking sink in bathroom',
      urgency: 'Medium',
      date: '2025-06-06',
      time: '12:00',
      status: 'Pending'
    }
  ];

  const [tasks, setTasks] = useState(initialTasks);

  const markAsDone = (index) => {
    const updated = [...tasks];
    updated[index].status = 'Done';
    setTasks(updated);
  };

  return (
    <div className="task-dashboard">
      <h2>{cleanerName}'s Tasks</h2>

      <div className="task-list">
        {tasks.map((task, index) => (
          <div key={index} className={`task-card ${task.status === 'Done' ? 'done' : ''}`}>
            <h4>{task.type} — Room {task.room} ({task.apartment})</h4>
            <p><strong>Date:</strong> {task.date} at {task.time}</p>
            {task.type === 'Maintenance' && (
              <>
                <p><strong>Issue:</strong> {task.issue}</p>
                <p><strong>Urgency:</strong> {task.urgency}</p>
              </>
            )}
            <p><strong>Status:</strong> {task.status}</p>
            {task.status !== 'Done' && (
              <button onClick={() => markAsDone(index)}>Mark as Done</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleanerDashboard;
