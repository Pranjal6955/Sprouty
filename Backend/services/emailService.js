const nodemailer = require('nodemailer');

/**
 * Configuration for email transport
 * In production, replace with actual SMTP credentials
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body (optional)
 */
exports.sendEmail = async (to, subject, text, html = '') => {
  try {
    if (!process.env.EMAIL_FROM) {
      console.warn('EMAIL_FROM environment variable not set. Using default sender.');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Sprouty <no-reply@sprouty.app>',
      to,
      subject,
      text,
      html: html || text // Use text as HTML if no HTML provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a plant care reminder email
 * @param {string} to - User's email address
 * @param {object} reminder - Reminder object
 * @param {object} plant - Plant object
 */
exports.sendReminderEmail = async (to, reminder, plant) => {
  const subject = `Reminder: Time to ${reminder.type} your ${plant.name}`;
  
  const text = `
    Hello Plant Lover!
    
    This is a reminder to ${reminder.type} your ${plant.name}.
    
    Plant Details:
    - Name: ${plant.name}
    - Location: ${plant.location || 'Not specified'}
    
    Happy Gardening!
    The Sprouty Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello Plant Lover!</h2>
      <p>This is a reminder to <strong>${reminder.type}</strong> your <strong>${plant.name}</strong>.</p>
      
      <h3>Plant Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${plant.name}</li>
        <li><strong>Location:</strong> ${plant.location || 'Not specified'}</li>
      </ul>
      
      ${plant.mainImage ? `<img src="${plant.mainImage}" alt="${plant.name}" style="max-width: 100%; border-radius: 8px;">` : ''}
      
      <p>Happy Gardening!<br>The Sprouty Team</p>
    </div>
  `;
  
  return await exports.sendEmail(to, subject, text, html);
};
