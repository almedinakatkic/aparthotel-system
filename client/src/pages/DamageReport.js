import React, { useState } from 'react';
import '../assets/styles/damageReport.css';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DamageReport = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    unitNumber: '',
    description: '',
    date: '',
    image: null
  });

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('unitNumber', formData.unitNumber);
      data.append('description', formData.description);
      data.append('date', formData.date);
      if (formData.image) {
        data.append('image', formData.image);
      }
      data.append('reportedBy', user._id);

      const response = await api.post('/damage-reports', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Damage report submitted successfully.');
      setFormData({ unitNumber: '', description: '', date: '', image: null });
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Error submitting damage report:', err);
      setMessage(err.response?.data?.message || 'Error submitting damage report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="damage-report-container">
      <h2>Damage Report</h2>
      {message && (
        <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <form className="damage-form" onSubmit={handleSubmit}>
        <label>
          Apartment Number:
          <input
            type="text"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date of Damage:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </label>

        <label>
          Image (optional):
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default DamageReport;