const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripsRouter = require('./routes/tripRoutes');
const accessRoutes = require('./routes/accessRoutes'); 
const blogsRouter = require('./routes/blogsroutes');
const earningsRoutes = require('./routes/earningsRoutes');
const driverRideRoutes = require('./routes/driverRideRoutes');


const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173'
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);

app.use('/api/trips', tripsRouter); 

app.use('/api/access-control', accessRoutes);
app.use('/api/blogs', blogsRouter);
app.use('/api/earnings', earningsRoutes);

app.use('/api/ride', driverRideRoutes)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
