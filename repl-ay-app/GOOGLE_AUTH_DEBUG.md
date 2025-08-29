# 🔧 Google OAuth Troubleshooting Guide

## ✅ Current Status
- ✅ Environment variable created: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 
- ✅ App running on: http://localhost:3001
- ❌ Google OAuth configuration needs updating for port 3001

## 🚨 **IMMEDIATE FIX NEEDED**

### **Update Google Cloud Console URLs**

Your app is running on **port 3001**, but your Google OAuth configuration is likely set for port 3000.

**Go to Google Cloud Console > Credentials > Your OAuth Client:**

**Authorized JavaScript Origins:**
```
http://localhost:3000
http://localhost:3001
```

**Authorized Redirect URIs:**
```
http://localhost:3000
http://localhost:3001
```

## 🐛 **Debugging Steps**

### **Step 1: Check Browser Console**
1. Open your app: http://localhost:3001
2. Open Developer Tools (F12)
3. Click Google Sign-In button
4. Check Console tab for errors

### **Step 2: Common Error Messages & Solutions**

**Error: "popup_closed_by_user"**
- ✅ Solution: User cancelled - this is normal

**Error: "Invalid client ID"**
- ❌ Check: Client ID in `.env.local` matches Google Console
- ❌ Check: No extra spaces or characters

**Error: "Not a valid origin for the client"**
- ❌ Check: Port 3001 added to Google Console
- ❌ Check: Using exact URL (http://localhost:3001)

**Error: "Popup blocked"**
- ❌ Check: Allow popups in browser settings

## 🔍 **Debug Information**

The updated AuthModal now includes console logging. Check browser console for:
- "Google Client ID: Found/Missing"
- "Google Identity Services loaded" 
- "Google OAuth callback received"
- Any error messages

## 📋 **Quick Verification Checklist**

1. ✅ `.env.local` file exists in `/repl-ay-app/`
2. ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` starts with your project number
3. ❌ **ADD PORT 3001** to Google Cloud Console
4. ❌ Clear browser cache and cookies
5. ❌ Test in incognito mode

## 🚀 **Test Commands**

```powershell
# Stop current server
# Ctrl+C in terminal

# Start on specific port 3000 (to match Google config)
cd "C:\Users\Spectrum\Documents\PROG\REPL-ay\repl-ay-app"
$env:PORT = "3000"; npm run dev
```

## 📱 **Mobile Testing**
For mobile testing, you'll also need:
- Your computer's IP address in Google Console
- Example: `http://192.168.1.100:3000`

---

**Next Step:** Add port 3001 to Google Cloud Console, then test the login! 🚀