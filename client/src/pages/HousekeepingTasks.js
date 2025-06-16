// HousekeepingTasks.js
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/taskAssignment.css';

const HousekeepingTasks = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [cleaningTypes, setCleaningTypes] = useState({});
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const [resTasks, resUnits] = await Promise.all([
          api.get(`/tasks/${user.propertyGroupId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/units', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const filtered = resTasks.data.filter(t => {
          const assigned = t.assignedTo?._id || t.assignedTo;
          return assigned === user._id;
        });

        setTasks(filtered);
        setUnits(resUnits.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, [user, token]);

  const handleComplete = async (task) => {
    if (task.type === 'cleaning' && !cleaningTypes[task._id]) {
      return alert('Please select cleaning type.');
    }

    try {
      await api.patch(`/tasks/${task._id}/complete`, {
        cleaningType: cleaningTypes[task._id]
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: 'done', cleaningType: cleaningTypes[task._id] } : t));
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const getUnitNumber = (id) => {
    const unit = units.find(u => u._id === (id?._id || id));
    return unit?.unitNumber || 'N/A';
  };

  return (
    <div className="task-assignment-container">
      <h2>My Assigned Tasks</h2>
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p>No tasks assigned to you.</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} className={`task-card ${task.status}`}>
              <p><strong>Room:</strong> {getUnitNumber(task.unitId)}</p>
              <p><strong>Type:</strong> {task.type}</p>
              <p><strong>Date:</strong> {new Date(task.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {task.status}</p>

              {task.status === 'pending' && task.type === 'cleaning' && (
                <div className="cleaning-type-row">
                  <select
                    className="cleaning-type-select"
                    value={cleaningTypes[task._id] || ''}
                    onChange={e => setCleaningTypes(prev => ({ ...prev, [task._id]: e.target.value }))}
                  >
                    <option value="">Select Cleaning Type</option>
                    <option value="regular">Regular</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>
              )}

              {task.status === 'pending' && (
                <div className="mark-done-row">
                  <button className="mark-done-button" onClick={() => handleComplete(task)}>Mark as Done</button>
                </div>
              )}

              {task.status === 'done' && task.cleaningType && task.type === 'cleaning' && (
                <p><strong>Cleaning Type:</strong> {task.cleaningType}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HousekeepingTasks;
