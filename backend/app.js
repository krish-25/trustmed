require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/stock', require('./routes/stockRoutes'));
app.use('/sales', require('./routes/salesRoutes'));
app.use('/patients', require('./routes/patientRoutes'));
app.use('/records', require('./routes/recordRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));