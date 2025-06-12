const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['cleaning', 'maintenance'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending'
  },
  propertyGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyGroup',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
