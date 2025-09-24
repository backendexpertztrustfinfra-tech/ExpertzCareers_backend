// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },

    tls: {
        rejectUnauthorized: false // Add this for Render
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,// 60 seconds

    pool: true,            // production: use pooled connections
    maxConnections: 5,
    maxMessages: 100
});

// optional: verify config on startup
transporter.verify()
    .then(() => console.log('SMTP ready'))
    .catch(err => console.error('SMTP config error', err));

async function sendEmail({ to, subject, text, html, attachments }) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
        attachments // optional array
    };

    const info = await transporter.sendMail(mailOptions);
    return info; // contains messageId, accepted, rejected...
}

module.exports = { sendEmail, transporter };
