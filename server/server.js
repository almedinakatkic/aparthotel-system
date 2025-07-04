const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const companyRoutes = require('./routes/companyRoutes');
app.use('/api/company', companyRoutes);
const propertyGroupRoutes = require('./routes/propertyGroupRoutes');
app.use('/api/property-group', propertyGroupRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const unitRoutes = require('./routes/unitRoutes');
app.use('/api/units', unitRoutes);
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);
const guestRoutes = require('./routes/guestRoutes');
app.use('/api/guests', guestRoutes);
const ownerRoutes = require('./routes/ownerRoutes');
app.use('/api/owner', ownerRoutes);
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);
const ownerNotesRoutes = require('./routes/ownerNotesRoutes');
app.use('/api/owner', ownerNotesRoutes);
const damageReportRoutes = require('./routes/damageReportRoutes');
app.use('/api/financial-reports', require('./routes/financialReportRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/damage-reports', damageReportRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Aparthotel backend is running 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
