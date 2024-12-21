import express from 'express';
import { pool } from './db.js';

const router = express.Router();

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM registration');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add a new user
router.post('/users', async (req, res) => {
  const { firstname, lastname, email, phone, role } = req.body;
  const query =
    'INSERT INTO registration (firstname, lastname, email, phone, role) VALUES (?, ?, ?, ?, ?)';

  try {
    const [existingUser] = await pool.query(
      'SELECT email FROM registration WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: 'Email is already in use. Please use a unique email.' });
    }

    const [result] = await pool.execute(query, [
      firstname,
      lastname,
      email,
      phone,
      role,
    ]);
    res.status(201).json({
      id: result.insertId,
      firstname,
      lastname,
      email,
      phone,
      role,
      message: 'User added successfully',
    });
  } catch (error) {
    console.error('Error adding user:', error.message);
    res.status(500).json({ message: 'Error adding user. Please try again.' });
  }
});

// Update an existing user
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone, role } = req.body;
  const query =
    'UPDATE registration SET firstname = ?, lastname = ?, email = ?, phone = ?, role = ? WHERE id = ?';

  try {
    const [existingUser] = await pool.query(
      'SELECT email FROM registration WHERE email = ? AND id != ?',
      [email, id]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: 'Email is already in use. Please use a unique email.' });
    }

    const [result] = await pool.execute(query, [
      firstname,
      lastname,
      email,
      phone,
      role,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Error updating user. Please try again.' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      'DELETE FROM registration WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Error deleting user. Please try again.' });
  }
});

export default router;
