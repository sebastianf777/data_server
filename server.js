const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');  // Import CORS

// Set up Express
const app = express();
app.use(bodyParser.json());

// Allow CORS for all origins temporarily (for testing purposes)
app.use(cors());

// Set up SQLite database
const db = new sqlite3.Database('./ip_data.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the database');
    db.run(`
      CREATE TABLE IF NOT EXISTS ip_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prefix TEXT,
        ip TEXT,
        timestamp TEXT
      )
    `);
  }
});

// API endpoint to receive IP data
app.post('/api/store-ip', (req, res) => {
  console.log('Received request to /api/store-ip with data:', req.body);
  const { prefix, ip, timestamp } = req.body;
  if (prefix && ip && timestamp) {
    db.run(
      'INSERT INTO ip_log (prefix, ip, timestamp) VALUES (?, ?, ?)',
      [prefix, ip, timestamp],
      (err) => {
        if (err) {
          console.error('Error storing IP in database', err);
          res.status(500).json({ message: 'Database error' });
        } else {
          res.status(200).json({ message: 'IP stored successfully' });
        }
      }
    );
  } else {
    res.status(400).json({ message: 'Invalid request' });
  }
});


// API endpoint to retrieve stored IP data
app.get('/api/get-ips', (req, res) => {
  db.all('SELECT * FROM ip_log', [], (err, rows) => {
    if (err) {
      console.error('Error fetching IPs from database', err);
      res.status(500).json({ message: 'Database error' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
