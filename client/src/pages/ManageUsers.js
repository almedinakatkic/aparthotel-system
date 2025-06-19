import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../App.css';
import '../assets/styles/ManageUsers.css';
import { useAuth } from '../context/AuthContext';

const ManageUsers = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [filters, setFilters] = useState({ role: '', propertyGroupId: '', search: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, propsRes] = await Promise.all([
        api.get(`/users/company/${user.companyId}`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/property-group/company/${user.companyId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setPropertyGroups(propsRes.data);
    };
    fetchData();
  }, [user.companyId, token]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredUsers = users
    .filter(u => u.role !== 'manager')
    .filter(u => {
      const roleMatch = filters.role ? u.role === filters.role : true;
      const propertyMatch = filters.propertyGroupId
        ? (u.propertyGroupId?._id || u.propertyGroupId) === filters.propertyGroupId
        : true;
      const searchMatch =
        u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.phone?.toLowerCase().includes(filters.search.toLowerCase());
      return roleMatch && propertyMatch && searchMatch;
    });

  const openEdit = (u) => {
    setEditingUser(u);
    setEditData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      propertyGroupId: u.propertyGroupId?._id || u.propertyGroupId || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/users/${editingUser._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...editingUser, ...editData };
      setUsers(prev => prev.map(u => u._id === editingUser._id ? updated : u));
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="manage-users-container">
      <h1 className="title">Manage Users</h1>

      <button className="register-button" onClick={() => navigate('/register-user')}>+ Register New User</button>

      <div className="filters">
        <select className="custom-select" name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">Filter by Role</option>
          <option value="owner">Owner</option>
          <option value="frontoffice">Front Office</option>
          <option value="housekeeping">Housekeeping</option>
        </select>

        <select className="custom-select" name="propertyGroupId" value={filters.propertyGroupId} onChange={handleFilterChange}>
          <option value="">Filter by Property</option>
          {propertyGroups.map(pg => (
            <option key={pg._id} value={pg._id}>{pg.name}</option>
          ))}
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by name / email / phone"
          value={filters.search}
          onChange={handleFilterChange}
        />
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Property</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone || '-'}</td>
              <td>{u.role}</td>
              <td>{propertyGroups.find(p => p._id === (u.propertyGroupId?._id || u.propertyGroupId))?.name || '-'}</td>
              <td>
                <button onClick={() => openEdit(u)}>Edit</button>
                {u._id !== user._id && (
                  <button onClick={() => handleDelete(u._id)} className="delete-btn">Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="heading">
              <h2>Edit User</h2>
            </div>
            <label>Name</label>
            <input name="name" value={editData.name} onChange={handleEditChange} placeholder="Name" />
            <label>Email</label>
            <input name="email" value={editData.email} onChange={handleEditChange} placeholder="Email" />
            <label>Phone</label>
            <input name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Phone" />

            <label>Role</label>
            <select className="custom-select" name="role" value={editData.role} onChange={handleEditChange}>
              <option value="owner">Owner</option>
              <option value="frontoffice">Front Office</option>
              <option value="housekeeping">Housekeeping</option>
            </select>

            <label>Property Assigned</label>
            <select className="custom-select" name="propertyGroupId" value={editData.propertyGroupId} onChange={handleEditChange}>
              <option value="">No Property</option>
              {propertyGroups.map(pg => (
                <option key={pg._id} value={pg._id}>{pg.name}</option>
              ))}
            </select><br />

            <div className="buttons">
              <button className="modal-save-button" onClick={handleEditSubmit}>Save</button>
              <button className="modal-cancel-button" onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;