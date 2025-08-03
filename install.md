# Quick Installation Guide

## 1. Prerequisites
- A Firebase account (free tier is sufficient)
- A web server or Firebase Hosting
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## 2. Quick Setup Steps

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable these services:
   - Authentication (Email/Password)
   - Realtime Database
   - Storage

### Configuration
1. In Firebase Console, go to Project Settings
2. Find your Firebase configuration (look for `firebaseConfig` object)
3. Open `index.html` and replace the existing `firebaseConfig` with yours
4. In Firebase Console:
   - Copy the database rules from `setup-firebase.js` to Realtime Database Rules
   - Copy the storage rules from `setup-firebase.js` to Storage Rules

### Create Admin User
1. In Firebase Console:
   - Go to Authentication
   - Add a new user with email/password
   - Copy the User UID
2. Go to Realtime Database
3. Create this data structure:
   ```json
   {
     "users": {
       "PASTE_USER_UID_HERE": {
         "role": "admin"
       }
     }
   }
   ```

### Deploy
1. Upload all files to your web server, OR
2. Deploy using Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy
   ```

## 3. Testing
1. Open the application URL
2. Log in with your admin credentials
3. Import the sample KML file from `sample-data/sample-gullies.kml`
4. Try creating an inspection for one of the gully points

## 4. Next Steps
- Create additional users (operators and viewers)
- Import your actual gully data
- Customize the map center coordinates in `index.html` if needed

For detailed documentation, see `README.md` 