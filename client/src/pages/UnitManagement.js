import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const UnitManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedPropertyGroupId, setSelectedPropertyGroupId] = useState('');
  const [units, setUnits] = useState([]);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(res.data);
        setSelectedPropertyGroupId(res.data[0]?._id || '');
      } catch (err) {
        setError('Failed to load property groups');
      }
    };
    fetchGroups();
  }, [user.companyId]);

  useEffect(() => {
    if (selectedPropertyGroupId) {
      fetchUnits();
    }
  }, [selectedPropertyGroupId]);

  const fetchUnits = async () => {
    try {
      const res = await api.get(`/units/property/${selectedPropertyGroupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnits(res.data);
    } catch (err) {
      setError('Failed to fetch units');
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit._id);
    setFormData({ ...unit });
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setEditingUnit(null);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/units/update/${editingUnit}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Unit updated successfully');
      setEditingUnit(null);
      fetchUnits();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (unitId) => {
    const confirm = window.confirm('Are you sure you want to delete this unit?');
    if (!confirm) return;

    try {
      await api.delete(`/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Unit deleted');
      fetchUnits();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="rooms-container">
      <h1 className="title">Manage Units</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="login-button" onClick={() => navigate('/create-unit')}>
          Add a Unit
        </button>
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <label htmlFor="propertySelect" style={{ fontWeight: '600', color: 'white' }}>Filter by Property</label>
        <select
          id="propertySelect"
          className="login-input"
          value={selectedPropertyGroupId}
          onChange={(e) => setSelectedPropertyGroupId(e.target.value)}
        >
          {propertyGroups.map(pg => (
            <option key={pg._id} value={pg._id}>{pg.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="rooms-table-container">
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Unit Number</th>
              <th>Floor</th>
              <th>Beds</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map(unit => (
              <tr key={unit._id}>
                <td>{editingUnit === unit._id ? (
                  <input name="unitNumber" type="number" value={formData.unitNumber} onChange={handleChange} />
                ) : (
                  unit.unitNumber
                )}</td>
                <td>{editingUnit === unit._id ? (
                  <input name="floor" type="number" value={formData.floor} onChange={handleChange} />
                ) : (
                  unit.floor || '-' 
                )}</td>
                <td>{editingUnit === unit._id ? (
                  <input name="beds" type="number" value={formData.beds} onChange={handleChange} />
                ) : (
                  unit.beds || '-' 
                )}</td>
                <td>{editingUnit === unit._id ? (
                  <input name="pricePerNight" type="number" value={formData.pricePerNight} onChange={handleChange} />
                ) : (
                  unit.pricePerNight ? `${unit.pricePerNight}€` : '-' 
                )}</td>
                <td>
                  {editingUnit === unit._id ? (
                    <>
                      <button onClick={handleUpdate}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(unit)}>Edit</button>
                      <button onClick={() => handleDelete(unit._id)} style={{ marginLeft: '0.5rem', color: 'red' }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnitManagement;
