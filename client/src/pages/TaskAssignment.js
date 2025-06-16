import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/taskAssignment.css';

const TaskAssignment = () => {
  const { user, token } = useAuth();
  const [units, setUnits] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [taskType, setTaskType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCleaner, setFilterCleaner] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resUnits, resUsers, resTasks] = await Promise.all([
          api.get('/units', { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/users/company/${user.companyId}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/tasks/${user.propertyGroupId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const housekeeping = resUsers.data.filter(u => u.role === 'housekeeping');
        const sortedUnits = resUnits.data
          .filter(u => u.propertyGroupId === user.propertyGroupId || u.propertyGroupId?._id === user.propertyGroupId)
          .sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber));

        setUnits(sortedUnits);
        setCleaners(housekeeping);
        setTasks(resTasks.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };

    fetchInitialData();
  }, [user.companyId, user.propertyGroupId, token]);

  const handleAssignTask = async () => {
    if (!selectedUnit || !selectedCleaner || !taskType || !selectedDate) {
      return alert('Please select unit, cleaner, task type, and date.');
    }

    try {
      await api.post('/tasks', {
        unitId: selectedUnit,
        assignedTo: selectedCleaner,
        type: taskType,
        date: selectedDate,
        propertyGroupId: user.propertyGroupId
      }, { headers: { Authorization: `Bearer ${token}` } });

      const updated = await api.get(`/tasks/${user.propertyGroupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(updated.data);

      setSelectedUnit('');
      setSelectedCleaner('');
      setTaskType('');
      setSelectedDate('');
    } catch (err) {
      console.error('Error assigning task:', err);
      alert('Failed to assign task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesType = filterType ? task.type === filterType : true;
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    const matchesCleaner = filterCleaner
      ? (task.assignedTo?._id || task.assignedTo) === filterCleaner
      : true;
    return matchesType && matchesStatus && matchesCleaner;
  });

  return (
    <div className="task-assignment-container">
      <h2>Task Assignment</h2>

      <div className="form-group">
        <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}>
          <option value="">Select Unit</option>
          {units.map(u => (
            <option key={u._id} value={u._id}>{u.unitNumber}</option>
          ))}
        </select>

        <select value={selectedCleaner} onChange={e => setSelectedCleaner(e.target.value)}>
          <option value="">Assign to Staff</option>
          {cleaners.map(c => (
            <option key={c._id} value={c._id}>{c.name} {c.surname}</option>
          ))}
        </select>

        <select value={taskType} onChange={e => setTaskType(e.target.value)}>
          <option value="">Select Task Type</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={today} />

        <button onClick={handleAssignTask}>Assign Task</button>
      </div>

      <div className="filter-row">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>

        <select value={filterCleaner} onChange={e => setFilterCleaner(e.target.value)}>
          <option value="">All Staff</option>
          {cleaners.map(c => (
            <option key={c._id} value={c._id}>{c.name} {c.surname}</option>
          ))}
        </select>
      </div>

      <div className="tasks-list">
        {filteredTasks.map(task => {
          const unit = units.find(u => u._id === (task.unitId?._id || task.unitId));
          const cleaner = cleaners.find(c => c._id === (task.assignedTo?._id || task.assignedTo));
          return (
            <div key={task._id} className={`task-card ${task.status === 'done' ? 'done' : 'pending'}`}>
              <p><strong>Room:</strong> {unit?.unitNumber || 'N/A'}</p>
              <p><strong>Task:</strong> {task.type}</p>
              <p><strong>Assigned to:</strong> {cleaner ? cleaner.name : 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(task.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {task.status}</p>
              {task.type === 'cleaning' && task.status === 'done' && task.cleaningType && (
                <p><strong>Cleaning Type:</strong> {task.cleaningType}</p>
              )}
              {task.status === 'done' && (
                <button onClick={() => handleDeleteTask(task._id)}>Remove</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskAssignment;