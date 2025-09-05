# Firebase Permission Error Fix

## Problem
You're getting `permission_denied` errors when trying to access audit logs because the Firebase security rules are too restrictive.

## Immediate Solution

### Option 1: Update Firebase Rules (Recommended)
Go to Firebase Console and update the security rules:

1. Go to https://console.firebase.google.com/
2. Select your `gullytest3` project
3. Go to Realtime Database → Rules
4. Replace the current rules with these more permissive ones:

```json
{
  "rules": {
    ".read": "auth != null",
    "gullies": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$gullyId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "inspections": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "playgrounds": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "walkways": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "signage": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "lining": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "audit_log": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "user_logs": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "gully_history": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$gullyId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### Option 2: Temporary Workaround
The application has been updated to handle permission errors gracefully. It will:
- Show a helpful error message when audit history can't be accessed
- Continue working normally for other functions
- Allow new audit entries to be created

## Root Cause
The original rules were trying to check user roles from the database, but:
1. The service account key may be expired
2. Users might not exist in the database
3. The role lookup was failing

## Long-term Solution
1. Fix the service account key issue
2. Ensure all users are properly set up in the database
3. Implement proper role-based access control

## Testing
After updating the rules:
1. Refresh your application
2. Try accessing the audit history
3. The permission error should be resolved
