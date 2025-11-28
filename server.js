const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');


dotenv.config();

connectDB();

const app = express();

app.use(express.json()); 
app.use(cors()); 


app.use('/api/auth', authRoutes);       
app.use('/api/products', productRoutes);  
app.use('/api/orders', orderRoutes);     
app.use('/api/payments', paymentRoutes); 
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes); 


app.use('/api/admin', authMiddleware, (req, res) => {
  if (req.user.role === 'admin') {
    res.status(200).json({ message: 'Admin access granted' });
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
