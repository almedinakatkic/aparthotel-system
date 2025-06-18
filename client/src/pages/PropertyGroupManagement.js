import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/PropertyManagement.css';

const PropertyGroupManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [owners, setOwners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get(`/property-group/company/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedGroups = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setGroups(sortedGroups);
    } catch (err) {
      setError('Failed to load property groups');
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get(`/users/company/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ownerUsers = res.data.filter(u => u.role === 'owner');
      setOwners(ownerUsers);
    } catch (err) {
      console.error('Failed to fetch owners', err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchOwners();
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

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterLocation === '' || group.location === filterLocation) &&
    (filterType === '' || group.type === filterType)
  );

  const getOwnerName = (groupId) => {
    const matched = owners.find(o => o.propertyGroupId === groupId);
    return matched ? matched.name : '-';
  };

  return (
    <div className="property-container">
      <h1 className="property-title" style={{ color: '#193A6F' }}>Manage Properties</h1>
      <button className="add-property-button" onClick={() => navigate('/create-property-group')}>
        + Add Property
      </button>

      <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="property-input"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="property-input custom-select"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="">Filter by Location</option>
          {[...new Set(groups.map(g => g.location))].map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          className="property-input custom-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Filter by Type</option>
          <option value="hotel">Hotel</option>
          <option value="apartment">Apartment</option>
        </select>
      </div>

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
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map(group => (
              <tr key={group._id}>
                <td>{editingId === group._id ? <input name="name" value={formData.name} onChange={handleChange} /> : group.name}</td>
                <td>{editingId === group._id ? <input name="location" value={formData.location} onChange={handleChange} /> : group.location}</td>
                <td>{editingId === group._id ? <input name="address" value={formData.address} onChange={handleChange} /> : (group.address || '-')}</td>
                <td>{editingId === group._id ? (
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="hotel">Hotel</option>
                    <option value="apartment">Apartment</option>
                  </select>
                ) : (
                  group.type.replace('_', ' ')
                )}</td>
                <td>{getOwnerName(group._id)}</td>
                <td>
                  {editingId === group._id ? (
                    <>
                      <button onClick={handleUpdate}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(group)}>Edit</button>
                      <button onClick={() => handleDelete(group._id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
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