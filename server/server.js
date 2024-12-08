// Import necessary modules and packages
import express from 'express'
import mysql from 'mysql'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import cors from 'cors'
import bodyParser from 'body-parser'

// Load environment variables from .env file
dotenv.config()

// Initialize the Express application
const app = express()

// Configure middleware
app.use(cors({ origin: 'http://127.0.0.1:5173', credentials: true }))
app.use(bodyParser.json())

// Log environment variables (for debugging purposes)
console.log('Loaded environment variables:', {
  db_host: process.env.db_host,
  db_user: process.env.db_user,
  db_pass: process.env.db_pass,
  db_name: process.env.db_name,
})

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body)
  next()
})

// Set up the database connection
const db = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
})

// Connect to the database and log status
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
    process.exit(1)
  }
  console.log('Database connected!')
})

// Add API Router
const apiRouter = express.Router()
app.use('/api', apiRouter)

// Login route
apiRouter.post('/login', (req, res) => {
  console.log('Received login request:', req.body)

  const { username, password } = req.body
  const query = 'SELECT * FROM login WHERE username = ?'

  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' })

    if (results.length === 0) {
      console.warn(`Login failed for username: ${username}`)
      return res.status(401).send({ message: 'Invalid username or password' })
    }

    const user = results[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      console.warn(`Password mismatch for username: ${username}`)
      return res.status(401).send({ message: 'Invalid username or password' })
    }

    console.log(`Login successful for user: ${username}`)
    res.send({ message: 'Login successful', user })
  })
})

// Forgot password route
apiRouter.post('/forgot-password', (req, res) => {
  console.log('Received forgot-password request for email:', req.body.email)

  const { email } = req.body
  const query = 'SELECT * FROM login WHERE username = ?'

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' })

    if (results.length === 0) {
      console.warn(`Forgot-password failed for email: ${email}`)
      return res.status(404).send({ message: 'Email not found' })
    }

    const user = results[0]
    const newPassword = Math.random().toString(36).substring(2, 8)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const updateQuery = 'UPDATE login SET password = ? WHERE id = ?'
    db.query(updateQuery, [hashedPassword, user.id], (updateErr) => {
      if (updateErr)
        return res.status(500).send({ message: 'Could not update password' })

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Your new password is: ${newPassword}\n\nPlease log in with this password and reset it immediately.`,
      }

      transporter.sendMail(mailOptions, (emailErr) => {
        if (emailErr)
          return res.status(500).send({ message: 'Could not send email' })

        res.send({ message: 'Password reset email sent successfully' })
      })
    })
  })
})

// Catch-all route
app.use((req, res) => {
  console.warn(`Unhandled request to ${req.method} ${req.url}`)
  res.status(404).json({ error: 'Not Found' })
})

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000')
})
