import bcrypt from 'bcrypt'
import mysql from 'mysql'
import dotenv from 'dotenv'

dotenv.config()

const db = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
})

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
    process.exit(1)
  }
  console.log('Database connected for seeding!')
})

const users = [
  { username: 'admin 1', password: '123Adminzx.', role: 'Admin' },
  { username: 'admin 2', password: '123Adminzx.', role: 'Admin' },
  { username: 'admin 3', password: '123Adminzx.', role: 'Admin' },
]

users.forEach(async (user, index) => {
  const hashedPassword = await bcrypt.hash(user.password, 10)
  const query = 'INSERT INTO login (username, password, role) VALUES (?, ?, ?)'
  db.query(query, [user.username, hashedPassword, user.role], (err) => {
    if (err) console.error(`Error inserting user ${user.username}:`, err)
    else console.log(`User ${user.username} inserted successfully.`)
  })
})

// Close the connection after all users are inserted
setTimeout(() => db.end(), 5000)
