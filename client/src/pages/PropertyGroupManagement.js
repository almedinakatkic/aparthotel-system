import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const PropertyGroupManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get(`/property-group/company/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      setError('Failed to load property groups');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user.companyId]);

  const handleEdit = (group) => {
    setEditingId(group._id);
    setFormData({ ...group });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/property-group/update/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Property group updated');
      setEditingId(null);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this property group?');
    if (!confirm) return;
    try {
      await api.delete(`/property-group/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Property group deleted');
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="rooms-container">
      <h1 className="title">Manage Properties</h1>
      <button className="login-button" style={{ marginBottom: '1rem' }} onClick={() => navigate('/create-property-group')}>
        Add Property
      </button>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="rooms-table-container">
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Address</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group._id}>
                <td>{editingId === group._id ? <input name="name" value={formData.name} onChange={handleChange} /> : group.name}</td>
                <td>{editingId === group._id ? <input name="location" value={formData.location} onChange={handleChange} /> : group.location}</td>
                <td>{editingId === group._id ? <input name="address" value={formData.address} onChange={handleChange} /> : group.address}</td>
                <td>{editingId === group._id ? (
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="hotel">Hotel</option>
                    <option value="apartment_complex">Apartment Complex</option>
                    <option value="standalone_apartment">Standalone Apartment</option>
                  </select>
                ) : (
                  group.type.replace('_', ' ')
                )}</td>
                <td>
                  {editingId === group._id ? (
                    <>
                      <button onClick={handleUpdate}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(group)}>Edit</button>
                      <button onClick={() => handleDelete(group._id)} style={{ marginLeft: '0.5rem', color: 'red' }}>Delete</button>
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

export default PropertyGroupManagement;
