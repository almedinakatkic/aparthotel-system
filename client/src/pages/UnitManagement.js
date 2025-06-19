import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/ManageUnitsStyle.css';

const UnitManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [filters, setFilters] = useState({
    propertyGroupId: '',
    unitNumber: '',
    floor: '',
    beds: '',
    maxPrice: '',
    address: '',
    location: ''
  });
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
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
      } catch (err) {
        setError('Failed to load property groups');
      }
    };
    fetchGroups();
  }, [user.companyId]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get(`/units`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data);
      } catch (err) {
        setError('Failed to fetch units');
      }
    };
    fetchUnits();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });

    if (name === 'propertyGroupId') {
      const selected = propertyGroups.find(pg => pg._id === value);
      setSelectedPropertyType(selected?.type || '');
    }
  };

  const filteredUnits = units
    .filter(unit => {
      const matchesProperty = !filters.propertyGroupId || unit.propertyGroupId?._id === filters.propertyGroupId;
      const matchesUnit = !filters.unitNumber || String(unit.unitNumber) === filters.unitNumber;
      const matchesFloor = !filters.floor || String(unit.floor) === filters.floor;
      const matchesBeds = !filters.beds || String(unit.beds) === filters.beds;
      const matchesPrice = !filters.maxPrice || unit.pricePerNight <= parseFloat(filters.maxPrice);
      const matchesAddress = !filters.address || (unit.address || '').toLowerCase().includes(filters.address.toLowerCase());
      const matchesLocation = !filters.location || (unit.propertyGroupId?.location || '').toLowerCase().includes(filters.location.toLowerCase());
      return matchesProperty && matchesUnit && matchesFloor && matchesBeds && matchesPrice && matchesAddress && matchesLocation;
    })
    .sort((a, b) => parseInt(a.unitNumber) - parseInt(b.unitNumber));

  const handleEdit = (unit) => {
    setEditingUnit(unit._id);
    setFormData({
      ...unit,
      location: unit.propertyGroupId?.location || '',
    });
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
      const res = await api.get(`/units`, { headers: { Authorization: `Bearer ${token}` } });
      setUnits(res.data);
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
      const res = await api.get(`/units`, { headers: { Authorization: `Bearer ${token}` } });
      setUnits(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="rooms-container">
      <h1 className="title">Unit Management</h1>
      <button className="unit-button" onClick={() => navigate('/create-unit')} style={{ marginBottom: '1rem' }}>+ Add Unit</button>

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="propertySelect" style={{ fontWeight: '700', color: '#193A6F', whiteSpace: 'nowrap' }}>
            Filter by Property:
          </label>
          <select
            id="propertySelect"
            className="unit-input"
            name="propertyGroupId"
            value={filters.propertyGroupId}
            onChange={handleFilterChange}
            style={{ flex: 1 }}
          >
            <option value="">Select Property</option>
            {propertyGroups.map(pg => (
              <option key={pg._id} value={pg._id}>{pg.name}</option>
            ))}
          </select>
          {selectedPropertyType === 'apartment' && (
            <>
              <input
                type="text"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                placeholder="Filter by Address"
                className="unit-input"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Filter by Location"
                className="unit-input"
                style={{ flex: 1 }}
              />
            </>
          )}
        </div>

        {filters.propertyGroupId && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="number" name="unitNumber" value={filters.unitNumber} onChange={handleFilterChange} placeholder="Unit Number" className="unit-input" style={{ flex: 1 }} />
            <input type="number" name="floor" value={filters.floor} onChange={handleFilterChange} placeholder="Floor" className="unit-input" style={{ flex: 1 }} />
            <input type="number" name="beds" value={filters.beds} onChange={handleFilterChange} placeholder="Beds" className="unit-input" style={{ flex: 1 }} />
            <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max Price" className="unit-input" style={{ flex: 1 }} />
          </div>
        )}
      </div>

      {filters.propertyGroupId && (
        <>
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
                  {selectedPropertyType === 'apartment' && <th>Address</th>}
                  {selectedPropertyType === 'apartment' && <th>Location</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(unit => (
                  <tr key={unit._id}>
                    <td>{editingUnit === unit._id ? <input name="unitNumber" type="number" value={formData.unitNumber} onChange={handleChange} /> : unit.unitNumber}</td>
                    <td>{editingUnit === unit._id ? <input name="floor" type="number" value={formData.floor} onChange={handleChange} /> : unit.floor}</td>
                    <td>{editingUnit === unit._id ? <input name="beds" type="number" value={formData.beds} onChange={handleChange} /> : unit.beds}</td>
                    <td>{editingUnit === unit._id ? <input name="pricePerNight" type="number" value={formData.pricePerNight} onChange={handleChange} /> : `${unit.pricePerNight}€`}</td>
                    {selectedPropertyType === 'apartment' && (
                      <td>{editingUnit === unit._id ? <input name="address" value={formData.address || ''} onChange={handleChange} /> : (unit.address || '-')}</td>
                    )}
                    {selectedPropertyType === 'apartment' && (
                      <td>{editingUnit === unit._id ? <input name="location" value={formData.location || ''} onChange={handleChange} /> : (unit.propertyGroupId?.location || '-')}</td>
                    )}
                    <td>
                      {editingUnit === unit._id ? (
                        <>
                          <button onClick={handleUpdate}>Save</button>
                          <button onClick={handleCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className='action-button-edit' onClick={() => handleEdit(unit)}>Edit</button>
                          <button className='action-button-delete' onClick={() => handleDelete(unit._id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UnitManagement;