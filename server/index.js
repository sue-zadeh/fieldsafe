const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'fieldbase',
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ message: 'Login successful', user: results[0] });
        } else {
            res.send({ message: 'Login failed' });
        }
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));
