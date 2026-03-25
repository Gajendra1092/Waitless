require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WaitLess server!' });
});


app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
