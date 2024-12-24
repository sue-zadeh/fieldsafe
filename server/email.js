import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // the 16-char app password
  },
})

// Helper function if you want a quick way to send email:
export async function sendEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    })
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
