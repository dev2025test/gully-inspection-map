# Gully Inspection System

A web-based application for managing and inspecting gully assets with Firebase integration.

## Features

- User authentication with role-based access (Admin, Operator, Viewer)
- Interactive map interface using Leaflet
- KML file import for gully locations
- Photo upload capability
- Inspection history tracking
- Status-based filtering
- Data export (CSV and JSON)
- Real-time data synchronization

## Setup Instructions

1. **Firebase Setup**
   - Create a new Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Enable Storage
   - Replace the `firebaseConfig` in `index.html` with your own configuration

2. **User Setup**
   - Create users in Firebase Authentication
   - Set up user roles in the Realtime Database with this structure:
     ```json
     {
       "users": {
         "USER_UID": {
           "role": "admin"
         }
       }
     }
     ```
   - Available roles: "admin", "operator", "viewer"

3. **Deployment**
   - Host the files on any web server
   - Or use Firebase Hosting for easy deployment

## Usage

1. **Login**
   - Use your Firebase authentication credentials
   - Your role will determine available features

2. **Importing Gullies**
   - Admins can import KML files containing gully points
   - Click the "Import" button and select your KML file

3. **Inspecting Gullies**
   - Click any gully marker on the map
   - Fill in inspection details
   - Upload photos if needed
   - Save the inspection

4. **Managing Data**
   - Export data as CSV or JSON (Admin only)
   - Filter gullies by status
   - View inspection history
   - Delete gullies if needed (Admin only)

## File Structure

```
gully-inspection-system/
├── index.html          # Main application file
├── README.md           # Documentation
└── sample-data/        # Sample KML files (optional)
```

## Security Rules

Add these rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "gullies": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'operator'"
    }
  }
}
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Dependencies

- Leaflet.js for mapping
- Firebase SDK for database and authentication
- ToGeoJSON for KML parsing

## License

MIT License 