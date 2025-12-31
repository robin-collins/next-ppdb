import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment from tpp.env (or .env if it exists)
const envFile = 'tpp.env';
if (fs.existsSync(envFile)) {
    console.log(`Loading environment from ${envFile}...`);
    dotenv.config({ path: envFile });
} else {
    console.log('tpp.env not found, using process environment...');
    dotenv.config();
}

const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@example.com',
};

console.log('SMTP Configuration (masked):');
console.log(`- Host: ${config.host}`);
console.log(`- Port: ${config.port}`);
console.log(`- User: ${config.user ? config.user.charAt(0) + '***' + config.user.slice(-2) : 'NOT SET'}`);
console.log(`- Pass: ${config.pass ? '****' : 'NOT SET'}`);
console.log(`- From: ${config.from}`);

async function testConnection() {
    const isSecure = config.port === 465 || process.env.SMTP_SECURE === 'true';
    console.log(`- Secure (Implicit TLS): ${isSecure}`);

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: isSecure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
        debug: true, // Enable debug output
        logger: true // Log to console
    });

    console.log('\nStarting connection verification...');
    try {
        await transporter.verify();
        console.log('\n✅ SUCCESS: SMTP connection verified!');

        // Optional: Send a test email
        if (process.env.DEVELOPER_NOTIFICATION_EMAIL) {
            console.log(`Sending test email to ${process.env.DEVELOPER_NOTIFICATION_EMAIL}...`);
            await transporter.sendMail({
                from: config.from,
                to: process.env.DEVELOPER_NOTIFICATION_EMAIL,
                subject: '[PPDB] Next.js Email Service Test',
                text: 'This is a test email from the Next.js email service verification script.',
            });
            console.log('✅ SUCCESS: Test email sent!');
        }
    } catch (error) {
        console.error('\n❌ FAILED: SMTP connection failed');
        console.error(error);
    }
}

testConnection();
