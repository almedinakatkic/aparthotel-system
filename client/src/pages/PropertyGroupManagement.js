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
    setFormData({
      ...group,
      companyShare: group.companyShare ?? 30,
      ownerShare: group.ownerShare ?? 70
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setError('');
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const num = ['companyShare', 'ownerShare'].includes(name) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: num }));
  };

  const handleUpdate = async () => {
    if (Number(formData.companyShare) + Number(formData.ownerShare) !== 100) {
      setError('Company and Owner shares must add up to 100%');
      return;
    }
    try {
      await api.put(`/property-group/update/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Property group updated');
      setError('');
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

  const getOwnerName = (groupId) => {
    const matched = owners.find(o => o.propertyGroupId === groupId);
    return matched ? matched.name : '-';
  };

  const filteredGroups = groups.filter(group => {
    const search = searchTerm.toLowerCase();
    const ownerName = getOwnerName(group._id).toLowerCase();
    return (
      (group.name.toLowerCase().includes(search) ||
        (group.address || '').toLowerCase().includes(search) ||
        ownerName.includes(search)) &&
      (filterLocation === '' || group.location === filterLocation) &&
      (filterType === '' || group.type === filterType)
    );
  });

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
          placeholder="Search by name, owner, or address..."
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
                <td>
                  {editingId === group._id ? (
                    formData.type === 'hotel' ? (
                      <input name="address" value={formData.address} onChange={handleChange} />
                    ) : (
                      <input name="address" value="-" disabled />
                    )
                  ) : (
                    group.type === 'hotel' ? (group.address || '-') : '-'
                  )}
                </td>
                <td>
                  {editingId === group._id ? (
                    <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="hotel">Hotel</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  ) : (
                    group.type
                  )}
                </td>
                <td>{getOwnerName(group._id)}</td>
                <td>
                  {editingId === group._id ? (
                    <>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label>Company Share (%)</label><br />
                        <input
                          type="number"
                          name="companyShare"
                          value={formData.companyShare}
                          onChange={handleChange}
                          min={0}
                          max={100}
                          style={{ width: '80px', marginRight: '1rem' }}
                        />
                        <label>Owner Share (%)</label><br />
                        <input
                          type="number"
                          name="ownerShare"
                          value={formData.ownerShare}
                          onChange={handleChange}
                          min={0}
                          max={100}
                          style={{ width: '80px' }}
                        />
                      </div>
                      <button onClick={handleUpdate}>Save</button>
                      <button onClick={handleCancel} style={{ marginLeft: '0.5rem' }}>Cancel</button>
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
