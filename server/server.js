const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer') // For sending emails

const app = express()
app.use(cors({ origin: 'http://127.0.0.1:5173', credentials: true }))
app.use(bodyParser.json())

const db = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
})

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
    process.exit(1) // Stop the server if the database connection fails
  }
  console.log('Database connected!')
})

// Hashing passwords dynamically for better scalability
const hashPasswords = async (passwords) => {
  for (let i = 0; i < passwords.length; i++) {
    const hash = await bcrypt.hash(passwords[i], 10)
    const query = `UPDATE login SET password = ? WHERE id = ?`
    db.query(query, [hash, i + 1], (err) => {
      if (err) console.error(err)
    })
  }
  console.log('Passwords updated')
}

// Route for login
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const query = 'SELECT * FROM login WHERE username = ?'
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' })
    if (results.length === 0) {
      return res.status(401).send({ message: 'Invalid username or password' })
    }

    const user = results[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid username or password' })
    }

    res.send({ message: 'Login successful', user })
  })
})

// Forgot Password Route
app.post('/forgot-password', (req, res) => {
  const { email } = req.body
  const query = 'SELECT * FROM login WHERE username = ?'
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' })
    if (results.length === 0) {
      return res.status(404).send({ message: 'Email not found' })
    }

    const user = results[0]
    const newPassword = Math.random().toString(36).substring(2, 8) // Generate random password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in the database
    const updateQuery = 'UPDATE login SET password = ? WHERE id = ?'
    db.query(updateQuery, [hashedPassword, user.id], (updateErr) => {
      if (updateErr)
        return res.status(500).send({ message: 'Could not update password' })

      // Send email
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER, // Use email from .env
          pass: process.env.EMAIL_PASS, // Use password from .env
        },
      })

      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your new password',
        text: `Your new password is: ${newPassword}`,
      }

      transporter.sendMail(mailOptions, (emailErr) => {
        if (emailErr)
          return res.status(500).send({ message: 'Could not send email' })
        res.send({ message: 'Password reset email sent successfully' })
      })
    })
  })
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})
