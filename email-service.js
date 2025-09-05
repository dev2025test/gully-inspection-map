const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Load service account
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gullytest3-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

// Email configuration - you'll need to set these up
const EMAIL_CONFIG = {
  // Option 1: Gmail SMTP (recommended for testing)
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail
    pass: 'your-app-password'      // Replace with Gmail App Password
  },
  
  // Option 2: Custom SMTP (for production)
  // host: 'smtp.your-domain.com',
  // port: 587,
  // secure: false,
  // auth: {
  //   user: 'your-email@your-domain.com',
  //   pass: 'your-password'
  // }
};

// Create email transporter
const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

/**
 * Send password reset email using custom SMTP
 * @param {string} email - User's email address
 * @param {string} resetLink - Password reset link
 */
async function sendPasswordResetEmail(email, resetLink) {
  try {
    const mailOptions = {
      from: '"Cork City Council" <noreply@corkcity.ie>',
      to: email,
      subject: 'Password Reset - Asset Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
            <h1>Cork City Council</h1>
            <h2>Asset Management System (Roads)</h2>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h3>Password Reset Request</h3>
            <p>Hello,</p>
            <p>You have requested to reset your password for the Asset Management System.</p>
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #0056b3; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0056b3;">${resetLink}</p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              This email was sent from the Cork City Council Asset Management System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Cork City Council - Asset Management System (Roads)
        
        Password Reset Request
        
        Hello,
        
        You have requested to reset your password for the Asset Management System.
        
        Click this link to reset your password: ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
        
        ---
        This email was sent from the Cork City Council Asset Management System.
        Please do not reply to this email.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate password reset link using Firebase Admin
 * @param {string} email - User's email address
 */
async function generatePasswordResetLink(email) {
  try {
    // Generate password reset link
    const actionCodeSettings = {
      url: 'https://your-domain.com/reset-password', // Replace with your actual domain
      handleCodeInApp: false,
    };
    
    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    return resetLink;
  } catch (error) {
    console.error('Error generating password reset link:', error);
    throw error;
  }
}

/**
 * Complete password reset process
 * @param {string} email - User's email address
 */
async function sendPasswordReset(email) {
  try {
    // Check if user exists
    const user = await admin.auth().getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate reset link
    const resetLink = await generatePasswordResetLink(email);
    
    // Send email
    const result = await sendPasswordResetEmail(email, resetLink);
    
    if (result.success) {
      console.log(`Password reset email sent to ${email}`);
      return { success: true, message: 'Password reset email sent successfully' };
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error('Password reset failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendPasswordReset,
  sendPasswordResetEmail,
  generatePasswordResetLink
};

// CLI usage example
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node email-service.js <email>');
    process.exit(1);
  }
  
  sendPasswordReset(email)
    .then(result => {
      if (result.success) {
        console.log('✅', result.message);
      } else {
        console.log('❌', result.error);
      }
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
    });
}
