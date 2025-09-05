# Email Setup Guide for Password Reset

## Problem
The password reset functionality shows "Password reset email sent" but no emails are actually delivered. This is because Firebase's default email service isn't properly configured.

## Solution Options

### Option 1: Quick Fix - Use Gmail SMTP (Recommended for Testing)

1. **Install the new dependency**:
   ```bash
   npm install
   ```

2. **Set up Gmail App Password**:
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Generate an "App Password" for this application
   - Use this app password (not your regular Gmail password)

3. **Configure the email service**:
   - Edit `email-service.js`
   - Replace `your-email@gmail.com` with your Gmail address
   - Replace `your-app-password` with the Gmail App Password you generated

4. **Test the email service**:
   ```bash
   npm run test-email serena_oconnor@corkcity.ie
   ```

### Option 2: Use Cork City Council Email Server (Production)

1. **Get SMTP credentials** from your IT department:
   - SMTP server hostname
   - Port (usually 587 or 465)
   - Username and password
   - Whether SSL/TLS is required

2. **Update email-service.js**:
   - Comment out the Gmail configuration
   - Uncomment and configure the custom SMTP section
   - Update the host, port, and auth details

### Option 3: Fix Firebase Console Configuration

1. **Go to Firebase Console**:
   - Visit https://console.firebase.google.com/
   - Select your `gullytest3` project

2. **Configure Authentication**:
   - Go to Authentication → Settings → Authorized domains
   - Add your domain (or `localhost` for testing)

3. **Set up Email Templates**:
   - Go to Authentication → Templates
   - Configure the password reset email template
   - Make sure the "Action URL" points to your application

4. **Configure SMTP**:
   - Go to Authentication → Settings → SMTP configuration
   - Set up a custom SMTP server or use Firebase's default

## Integration with Your Application

To integrate the custom email service with your existing application:

1. **Create an API endpoint** (if you have a backend server)
2. **Or modify the frontend** to call the email service directly
3. **Update the forgot password handler** in `index.html`

## Testing

After setup, test the email service:

```bash
# Test with a specific email
npm run test-email serena_oconnor@corkcity.ie

# Or test directly with Node.js
node email-service.js serena_oconnor@corkcity.ie
```

## Troubleshooting

### Gmail Issues:
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check Gmail's "Less secure app access" settings

### SMTP Issues:
- Verify server hostname and port
- Check firewall settings
- Ensure credentials are correct
- Test with a simple email client first

### Firebase Issues:
- Check project permissions
- Verify authorized domains
- Ensure email templates are configured
- Check Firebase project quotas

## Security Notes

- Never commit email credentials to version control
- Use environment variables for sensitive data
- Consider using a dedicated email service (SendGrid, Mailgun, etc.) for production
- Implement rate limiting for password reset requests

## Next Steps

1. Choose one of the options above
2. Configure the email service
3. Test with a real email address
4. Update your application to use the new service
5. Monitor email delivery and user feedback
