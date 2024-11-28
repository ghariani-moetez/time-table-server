const express = require('express');
const cors = require('cors'); // Import cors
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./sql');

const app = express();
const PORT = 5680;

app.use(bodyParser.json());
app.use(cors()); 


const JWT_SECRET = '12z53z4fz38fazd35az'; 

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword],
        (err) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              return reject({ status: 400, message: 'User already exists' });
            }
            return reject({ status: 500, message: 'Database error' });
          }
          resolve();
        }
      );
    });

    res.status(201).send('User registered successfully');
  } catch (err) {
    const status = err.status || 500;
    res.status(status).send(err.message || 'Server error');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {

    const results = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return reject({ status: 500, message: 'Database error' });
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = results[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    const status = err.status || 500; 
    res.status(status).send(err.message || 'Server error');
  }
});


app.listen(PORT, () => {
  console.log("connected")
});
