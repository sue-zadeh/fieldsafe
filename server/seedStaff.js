// import bcrypt from 'bcrypt'
// import mysql from 'mysql2/promise'
// import dotenv from 'dotenv'

// dotenv.config()

// async function seedStaff() {
//   const pool = mysql.createPool({
//     host: process.env.db_host,
//     user: process.env.db_user,
//     password: process.env.db_pass,
//     database: process.env.db_name,
//   })

//   try {
//     const firstname = 'Test'
//     const lastname = 'User'
//     const email = 'test.user@example.com'
//     const phone = '1234567890'
//     const role = 'Group Admin'
//     const plainPassword = 'Test@1234'

//     const hashedPassword = await bcrypt.hash(plainPassword, 10)

//     const sql = `
//       INSERT INTO staffs (firstname, lastname, email, phone, role, password)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `
//     const [result] = await pool.execute(sql, [
//       firstname,
//       lastname,
//       email,
//       phone,
//       role,
//       hashedPassword,
//     ])

//     console.log('Inserted staff with ID:', result.insertId)
//   } catch (err) {
//     console.error('Error inserting staff:', err)
//   } finally {
//     await pool.end()
//   }
// }

// seedStaff()
