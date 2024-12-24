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
  
  {
    firstname: 'Dave',
    lastname: 'Sharp',
    username: 'dsharp@cvnz.org.nz',
    password: 'Ausnew#2021!',
    role: 'Admin',
  },
  {
    firstname: 'Sue',
    lastname: 'Zadeh',
    username: 'suezadeh.a@gmail.com',
    password: '123Adminzx.',
    role: 'Admin',
  },
  {
    firstname: 'john',
    lastname: 'Doe',
    username: 'admin1@example.com',
    password: '123Adminzx.',
    role: 'Admin',
  },
  {
    firstname: 'Helen',
    lastname: 'voly',
    username: 'admin2@example.com',
    password: '123Adminzx.',
    role: 'Admin',
  },
  {
    firstname: 'Bill',
    lastname: 'Hey',
    username: 'admin3@example.com',
    password: '123Adminzx.',
    role: 'Admin',
  },
]

users.forEach(async (user) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    const query = `
      INSERT INTO login (firstname, lastname, username, password, role) 
      VALUES (?, ?, ?, ?, ?)
    `

    db.query(
      query,
      [
        user.firstname.trim(),
        user.lastname.trim(),
        user.username.trim(),
        hashedPassword,
        user.role,
      ],
      (err) => {
        if (err) {
          console.error(`Error inserting user ${user.username}:`, err)
        } else {
          console.log(`User ${user.username} inserted successfully.`)
        }
      }
    )
  } catch (err) {
    console.error(`Error hashing password for ${user.username}:`, err)
  }
})

// Close the connection after a short delay to ensure all inserts are done
setTimeout(() => db.end(), 5000)
