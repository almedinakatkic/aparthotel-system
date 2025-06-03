import React, { useState } from 'react';
import '../assets/styles/taskAssignment.css';

const cleaners = ['Elma', 'Haris', 'Nina', 'Tarik'];

const initialTasks = [
  {
    room: '101',
    apartment: 'Apt A101',
    assignedTo: 'Elma',
    type: 'Cleaning',
    date: '2025-06-05',
    time: '10:00',
    status: 'Pending'
  },
  {
    room: '201',
    apartment: 'Apt B202',
    assignedTo: 'Haris',
    type: 'Maintenance',
    issue: 'Air conditioner not cooling',
    urgency: 'High',
    date: '2025-06-06',
    time: '14:00',
    status: 'Pending'
  }
];

const TaskAssignment = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [form, setForm] = useState({
    room: '',
    apartment: '',
    assignedTo: '',
    type: 'Cleaning',
    date: '',
    time: '',
    issue: '',
    urgency: 'Low'
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      ...form,
      status: 'Pending'
    };
    setTasks([...tasks, newTask]);

    // Reset
    setForm({
      room: '',
      apartment: '',
      assignedTo: '',
      type: 'Cleaning',
      date: '',
      time: '',
      issue: '',
      urgency: 'Low'
    });
  };

  const markAsDone = (index) => {
    const updated = [...tasks];
    updated[index].status = 'Done';
    setTasks(updated);
  };

  return (
    <div className="task-dashboard">
      <h2>Cleaning & Maintenance Assignment</h2>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room Number"
          value={form.room}
          onChange={(e) => handleChange('room', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apartment"
          value={form.apartment}
          onChange={(e) => handleChange('apartment', e.target.value)}
          required
        />
        <select value={form.assignedTo} onChange={(e) => handleChange('assignedTo', e.target.value)} required>
          <option value="">-- Assign to Cleaner --</option>
          {cleaners.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
          <option value="Cleaning">Cleaning</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        {form.type === 'Maintenance' && (
          <>
            <textarea
              placeholder="Describe the issue"
              value={form.issue}
              onChange={(e) => handleChange('issue', e.target.value)}
              required
            />
            <select value={form.urgency} onChange={(e) => handleChange('urgency', e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </>
        )}

        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => handleChange('time', e.target.value)}
          required
        />

        <button type="submit">Assign Task</button>
      </form>

      <div className="task-list">
        <h3>Assigned Tasks</h3>
        {tasks.length === 0 ? <p>No tasks assigned.</p> : (
          tasks.map((task, index) => (
            <div key={index} className={`task-card ${task.status === 'Done' ? 'done' : ''}`}>
              <h4>{task.type} — Room {task.room} ({task.apartment})</h4>
              <p><strong>Assigned To:</strong> {task.assignedTo}</p>
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
          ))
        )}
      </div>
    </div>
  );
};

export default TaskAssignment;
